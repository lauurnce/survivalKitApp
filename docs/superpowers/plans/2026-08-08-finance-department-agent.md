# Finance Department Agent (LEDGER) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Finance department agent (LEDGER) — a deterministic collector that reconciles `subscriptions` against `payments` and computes every finance figure in tested code, plus an interpreter agent that reads those figures and writes a monthly report with a lightweight weekly revenue delta.

**Architecture:** Two layers, matching Operations. `scripts/reports/finance.ts` is a deterministic collector: it reads production Supabase read-only using the credentials in `.env.reports.local`, calls pure functions in `lib/reports/` for every calculation, renders the finished metrics tables itself, and writes JSON to `docs/reports/finance/.data/`. `.claude/agents/ledger.md` is the interpreter: it reads that JSON plus the previous report, decides what is alarming, and writes the report. LEDGER never does arithmetic. Every finance number in a report traces back to a Vitest-covered function.

**Tech Stack:** TypeScript, Node 24, tsx, Vitest, `@supabase/supabase-js` (already a dependency), Claude Code subagents and skills. No new npm dependencies.

## Global Constraints

- **Node 24.x** — matches `engines` in `package.json`.
- **No new npm dependencies.** `@supabase/supabase-js` is already a dependency; `process.loadEnvFile` is a Node built-in (verified present on v24.18.0 in this repo).
- **Collectors are read-only.** LEDGER's collector issues `select` and `count` only. It never inserts, updates, deletes, or calls an RPC that mutates.
- **Credentials come from `.env.reports.local` only.** Never read, write, or reference `.env.local` from `scripts/reports/*`. `.env.local` deliberately carries no Supabase values so `npm run dev` cannot pollute the production dataset.
- **Never write an estimate into a metric row.** An unmeasured value is `null` and renders as `not read`. This applies with special force to Active CPU, which has no API and is read by eye — Operations owns that measurement and LEDGER copies it or writes `not read`.
- **`docs/reports/` is gitignored in full, permanently.** The repo is public. Revenue and conversion figures are private under the same rule that keeps `docs/POST-MORTEM.md` private. **No figure from a report, and no figure derived from production, may appear in a tracked file — including this plan.**
- **Manila dates everywhere.** All month, week, and day boundaries use `Asia/Manila` (UTC+8, no DST). The Philippines has no daylight saving, so the fixed `PH_OFFSET_MS` in `lib/payments.ts` is exact and is the one offset this codebase uses.
- **The current month is always annotated "so far"** and is never given a delta against a previous run. See Task 9's month-to-date table.
- **`tsx` transpiles to CommonJS.** `__dirname` works. **Top-level `await` does not** — async collectors must call `main().catch(...)`.
- **Tests colocate with source** as `<name>.test.ts`.
- **Commit messages use conventional-commit prefixes** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) and carry **no trailer block** — no `Co-Authored-By` of any kind.
- **Severity labels are exactly** `P0`, `P1`, `P2`, `P3`, `ACCEPTED`. Finding states are exactly `NEW`, `ONGOING`, `CLOSED`.

## Machinery that already exists — reuse it, do not rebuild it

| Path | What LEDGER uses it for |
|---|---|
| `lib/reports/severity.ts` | `Severity`, `FindingState`, `Finding`, `compareSeverity`, `isEscalation`, `validateFinding`. Unchanged. |
| `lib/reports/metrics.ts` | `Metric`, `diffMetrics`, `renderMetricsTable`. A `null` value renders `not read`. Unchanged. |
| `lib/reports/costLedger.ts` | `appendCostEntry` shape, and `npm run report:cost` for the `CUMULATIVE` line. Unchanged. |
| `lib/reports/runArchive.ts` | `archiveExistingRun` — displaces a same-period run to `superseded/` rather than overwriting it. Unchanged. |
| `lib/payments.ts` | `revenueByMonth` (PH calendar months, newest first), `PH_OFFSET_MS`. Already tested. Do not reimplement month bucketing. |
| `lib/paymongo.ts` | `PLANS`, `PlanKey`, `periodEndFor`, `SEMESTER_END`, `resolvePlan`. Already tested. |
| `lib/supabase/server.ts` | `createServerClient()` — reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `process.env` via `requireEnv`. Reusable from a script once the env file is loaded. |
| `scripts/reports/cost.ts` | `npm run report:cost`. Unchanged. |

Three of these are worth restating because a fresh implementer will be tempted to write their own: **`revenueByMonth` is the single source of monthly revenue truth**, `periodEndFor` is the single source of period-end truth, and `renderMetricsTable` is the only thing that formats a metrics table. Adding a second implementation of any of them is the exact failure this architecture exists to prevent.

## Verified against this repo on 2026-08-08

Everything below was checked, not assumed. Where a check was impossible it says so.

| Claim | Status |
|---|---|
| `payments` and `subscriptions` are far below Supabase's 1000-row select cap | **Verified** by a read-only `count=exact` probe against production. A plain `select` is correct for both — **no aggregate RPC migration is needed for Finance.** The exact counts are private; the collector reports them. Task 2 still adds a hard cap guard so this cannot silently stop being true. |
| `classes` and `class_members` are far below the cap | **Verified** by the same probe. |
| `events` is past the cap | **Verified.** Finance therefore **never selects rows from `events`** — it uses `count: "exact", head: true` queries only, which return a count header and no rows and are unaffected by the cap. |
| `PAYMONGO_LIVEMODE`, `PAYMONGO_SECRET_KEY`, `PAYMONGO_WEBHOOK_SECRET` in `.env.reports.local` are all the literal string `[SENSITIVE]` | **Verified.** `vercel env pull` cannot retrieve Sensitive values. **The collector therefore cannot read production's real livemode flag today.** Task 8 handles this by reporting `not read` and falling back to a database-side proxy signal. This is the single most important constraint in the plan and it is why the LIVEMODE check is designed the way it is. |
| The block-price formula lives in exactly three places | **Verified.** `app/(main)/for-blocks/pricing.ts:5-10` (pesos), `app/api/class/checkout/route.ts:9-19` (centavos), `app/api/webhooks/paymongo/route.ts:118-123` (centavos, inline in the class branch). This is the drift documented in commit `44c2957`. |
| `process.loadEnvFile` exists on this machine's Node | **Verified** — `typeof process.loadEnvFile === "function"` on v24.18.0. |
| The Ops collector's Active CPU metric label is exactly `Active CPU / 4h` | **Verified** against `docs/reports/ops/.data/2026-08-05.json`. Task 9 matches on that literal. |
| Current suite size: 624 tests across 72 files | **Verified** by `npx vitest run`. |
| `unlocks.amount` is in **pesos** (`default 20`), while `payments.amount` is in **centavos** | **Verified** in `supabase/migrations/001_initial_schema.sql:53` vs `20260624120000_payments_ledger.sql`. Mixing them misstates revenue by 100×. Task 4 keeps them in separate functions with the unit in every name. |
| Neither `app/api/class/checkout/route.ts` nor the webhook enforces `MAX_SEATS` | **Verified** — both check only `seats < 11`. `MAX_SEATS = 55` exists in `pricing.ts` and is a client-side bound only. **Could not verify whether this is intentional.** Task 7 reports it as a signal rather than failing a test on it, and LEDGER writes it up as a finding with options. |
| A production PayMongo link id's literal prefix | **Could not verify** — no live link id was read, and the PayMongo secret is `[SENSITIVE]`. Task 5's exception classifier therefore never asserts a `link_` prefix. It classifies by an explicit list of *locally-minted* prefixes (`block-`, `comp-`, `manual-`) and treats everything else as `unexplained`, which fails safe: an unrecognised id gets named and surfaced rather than silently excused. |
| Whether the Growth department (VANTAGE) has been built | **Unknown at writing.** The build order is Ops → Growth → Finance → Security, and Growth may have already created a reports Supabase client. **Task 2 Step 1 checks for one and reuses it if present.** |

## File Structure

| Path | Responsibility |
|---|---|
| `lib/reports/previousRun.ts` | Finds the most recent prior collector run in a `.data` directory. Extracted from `scripts/reports/ops.ts` so both collectors share one tested copy. Pure apart from two `fs` reads. |
| `lib/reports/previousRun.test.ts` | Tests for the above. |
| `lib/reports/rowCap.ts` | Supabase's 1000-row select cap as a named constant plus a guard that throws. Pure. |
| `lib/reports/rowCap.test.ts` | Tests for the above. |
| `lib/reports/phWindow.ts` | Asia/Manila month and day-window boundaries. Pure. |
| `lib/reports/phWindow.test.ts` | Tests for the above, including the 16:00 UTC month boundary. |
| `lib/reports/unitEconomics.ts` | Plan attribution from a paid amount, revenue per plan, ARPU/LTV/CAC, scenario modelling. Pure. |
| `lib/reports/unitEconomics.test.ts` | Tests for the above. |
| `lib/reports/ledgerIntegrity.ts` | The centrepiece: reconciles `subscriptions` and `classes` against `payments`, classifies and **names** every exception, and applies the known-exception register. Pure. |
| `lib/reports/ledgerIntegrity.test.ts` | Tests for the above. |
| `lib/reports/revenueRecognition.ts` | Earned vs deferred revenue, and the expiry / revenue-at-risk schedule. Pure. |
| `lib/reports/revenueRecognition.test.ts` | Tests for the above. |
| `lib/reports/blockPrice.ts` | The standing assertion against block-price formula drift across all three sources. Pure. |
| `lib/reports/blockPrice.test.ts` | Tests for the above **plus the standing assertion itself**, which reads the three real files. |
| `lib/reports/billingSignals.ts` | PayMongo mode-matching detection and the silent-drop proxy signal. Pure. |
| `lib/reports/billingSignals.test.ts` | Tests for the above. |
| `scripts/reports/supabaseClient.ts` | Loads `.env.reports.local`, builds a read-only production client, reads whole small tables under the cap guard, and counts rows without fetching them. |
| `scripts/reports/finance.ts` | The Finance collector. Monthly by default, `--weekly` for the light delta. Renders the tables. |
| `.claude/agents/ledger.md` | The LEDGER interpreter agent definition. |
| `.claude/skills/report/SKILL.md` | Extended with the `finance` row and the dual cadence. |
| `package.json` | Adds `report:finance` and `report:finance:weekly`. |
| `scripts/reports/ops.ts` | Modified once, in Task 1, to import the extracted `readPreviousRun`. Its JSON output shape does not change. |

`lib/reports/` holds pure, testable logic. Anything that touches the network or reads credentials lives in `scripts/reports/`.

---

### Task 1: Extract the previous-run reader into shared machinery

**Files:**
- Create: `lib/reports/previousRun.ts`
- Test: `lib/reports/previousRun.test.ts`
- Modify: `scripts/reports/ops.ts` — delete its private `readPreviousRun` and import the shared one

**Interfaces:**
- Consumes: `Metric` from `lib/reports/metrics.ts`.
- Produces: `PreviousRun`, `readPreviousRun(outDir: string, currentFilename: string): PreviousRun | null`.

`scripts/reports/ops.ts` currently carries this function privately and untested. The Finance collector needs identical behaviour with a different filename shape (`2026-08.json`, a month, rather than `2026-08-05.json`, a day). Copying it would create a second untested implementation of the thing that decides what a delta is measured against. Extract it once, give it the tests it never had, and have both collectors import it.

**The Ops JSON contract must not change.** The extracted function returns `{ key, metrics }` where Ops' private version returned `{ date, metrics }` — because a Finance key is a month, not a date. Ops' *payload* field stays `previousDate`, because PULSE reads that name. Only the local expression changes.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/previousRun.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readPreviousRun } from "./previousRun";

let dir: string;

const write = (name: string, body: unknown) =>
  writeFileSync(join(dir, name), JSON.stringify(body), "utf8");

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "previous-run-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("readPreviousRun", () => {
  it("returns null when the directory does not exist", () => {
    expect(readPreviousRun(join(dir, "absent"), "2026-08-05.json")).toBeNull();
  });

  it("returns null when there is no earlier run", () => {
    write("2026-08-05.json", { metrics: [] });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("never returns the current run itself", () => {
    write("2026-08-05.json", { metrics: [{ label: "Today", value: 1 }] });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("picks the latest run that sorts before the current filename", () => {
    write("2026-08-01.json", { metrics: [{ label: "A", value: 1 }] });
    write("2026-08-04.json", { metrics: [{ label: "A", value: 2 }] });
    write("2026-08-05.json", { metrics: [{ label: "A", value: 3 }] });
    const previous = readPreviousRun(dir, "2026-08-05.json");
    expect(previous?.key).toBe("2026-08-04");
    expect(previous?.metrics).toEqual([{ label: "A", value: 2 }]);
  });

  it("orders monthly filenames correctly", () => {
    write("2026-06.json", { metrics: [{ label: "A", value: 1 }] });
    write("2026-07.json", { metrics: [{ label: "A", value: 2 }] });
    const previous = readPreviousRun(dir, "2026-08.json");
    expect(previous?.key).toBe("2026-07");
  });

  it("ignores subdirectories such as superseded/ and weekly/", () => {
    mkdirSync(join(dir, "superseded"));
    writeFileSync(
      join(dir, "superseded", "2026-08-04.1.json"),
      JSON.stringify({ metrics: [{ label: "Archived", value: 9 }] }),
      "utf8"
    );
    mkdirSync(join(dir, "weekly"));
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("ignores files that are not .json", () => {
    writeFileSync(join(dir, "2026-08-04.md"), "not json", "utf8");
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("degrades to a baseline when the previous file is malformed JSON", () => {
    writeFileSync(join(dir, "2026-08-04.json"), "{ not json", "utf8");
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });

  it("degrades to a baseline when metrics is missing or not an array", () => {
    write("2026-08-04.json", { collectedAt: "whenever" });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();

    write("2026-08-03.json", { metrics: "nope" });
    expect(readPreviousRun(dir, "2026-08-05.json")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/previousRun.test.ts`
Expected: FAIL — cannot resolve `./previousRun`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/previousRun.ts`:

```typescript
/**
 * Finds the collector run a new run should diff against.
 *
 * Extracted from scripts/reports/ops.ts so the Ops and Finance collectors
 * share one implementation rather than two. The thing this decides — what a
 * delta is measured against — is too load-bearing to exist twice untested.
 *
 * The key is a filename with `.json` stripped, so it is a Manila calendar day
 * for a daily collector (`2026-08-05`) and a Manila calendar month for a
 * monthly one (`2026-08`). Both sort lexically in chronological order, which
 * is why filename comparison is enough and no date parsing is needed.
 *
 * Every failure degrades to a baseline run rather than throwing: no directory
 * yet, no earlier file, an unreadable file, malformed JSON, or a missing
 * `metrics` array. A previous run is a nice-to-have and must never be a hard
 * dependency. (Contrast runArchive.ts, which throws — there, failing means
 * destroying data, which is not survivable.)
 *
 * Reading is non-recursive on purpose. `superseded/` and `weekly/` are
 * subdirectories of the same `.data` directory, and neither may ever be
 * mistaken for the previous run.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metric } from "./metrics";

export interface PreviousRun {
  /** The prior run's filename with `.json` stripped. */
  key: string;
  metrics: Metric[];
}

export function readPreviousRun(
  outDir: string,
  currentFilename: string
): PreviousRun | null {
  let files: string[];
  try {
    files = readdirSync(outDir).filter((name) => name.endsWith(".json"));
  } catch {
    return null;
  }

  const previousFile = files
    .filter((name) => name < currentFilename)
    .sort()
    .at(-1);
  if (!previousFile) return null;

  try {
    const parsed = JSON.parse(
      readFileSync(join(outDir, previousFile), "utf8")
    ) as { metrics?: unknown };
    if (!Array.isArray(parsed.metrics)) return null;
    return {
      key: previousFile.replace(/\.json$/, ""),
      metrics: parsed.metrics as Metric[],
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/previousRun.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Point the Ops collector at the shared copy**

In `scripts/reports/ops.ts`, delete the entire private `readPreviousRun` function (its JSDoc block and body, currently at lines 120–145) and add the import beside the existing `lib/reports` imports:

```typescript
import { readPreviousRun } from "../../lib/reports/previousRun";
```

Then, in `main()`, change the one line that reads the previous key:

```typescript
    previousDate: previous?.key ?? null,
```

`readFileSync` may now be unused in `ops.ts` — check the remaining imports and drop it from the `node:fs` import list if `npm run lint` flags it. `readdirSync` is still used by `migrationInventory`.

**Do not rename the `previousDate` field in the payload.** `.claude/agents/pulse.md` reads it by that name.

- [ ] **Step 6: Verify the Ops collector still produces the same shape**

```bash
npm run report:ops
node -e "const d=require('./docs/reports/ops/.data/'+new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'})+'.json'); console.log(Object.keys(d).join(',')); console.log('previousDate:', d.previousDate); console.log(d.metrics.length,'metrics')"
```

Expected: keys `collectedAt,collectMs,metrics,previousDate,table,raw`, a `previousDate` that is either a date string or `null`, and 12 metrics. The collector prints a `superseded earlier run today ->` line, which is correct — it is preserving the run that existed before this verification.

- [ ] **Step 7: Run the full suite**

```bash
npm test && npm run typecheck && npm run lint
```

Expected: all pass, 633 tests (624 + 9).

- [ ] **Step 8: Commit**

```bash
git add lib/reports/previousRun.ts lib/reports/previousRun.test.ts scripts/reports/ops.ts
git commit -m "refactor(reports): share the previous-run reader between collectors"
```

---

### Task 2: Read-only production client with a hard row-cap guard

**Files:**
- Create: `lib/reports/rowCap.ts`
- Test: `lib/reports/rowCap.test.ts`
- Create: `scripts/reports/supabaseClient.ts`

**Interfaces:**
- Consumes: `createServerClient` from `lib/supabase/server.ts`, `process.loadEnvFile`.
- Produces: `SELECT_ROW_CAP`, `assertUnderCap(table: string, rowCount: number): void` from `lib/reports/rowCap.ts`; and `loadReportsEnv(): void`, `reportsClient(): SupabaseClient`, `readAllRows<T>(client, table: string, columns: string): Promise<T[]>`, `countRows(client, table: string, filter?): Promise<number | null>` from `scripts/reports/supabaseClient.ts`.

Supabase caps a `select` at 1000 rows. `payments` and `subscriptions` are far under it today — verified — which is exactly why Finance needs no aggregate RPC. But a truncated select does not error; it silently returns 1000 rows, and a revenue total computed from a truncated ledger is wrong in a way nobody would notice. So the read path **throws** at the cap rather than degrading, the same reasoning `runArchive.ts` uses: losing data quietly is worse than failing loudly.

- [ ] **Step 1: Check whether a reports client already exists**

Run: `ls -1 scripts/reports/`

If `supabaseClient.ts` is already present — the Growth build may have created it — read it and confirm it exposes `loadReportsEnv`, `reportsClient`, `readAllRows`, and `countRows` with the signatures above. If it does, skip to Step 2 and add only `lib/reports/rowCap.ts` plus the cap guard call inside `readAllRows`. Do not create a second client.

If the directory shows only `cost.ts` and `ops.ts`, create both files as written below.

- [ ] **Step 2: Write the failing test**

Create `lib/reports/rowCap.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SELECT_ROW_CAP, assertUnderCap } from "./rowCap";

describe("SELECT_ROW_CAP", () => {
  it("is Supabase's documented select ceiling", () => {
    expect(SELECT_ROW_CAP).toBe(1000);
  });
});

describe("assertUnderCap", () => {
  it("accepts an empty table", () => {
    expect(() => assertUnderCap("payments", 0)).not.toThrow();
  });

  it("accepts a row count one below the cap", () => {
    expect(() => assertUnderCap("payments", 999)).not.toThrow();
  });

  it("throws at exactly the cap, because that result may be truncated", () => {
    expect(() => assertUnderCap("payments", 1000)).toThrow();
  });

  it("throws above the cap", () => {
    expect(() => assertUnderCap("subscriptions", 1500)).toThrow();
  });

  it("names the table in the message so the fix is obvious", () => {
    expect(() => assertUnderCap("subscriptions", 1000)).toThrow(/subscriptions/);
  });

  it("tells the reader to add an aggregate RPC rather than raise the limit", () => {
    expect(() => assertUnderCap("payments", 1000)).toThrow(/RPC/);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/reports/rowCap.test.ts`
Expected: FAIL — cannot resolve `./rowCap`.

- [ ] **Step 4: Write the cap guard**

Create `lib/reports/rowCap.ts`:

```typescript
/**
 * Supabase's select ceiling, and the guard that keeps a truncated read from
 * becoming a wrong revenue figure.
 *
 * PostgREST enforces a server-side `max-rows` of 1000. Passing the cap is not
 * an error — the response simply stops at 1000 rows with no warning. A revenue
 * total summed from a truncated ledger is wrong, plausible, and undetectable,
 * which is the worst combination a finance report can produce.
 *
 * A result of exactly 1000 rows is indistinguishable from a truncated one, so
 * the guard fires at the cap rather than above it. That costs a false alarm on
 * a table holding exactly 1000 rows and buys certainty everywhere else.
 *
 * The fix when this fires is an aggregate RPC — computing the number in
 * Postgres and reading one row back — not a larger limit. Follow
 * supabase/migrations/20260629000000_admin_top_sections.sql.
 */

export const SELECT_ROW_CAP = 1000;

export function assertUnderCap(table: string, rowCount: number): void {
  if (rowCount < SELECT_ROW_CAP) return;

  throw new Error(
    `${table} returned ${rowCount} rows, at or past Supabase's ` +
      `${SELECT_ROW_CAP}-row select cap. The result may be silently truncated, ` +
      `so any figure derived from it would be wrong without looking wrong. ` +
      `Add a Postgres aggregate RPC for ${table} — see ` +
      `supabase/migrations/20260629000000_admin_top_sections.sql — and read ` +
      `the aggregate instead of the rows. Do not raise the limit.`
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/reports/rowCap.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 6: Write the client**

Create `scripts/reports/supabaseClient.ts`:

```typescript
/**
 * Read-only production Supabase access for report collectors.
 *
 * Credentials come from `.env.reports.local` and nowhere else. `.env.local`
 * deliberately carries no Supabase values so that `npm run dev` cannot write
 * into the live `events`, `profiles`, and `payments` tables — the exact
 * dataset these reports read. Loading the wrong file would undo that
 * separation, so this module names the file explicitly and never falls back.
 *
 * `vercel env pull` cannot retrieve Sensitive values; it writes the literal
 * string "[SENSITIVE]" instead. The Supabase URL and service-role key are not
 * Sensitive and come through intact, which is why database access works. The
 * PayMongo values do not — see lib/reports/billingSignals.ts, which treats
 * "[SENSITIVE]" as "not read" rather than as a value.
 *
 * Everything here is `select` and `count`. No insert, no update, no delete,
 * no mutating RPC. A collector that can write to production is a collector
 * that can corrupt the thing it measures.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "../../lib/supabase/server";
import { assertUnderCap } from "../../lib/reports/rowCap";

const REPO_ROOT = join(__dirname, "..", "..");
export const REPORTS_ENV_FILE = join(REPO_ROOT, ".env.reports.local");

/**
 * Loads `.env.reports.local` into process.env. Throws with instructions
 * rather than producing an empty client: a collector that runs without
 * credentials would report zero revenue, which reads as a catastrophe.
 */
export function loadReportsEnv(): void {
  if (!existsSync(REPORTS_ENV_FILE)) {
    throw new Error(
      `Missing ${REPORTS_ENV_FILE}. It holds the production Supabase URL and ` +
        `service-role key and is read only by scripts/reports/*. Get the ` +
        `values from the Supabase dashboard (Project Settings -> API); ` +
        `\`vercel env pull\` cannot supply them. Never point this at ` +
        `.env.local, which has no Supabase values by design.`
    );
  }
  process.loadEnvFile(REPORTS_ENV_FILE);
}

/** A service-role client. Call loadReportsEnv() first. */
export function reportsClient(): SupabaseClient {
  return createServerClient();
}

/**
 * Reads a whole small table. Throws if the result is at or past the select
 * cap — see lib/reports/rowCap.ts for why a truncated read must never be
 * treated as a complete one.
 */
export async function readAllRows<T>(
  client: SupabaseClient,
  table: string,
  columns: string
): Promise<T[]> {
  const { data, error } = await client.from(table).select(columns);
  if (error) throw new Error(`Reading ${table} failed: ${error.message}`);
  const rows = (data ?? []) as T[];
  assertUnderCap(table, rows.length);
  return rows;
}

/**
 * Counts rows without fetching them. `head: true` returns the count in a
 * response header and no body, so it is unaffected by the select cap — this
 * is how Finance touches `events`, which is far past the cap, without needing
 * an aggregate RPC of its own.
 *
 * Returns null rather than throwing when the count is unavailable. A missing
 * count renders as `not read`; a fabricated zero would read as "nobody tried
 * to pay", which is a very different and much more alarming claim.
 */
export async function countRows(
  client: SupabaseClient,
  table: string,
  apply: (query: ReturnType<SupabaseClient["from"]>["select"] extends never ? never : any) => any = (q) => q
): Promise<number | null> {
  const base = client.from(table).select("*", { count: "exact", head: true });
  const { count, error } = await apply(base);
  if (error) {
    console.error(`Counting ${table} failed: ${error.message}`);
    return null;
  }
  return typeof count === "number" ? count : null;
}
```

If `npm run typecheck` objects to the `apply` parameter's type, replace its annotation with the simpler and equally honest form — the Supabase query builder's type is not worth fighting here:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
apply: (query: any) => any = (q) => q
```

- [ ] **Step 7: Smoke-test the client against production, read-only**

This is also the check that confirms the plan's central data-access claim. It prints **buckets, not counts** — the exact figures are private and must not reach a tracked file or a terminal transcript that gets pasted into one.

```bash
npx tsx -e "
const { loadReportsEnv, reportsClient, readAllRows } = require('./scripts/reports/supabaseClient');
loadReportsEnv();
const c = reportsClient();
const bucket = (n) => n === 0 ? 'empty' : n < 500 ? 'well under cap' : n < 900 ? 'approaching cap' : 'AT CAP';
(async () => {
  for (const t of ['payments','subscriptions','classes','class_members','unlocks']) {
    const rows = await readAllRows(c, t, 'id');
    console.log(t.padEnd(15), bucket(rows.length));
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
"
```

Expected: every table prints `empty` or `well under cap`. If any prints `approaching cap`, note it in `docs/reports/finance/README.md` (Task 10) as a P3 to watch. If any prints `AT CAP` the command will have thrown instead — stop and add an aggregate RPC for that table before continuing.

- [ ] **Step 8: Confirm nothing became trackable**

Run: `git status --porcelain`
Expected: only `lib/reports/rowCap.ts`, `lib/reports/rowCap.test.ts`, and `scripts/reports/supabaseClient.ts` as new files. **No `.env*` file may appear.**

- [ ] **Step 9: Commit**

```bash
git add lib/reports/rowCap.ts lib/reports/rowCap.test.ts scripts/reports/supabaseClient.ts
git commit -m "feat(reports): add read-only production access with a row-cap guard"
```

---

### Task 3: Asia/Manila month and window boundaries

**Files:**
- Create: `lib/reports/phWindow.ts`
- Test: `lib/reports/phWindow.test.ts`

**Interfaces:**
- Consumes: `PH_OFFSET_MS` from `lib/payments.ts`.
- Produces: `phMonthKey(now: Date): string`, `phMonthStartUtc(now: Date): Date`, `phDayOfMonth(now: Date): number`, `phDaysInMonth(now: Date): number`, `daysAgo(now: Date, days: number): Date`, `inWindow(iso: string, from: Date, to: Date): boolean`.

Month boundaries decide which month a payment counts toward. Getting one wrong moves revenue between months, and a month-over-month comparison built on that is worse than no comparison. PH is UTC+8 with no daylight saving, so the fixed offset in `lib/payments.ts` is exact — reuse it rather than introducing a second notion of Manila time.

The boundary that matters: **PH month start is 16:00 UTC on the last day of the previous UTC month.** Half of these tests exist to pin that down.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/phWindow.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  phMonthKey,
  phMonthStartUtc,
  phDayOfMonth,
  phDaysInMonth,
  daysAgo,
  inWindow,
} from "./phWindow";

describe("phMonthKey", () => {
  it("uses the Manila calendar month, not the UTC one", () => {
    // 2026-07-31T16:00:00Z is 2026-08-01T00:00 in Manila.
    expect(phMonthKey(new Date("2026-07-31T16:00:00.000Z"))).toBe("2026-08");
  });

  it("stays in the earlier month one second before the boundary", () => {
    expect(phMonthKey(new Date("2026-07-31T15:59:59.000Z"))).toBe("2026-07");
  });

  it("agrees with UTC in the middle of a month", () => {
    expect(phMonthKey(new Date("2026-08-15T03:00:00.000Z"))).toBe("2026-08");
  });

  it("rolls the year over correctly", () => {
    expect(phMonthKey(new Date("2026-12-31T16:00:00.000Z"))).toBe("2027-01");
  });
});

describe("phMonthStartUtc", () => {
  it("returns 16:00 UTC on the last day of the previous UTC month", () => {
    const start = phMonthStartUtc(new Date("2026-08-08T05:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-07-31T16:00:00.000Z");
  });

  it("is idempotent when called on the boundary instant itself", () => {
    const boundary = new Date("2026-07-31T16:00:00.000Z");
    expect(phMonthStartUtc(boundary).toISOString()).toBe(boundary.toISOString());
  });
});

describe("phDayOfMonth", () => {
  it("is 1 at the Manila month boundary", () => {
    expect(phDayOfMonth(new Date("2026-07-31T16:00:00.000Z"))).toBe(1);
  });

  it("is the last day one second earlier", () => {
    expect(phDayOfMonth(new Date("2026-07-31T15:59:59.000Z"))).toBe(31);
  });
});

describe("phDaysInMonth", () => {
  it("counts 31 for August", () => {
    expect(phDaysInMonth(new Date("2026-08-08T05:00:00.000Z"))).toBe(31);
  });

  it("counts 30 for September", () => {
    expect(phDaysInMonth(new Date("2026-09-08T05:00:00.000Z"))).toBe(30);
  });

  it("counts 28 for a non-leap February", () => {
    expect(phDaysInMonth(new Date("2026-02-08T05:00:00.000Z"))).toBe(28);
  });

  it("counts 29 for a leap February", () => {
    expect(phDaysInMonth(new Date("2028-02-08T05:00:00.000Z"))).toBe(29);
  });
});

describe("daysAgo", () => {
  it("subtracts whole days from the instant", () => {
    expect(daysAgo(new Date("2026-08-08T05:00:00.000Z"), 7).toISOString()).toBe(
      "2026-08-01T05:00:00.000Z"
    );
  });

  it("returns the same instant for zero days", () => {
    const now = new Date("2026-08-08T05:00:00.000Z");
    expect(daysAgo(now, 0).toISOString()).toBe(now.toISOString());
  });
});

describe("inWindow", () => {
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-08T00:00:00.000Z");

  it("includes the lower bound", () => {
    expect(inWindow("2026-08-01T00:00:00.000Z", from, to)).toBe(true);
  });

  it("excludes the upper bound so adjacent windows never double-count", () => {
    expect(inWindow("2026-08-08T00:00:00.000Z", from, to)).toBe(false);
  });

  it("excludes an instant before the window", () => {
    expect(inWindow("2026-07-31T23:59:59.000Z", from, to)).toBe(false);
  });

  it("returns false for an unparseable timestamp rather than throwing", () => {
    expect(inWindow("not a date", from, to)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/phWindow.test.ts`
Expected: FAIL — cannot resolve `./phWindow`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/phWindow.ts`:

```typescript
/**
 * Asia/Manila window boundaries for finance reporting.
 *
 * Month boundaries decide which month a payment's revenue lands in. An
 * off-by-eight-hours boundary silently moves revenue between months, and the
 * month-over-month comparison built on top of it is then confidently wrong —
 * worse than having no comparison at all.
 *
 * The Philippines has no daylight saving, so a fixed +8h offset is exact.
 * PH_OFFSET_MS is imported from lib/payments.ts rather than redeclared so
 * `revenueByMonth` and these helpers can never disagree about what a Manila
 * month is.
 *
 * The technique throughout: shift the instant by +8h and then read UTC fields
 * off the shifted value. The shifted Date is a Manila wall clock wearing a UTC
 * costume — never format it or hand it to anything that treats it as a real
 * instant.
 */

import { PH_OFFSET_MS } from "../payments";

/** "YYYY-MM" for the Manila calendar month containing `now`. */
export function phMonthKey(now: Date): string {
  return new Date(now.getTime() + PH_OFFSET_MS).toISOString().slice(0, 7);
}

/** The real UTC instant at which the Manila calendar month began. */
export function phMonthStartUtc(now: Date): Date {
  const ph = new Date(now.getTime() + PH_OFFSET_MS);
  return new Date(
    Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth(), 1) - PH_OFFSET_MS
  );
}

/** Day of the Manila month, 1-based. */
export function phDayOfMonth(now: Date): number {
  return new Date(now.getTime() + PH_OFFSET_MS).getUTCDate();
}

/** Days in the Manila month containing `now`. Day 0 of the next month. */
export function phDaysInMonth(now: Date): number {
  const ph = new Date(now.getTime() + PH_OFFSET_MS);
  return new Date(
    Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth() + 1, 0)
  ).getUTCDate();
}

/** `days` whole days before `now`. Timezone-free — a duration, not a date. */
export function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Half-open window test: `from` inclusive, `to` exclusive, so two adjacent
 * windows can never both claim the same payment. An unparseable timestamp is
 * outside every window rather than an exception — a malformed row must not
 * take the whole collector down.
 */
export function inWindow(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= from.getTime() && t < to.getTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/phWindow.test.ts`
Expected: PASS — 17 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/phWindow.ts lib/reports/phWindow.test.ts
git commit -m "feat(reports): add Manila month and window boundaries"
```

---
