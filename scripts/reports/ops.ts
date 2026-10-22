/**
 * Operations collector.
 *
 * Deterministic. Runs local commands and HTTP checks, then writes JSON for
 * PULSE to interpret. No model involved, so running this costs nothing and it
 * can be re-run freely while debugging.
 *
 * Vercel deployment state, runtime errors, and log counts are deliberately
 * absent: those come from MCP tools, which a Node process cannot reach. PULSE
 * gathers them itself and merges them with this file.
 *
 * One database read: head:true counts of zero-amount coupon unlocks in the
 * payments ledger (lib/reports/zeroAmountUnlocks.ts). Counts only — no rows.
 * If .env.reports.local is missing or the count fails, those rows read
 * `not read` and the rest of the run is unaffected.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { diffMetrics, renderMetricsTable, type Metric } from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { readPreviousRun } from "../../lib/reports/previousRun";
import {
  COUPON_LINK_PREFIX,
  ZERO_AMOUNT_WINDOW_DAYS,
  zeroAmountMetrics,
  zeroAmountSignal,
  type ZeroAmountCounts,
} from "../../lib/reports/zeroAmountUnlocks";
import { countRows, loadReportsEnv, reportsClient } from "./supabaseClient";

const PRODUCTION = "https://survival-kit-app.vercel.app";
const ROUTES = ["/", "/login", "/year", "/for-blocks"];
const CACHE_CANARY = "/for-blocks";
const REPO_ROOT = join(__dirname, "..", "..");

interface RouteCheck {
  path: string;
  status: number | null;
  seconds: number | null;
}

interface CacheCheck {
  path: string;
  vercelCache: string | null;
  cacheControl: string | null;
}

interface CommandResult {
  name: string;
  ok: boolean;
  ms: number;
}

/** Runs a command, capturing whether it succeeded and how long it took. */
function runCommand(name: string, file: string, args: string[]): CommandResult {
  const started = Date.now();
  try {
    execFileSync(file, args, { cwd: REPO_ROOT, stdio: "pipe" });
    return { name, ok: true, ms: Date.now() - started };
  } catch {
    return { name, ok: false, ms: Date.now() - started };
  }
}

/** Captures stdout, returning empty string on failure rather than throwing. */
function capture(file: string, args: string[]): string {
  try {
    return execFileSync(file, args, { cwd: REPO_ROOT, stdio: "pipe" }).toString();
  } catch (error) {
    // npm outdated exits non-zero when anything is outdated, which is the
    // normal case — its stdout is still the answer we want.
    const stdout = (error as { stdout?: Buffer }).stdout;
    return stdout ? stdout.toString() : "";
  }
}

function checkRoute(path: string): RouteCheck {
  const output = capture("curl", [
    "-s", "-o", "/dev/null",
    "-w", "%{http_code} %{time_total}",
    "-L", "--max-time", "25",
    `${PRODUCTION}${path}`,
  ]);
  const [status, seconds] = output.trim().split(" ");
  return {
    path,
    status: status ? Number(status) : null,
    seconds: seconds ? Number(seconds) : null,
  };
}

function checkCache(path: string): CacheCheck {
  const headers = capture("curl", [
    "-s", "-D", "-", "-o", "/dev/null",
    "--max-time", "25",
    `${PRODUCTION}${path}`,
  ]);

  const find = (name: string): string | null => {
    const match = headers.match(new RegExp(`^${name}:\\s*(.+)$`, "im"));
    return match ? match[1].trim() : null;
  };

  return {
    path,
    vercelCache: find("x-vercel-cache"),
    cacheControl: find("cache-control"),
  };
}

function outdatedPackages(): string[] {
  const raw = capture("npm", ["outdated", "--json"]);
  if (!raw.trim()) return [];
  try {
    return Object.keys(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return [];
  }
}

function migrationInventory(): { count: number; latest: string | null } {
  try {
    const files = readdirSync(join(REPO_ROOT, "supabase", "migrations"))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    return { count: files.length, latest: files.at(-1) ?? null };
  } catch {
    return { count: 0, latest: null };
  }
}

/**
 * Counts free coupon unlocks (amount 0, link id `coupon:%`) in the last
 * window and all time. Degrades to nulls rather than failing the run: ops
 * health must still be reported when the ledger cannot be reached.
 */
async function zeroAmountCounts(now: Date): Promise<{ counts: ZeroAmountCounts; error: string | null }> {
  try {
    loadReportsEnv();
    const client = reportsClient();
    const since = new Date(now.getTime() - ZERO_AMOUNT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const freeUnlocks = (query: any) =>
      query.eq("amount", 0).like("paymongo_link_id", `${COUPON_LINK_PREFIX}%`);
    const [lastWindow, allTime] = await Promise.all([
      countRows(client, "payments", (q) => freeUnlocks(q).gte("paid_at", since.toISOString())),
      countRows(client, "payments", freeUnlocks),
    ]);
    const error = lastWindow === null || allTime === null ? "payments count unavailable" : null;
    return { counts: { lastWindow, allTime }, error };
  } catch (error) {
    return {
      counts: { lastWindow: null, allTime: null },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main(): Promise<void> {
  const started = Date.now();

  // No local build. `npm run build` needs Supabase credentials that .env.local
  // deliberately does not carry, so it fails locally every time and would
  // report a permanent false FAIL. Vercel builds every push with real env vars
  // — PULSE reads that authoritative result via list_deployments.
  const commands = [
    runCommand("tests", "npm", ["test"]),
    runCommand("typecheck", "npm", ["run", "typecheck"]),
    runCommand("lint", "npm", ["run", "lint"]),
  ];

  const routes = ROUTES.map(checkRoute);
  const cache = checkCache(CACHE_CANARY);
  const outdated = outdatedPackages();
  const migrations = migrationInventory();
  const zeroAmount = await zeroAmountCounts(new Date());
  const freeUnlocks = zeroAmountSignal(zeroAmount.counts);

  const metrics: Metric[] = [
    ...routes.map((route) => ({
      label: `Live URL ${route.path}`,
      value: route.status,
    })),
    { label: "Page cache /for-blocks", value: cache.vercelCache },
    ...commands.map((command) => ({
      label: command.name.charAt(0).toUpperCase() + command.name.slice(1),
      value: command.ok ? "pass" : "FAIL",
    })),
    { label: "Test suite time", value: Math.round(commands[0].ms / 1000), unit: "s" },
    { label: "Outdated packages", value: outdated.length },
    { label: "Migration files", value: migrations.count },
    ...zeroAmountMetrics(freeUnlocks),
    // Read by eye at vercel.com/lauurnces-projects/~/usage. Never estimated.
    { label: "Active CPU / 4h", value: null },
  ];

  const collectMs = Date.now() - started;
  // Manila calendar date, not UTC: PULSE (Task 5) reads this filename back
  // with `$(date +%F)` in Asia/Manila (UTC+8). Between midnight and 8am
  // Manila, UTC and PH are on different calendar days — using UTC here would
  // make PULSE look for a file this script never wrote. Do not "simplify"
  // this to toISOString().slice(0, 10).
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const outDir = join(REPO_ROOT, "docs", "reports", "ops", ".data");
  mkdirSync(outDir, { recursive: true });

  const outFilename = `${date}.json`;
  const previous = readPreviousRun(outDir, outFilename);
  const rows = diffMetrics(metrics, previous?.metrics ?? null);
  // The collector renders the finished table so PULSE can paste it verbatim
  // and never touch a number — every figure in the report traces back to
  // this tested code, not to the agent's own arithmetic.
  const table = renderMetricsTable(rows, "HEALTH", { now: "TODAY", previous: "YESTERDAY" });

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    metrics,
    previousDate: previous?.key ?? null,
    table,
    raw: {
      routes,
      cache,
      outdated,
      migrations,
      freeUnlocks: { ...freeUnlocks, error: zeroAmount.error },
    },
  };

  // A second run today would land on the same filename. Displace the earlier
  // run instead of overwriting it, so a report already published from it can
  // still be checked against the numbers it actually cited.
  const superseded = archiveExistingRun(outDir, outFilename);

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
  if (superseded) {
    console.log(`superseded earlier run today -> ${superseded}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
