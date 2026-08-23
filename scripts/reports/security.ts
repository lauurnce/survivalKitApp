/**
 * Security collector.
 *
 * Deterministic and credential-free. Reads repository source, parses the
 * migrations, shells out to npm and git, hands every judgement to a tested
 * pure function in lib/reports/, and writes JSON for WARDEN to interpret. No
 * model is involved, so this costs nothing and can be re-run freely while
 * debugging.
 *
 * There is no Supabase client here, and there must not be one. Growth and
 * Finance need production credentials; Security answers every one of its
 * questions from the repository as it stands. Adding database access would
 * give this process a capability it has no reason to hold, on top of being a
 * decision worth making in the open rather than in an import list.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not.
 * Everything below is synchronous and main() is called at the bottom.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { diffMetrics, renderMetricsTable, type Metric } from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { readPreviousRun } from "../../lib/reports/previousRun";

import { buildSchema, type MigrationFile } from "../../lib/reports/migrationSchema";
import { assessRls, renderRlsTable, rlsSummaryLine, TABLE_DATA_CLASS } from "../../lib/reports/rlsPosture";
import {
  erasureResidue,
  extractDeletionTargets,
  inventoryIdentityTables,
  privacySummaryLine,
  renderPrivacyTable,
  RETENTION_REGISTER,
} from "../../lib/reports/privacyPosture";
import {
  classifyRoute,
  cookieScopeConflicts,
  crossReferenceRoutes,
  middlewareCoverage,
  renderRouteGuardTable,
  routeSummaryLine,
  ROUTE_EXPECTATIONS,
} from "../../lib/reports/routeGuards";
import {
  assessSecrets,
  clientReachable,
  ENV_CLASS,
  parseEnvExample,
  renderSecretsTable,
  scanEnvUsage,
  secretsSummaryLine,
} from "../../lib/reports/secretsPosture";
import {
  classifyInstallScripts,
  lockfileIntegrity,
  newDirectDependencies,
  renderSupplyChainTable,
  summarizeAudit,
  supplyChainSummaryLine,
} from "../../lib/reports/supplyChain";
import {
  assessExecutors,
  baselineSummaryLine,
  CONTROLS,
  evaluateControls,
  renderControlTable,
  renderExecutorTable,
} from "../../lib/reports/securityBaseline";
import {
  assessDetection,
  detectionSummaryLine,
  DETECTION_MATRIX,
  renderDetectionTable,
} from "../../lib/reports/detectionCoverage";

const REPO_ROOT = join(__dirname, "..", "..");
const SOURCE_ROOTS = ["app", "lib", "components", "scripts", "middleware.ts", "next.config.ts"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs"];

/**
 * Paths checked for ignore status. Real files on disk are checked too, but
 * these pattern-level paths are checked whether or not they exist: a fresh
 * clone carries no .env.local, and "found no files" must never render as
 * "every file is ignored".
 */
const ENV_PATHS = [".env", ".env.local", ".env.production", ".env.reports.local"];

/** Captures stdout, returning null on failure rather than throwing. */
function capture(file: string, args: string[]): string | null {
  try {
    return execFileSync(file, args, { cwd: REPO_ROOT, stdio: "pipe", maxBuffer: 32 * 1024 * 1024 })
      .toString();
  } catch (error) {
    // npm audit exits non-zero whenever it finds anything, exactly as npm
    // outdated does — its stdout is still the answer. Genuine failures give
    // no usable stdout, and summarizeAudit turns that into null counts rather
    // than a zero. A zero here would read as an all-clear.
    const stdout = (error as { stdout?: Buffer }).stdout;
    const text = stdout ? stdout.toString() : "";
    return text.trim() ? text : null;
  }
}

/** True when git ignores `path`, whether or not it exists on disk. */
function isIgnored(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", "--no-index", path], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function walk(path: string, out: string[] = []): string[] {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (!stats) return out;
  if (stats.isFile()) {
    if (SOURCE_EXTENSIONS.some((ext) => path.endsWith(ext))) out.push(path);
    return out;
  }
  for (const entry of readdirSync(path)) walk(join(path, entry), out);
  return out;
}

/** Repo-relative module path → source, for every file the checks read. */
function readSourceTree(): Record<string, string> {
  const sources: Record<string, string> = {};
  for (const root of SOURCE_ROOTS) {
    for (const file of walk(join(REPO_ROOT, root))) {
      sources[relative(REPO_ROOT, file).split(sep).join("/")] = readFileSync(file, "utf8");
    }
  }
  return sources;
}

function readMigrations(): MigrationFile[] {
  const dir = join(REPO_ROOT, "supabase", "migrations");
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));
  } catch {
    return [];
  }
}

/** Every app/api/**\/route.ts as a URL path plus its source. */
function readRoutes(): { path: string; source: string }[] {
  const apiDir = join(REPO_ROOT, "app", "api");
  const files: string[] = [];
  const collect = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) collect(full);
      else if (entry === "route.ts") files.push(full);
    }
  };
  try {
    collect(apiDir);
  } catch {
    return [];
  }
  return files
    .map((file) => ({
      path: `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`,
      source: readFileSync(file, "utf8"),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** The middleware matcher, or null when it cannot be located. */
function readMiddlewareMatcher(sources: Record<string, string>): string | null {
  const source = sources["middleware.ts"];
  if (!source) return null;
  const match = /matcher:\s*\[\s*["']([^"']+)["']/.exec(source);
  return match ? match[1] : null;
}

/** Direct dependency names from package.json, both trees, sorted. */
function directDependencies(): string[] {
  try {
    const manifest = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ].sort();
  } catch {
    return [];
  }
}

/** Last run's direct-dependency list, via the key readPreviousRun chose. */
function previousDependencies(outDir: string, key: string | null): string[] | null {
  if (!key) return null;
  try {
    const parsed = JSON.parse(readFileSync(join(outDir, `${key}.json`), "utf8")) as {
      raw?: { directDependencies?: unknown };
    };
    const list = parsed.raw?.directDependencies;
    return Array.isArray(list) ? (list as string[]) : null;
  } catch {
    return null;
  }
}

/** A boolean rendered for a metric row. Null stays null — "not read". */
const yesNo = (value: boolean | null): string | null =>
  value === null ? null : value ? "yes" : "NO";

function main(): void {
  const started = Date.now();

  const sources = readSourceTree();
  const migrations = readMigrations();
  const schema = buildSchema(migrations);

  // ── Database and RLS posture (Tasks 1–3) ────────────────────────────────
  const rls = assessRls(schema, TABLE_DATA_CLASS);

  // ── Privacy (Task 4) ────────────────────────────────────────────────────
  const deleteAccountSource = sources["lib/deleteAccount.ts"] ?? "";
  const identityTables = inventoryIdentityTables(schema);
  const knownTables = new Set(schema.map((table) => table.name));
  const deletionTargets = extractDeletionTargets(deleteAccountSource).filter((name) =>
    knownTables.has(name)
  );
  const residue = erasureResidue(identityTables, deletionTargets, RETENTION_REGISTER);

  // ── Route guards and rate limiting (Task 5) ─────────────────────────────
  const routes = readRoutes().map((route) => classifyRoute(route.path, route.source));
  const routeAssessments = crossReferenceRoutes(routes, ROUTE_EXPECTATIONS);
  const matcher = readMiddlewareMatcher(sources);
  const coverage = matcher ? middlewareCoverage(matcher, routes.map((route) => route.path)) : [];
  // The admin session cookie's own path against the paths middleware enforces.
  const adminCookiePath =
    /path:\s*["']([^"']+)["']/.exec(sources["lib/auth/adminSession.ts"] ?? "")?.[1] ?? "/";
  const cookieConflicts = cookieScopeConflicts(adminCookiePath, ["/admin", "/api/admin"]);

  // ── Secrets (Task 6) ────────────────────────────────────────────────────
  const envExample = sources[".env.example"] ?? readFileSync(join(REPO_ROOT, ".env.example"), "utf8");
  const envUsage = Object.fromEntries(
    Object.entries(sources).map(([file, source]) => [file, scanEnvUsage(source)])
  );
  const realEnvFiles = readdirSync(REPO_ROOT).filter((name) => name.startsWith(".env"));
  const envFilesIgnored = [...ENV_PATHS, ...realEnvFiles]
    .filter((name) => name !== ".env.example")
    .every(isIgnored);
  const secrets = assessSecrets({
    declared: parseEnvExample(envExample),
    usage: envUsage,
    clientFiles: clientReachable(sources),
    envFilesIgnored,
    registry: ENV_CLASS,
  });

  // ── Supply chain (Task 7) ───────────────────────────────────────────────
  const audit = summarizeAudit(capture("npm", ["audit", "--json"]));
  const installScripts = classifyInstallScripts(
    capture("npm", [
      "query",
      ":attr(scripts, [postinstall]), :attr(scripts, [preinstall]), :attr(scripts, [install])",
      "--json",
    ])
  );
  const lockfile = lockfileIntegrity(
    existsSync(join(REPO_ROOT, "package-lock.json"))
      ? readFileSync(join(REPO_ROOT, "package-lock.json"), "utf8")
      : null
  );
  const deps = directDependencies();

  // ── Controls and executors (Task 8) ─────────────────────────────────────
  // Controls read migrations and .env.example as well as source, so the map
  // handed to evaluateControls is wider than the source tree.
  const controlSources: Record<string, string | null> = { ...sources, ".env.example": envExample };
  for (const migration of migrations) {
    controlSources[`supabase/migrations/${migration.name}`] = migration.sql;
  }
  const controlResults = evaluateControls(controlSources, CONTROLS);
  const executorResults = assessExecutors(controlResults);

  // ── Detection coverage (Task 9) ─────────────────────────────────────────
  const detectionSources: Record<string, string | null> = { ...controlSources };
  for (const probeFile of DETECTION_MATRIX.flatMap((entry) => entry.probes.map((p) => p.file))) {
    if (probeFile in detectionSources) continue;
    try {
      detectionSources[probeFile] = readFileSync(join(REPO_ROOT, probeFile), "utf8");
    } catch {
      detectionSources[probeFile] = null;
    }
  }
  const detection = assessDetection(detectionSources, DETECTION_MATRIX);

  // ── Metrics ─────────────────────────────────────────────────────────────
  // Every label is 30 characters or fewer: renderMetricsTable pads the label
  // column to exactly 30, and a longer label pushes that row's value columns
  // out of alignment while every other row stays straight — the kind of
  // cosmetic drift nobody bothers to report.
  const metrics: Metric[] = [
    { label: "RLS tables", value: rls.length },
    { label: "RLS gaps", value: rls.filter((row) => row.verdict === "gap").length },
    { label: "RLS review items", value: rls.filter((row) => row.verdict === "review").length },
    {
      label: "Tables unregistered",
      value: rls.filter((row) => row.dataClass === "UNREGISTERED").length,
    },

    { label: "API routes", value: routeAssessments.length },
    {
      label: "Routes missing a guard",
      value: routeAssessments.filter((row) => row.missing.length > 0).length,
    },
    { label: "Routes unclassified", value: routeAssessments.filter((row) => row.unclassified).length },
    {
      label: "Routes with shared limiter",
      value: routes.filter((route) => route.rateLimitScope === "shared").length,
    },
    {
      label: "Routes with local limiter",
      value: routes.filter((route) => route.rateLimitScope === "per-instance").length,
    },
    { label: "Middleware-covered routes", value: coverage.filter((row) => row.covered).length },
    { label: "Cookie scope conflicts", value: cookieConflicts.length },

    { label: "Identity tables", value: identityTables.length },
    { label: "Erasure residue tables", value: residue.length },

    { label: "Env vars in use", value: secrets.rows.length },
    {
      label: "Secrets client-reachable",
      value: secrets.issues.filter((issue) => issue.kind === "client-reachable").length,
    },
    {
      label: "Env vars unclassified",
      value: secrets.issues.filter((issue) => issue.kind === "unclassified").length,
    },
    {
      label: "Env vars undocumented",
      value: secrets.issues.filter((issue) => issue.kind === "undocumented").length,
    },
    { label: "Env files ignored", value: yesNo(envFilesIgnored) },

    // Null, not zero, whenever the audit did not produce a usable report.
    { label: "Advisories total", value: audit.counts?.total ?? null },
    {
      label: "Advisories high/critical",
      value: audit.counts ? audit.counts.high + audit.counts.critical : null,
    },
    { label: "Direct deps with advisory", value: audit.readable ? audit.directAdvisories.length : null },
    { label: "Direct dependencies", value: deps.length },
    {
      label: "Install-script packages",
      value: installScripts.readable
        ? installScripts.approved.length + installScripts.unapproved.length
        : null,
    },
    {
      label: "Unapproved install scripts",
      value: installScripts.readable ? installScripts.unapproved.length : null,
    },
    {
      label: "Lockfile entries unhashed",
      value: lockfile.readable ? (lockfile.installable as number) - (lockfile.hashed as number) : null,
    },

    { label: "Controls holding", value: controlResults.filter((r) => r.state === "present").length },
    { label: "Controls missing", value: controlResults.filter((r) => r.state === "MISSING").length },
    { label: "Controls unknown", value: controlResults.filter((r) => r.state === "unknown").length },
    {
      label: "Executor bounds holding",
      value: executorResults.reduce((sum, row) => sum + row.holding, 0),
    },

    { label: "Escalations covered", value: detection.filter((r) => r.coverage === "covered").length },
    { label: "Escalations blind", value: detection.filter((r) => r.coverage === "BLIND").length },
  ];

  const collectMs = Date.now() - started;

  // Manila calendar date, not UTC. WARDEN reads this filename back with
  // `TZ=Asia/Manila date +%F`; between midnight and 8am Manila the two
  // calendars disagree and UTC would name a file the agent never looks for.
  // Do not "simplify" this to toISOString().slice(0, 10).
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const outDir = join(REPO_ROOT, "docs", "reports", "security", ".data");
  mkdirSync(outDir, { recursive: true });

  const outFilename = `${date}.json`;
  // Displace an earlier run today rather than overwriting it: a report already
  // published from those numbers must stay checkable against them.
  const superseded = archiveExistingRun(outDir, outFilename);

  const previous = readPreviousRun(outDir, outFilename);
  const rows = diffMetrics(metrics, previous?.metrics ?? null);
  const table = renderMetricsTable(rows, "POSTURE", { now: "TODAY", previous: "LAST RUN" });

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    previousKey: previous?.key ?? null,
    supersededTo: superseded,
    metrics,
    table,
    summaries: [
      rlsSummaryLine(rls),
      routeSummaryLine(routeAssessments),
      privacySummaryLine(identityTables, residue),
      secretsSummaryLine(secrets),
      supplyChainSummaryLine(audit, installScripts),
      baselineSummaryLine(controlResults),
      detectionSummaryLine(detection),
    ],
    tables: {
      rls: renderRlsTable(rls),
      routes: renderRouteGuardTable(routeAssessments),
      privacy: renderPrivacyTable(identityTables, deletionTargets, RETENTION_REGISTER),
      secrets: renderSecretsTable(secrets),
      supplyChain: renderSupplyChainTable(audit, installScripts, lockfile),
      controls: renderControlTable(controlResults),
      executors: renderExecutorTable(executorResults),
      detection: renderDetectionTable(detection),
    },
    raw: {
      rls,
      privacy: { identityTables, deletionTargets, residue },
      routes: routeAssessments,
      middleware: { matcher, coverage, adminCookiePath, cookieConflicts },
      secrets: { rows: secrets.rows, issues: secrets.issues, gapCount: secrets.gapCount },
      supplyChain: {
        audit,
        installScripts,
        lockfile,
        newDirectDependencies: newDirectDependencies(
          deps,
          previousDependencies(outDir, previous?.key ?? null)
        ),
      },
      // Kept so the next run can diff against it — see previousDependencies.
      directDependencies: deps,
      controls: controlResults.map((result) => ({
        id: result.control.id,
        group: result.control.group,
        title: result.control.title,
        file: result.control.file,
        state: result.state,
        missingSignals: result.missingSignals,
        absentMeans: result.control.absentMeans,
        baselineTask: result.control.baselineTask ?? null,
      })),
      executors: executorResults,
      detection: detection.map((result) => ({
        id: result.entry.id,
        escalation: result.entry.escalation,
        wouldShow: result.entry.wouldShow,
        coverage: result.coverage,
        missingProbes: result.missingProbes,
        blindReason: result.entry.blindReason ?? null,
        ownedBy: result.entry.ownedBy ?? null,
      })),
      migrations: { count: migrations.length, latest: migrations.at(-1)?.name ?? null },
    },
  };

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  if (superseded) console.log(`superseded -> ${superseded}`);
  console.log(outPath);
}

main();
