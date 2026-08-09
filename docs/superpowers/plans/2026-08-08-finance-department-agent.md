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

### Note: `phWindow.ts` and `phWeek.ts` — which module owns what

The sibling Growth plan (`docs/superpowers/plans/2026-08-08-growth-department-agent.md`, Task 1) creates `lib/reports/phWeek.ts` — Manila calendar dates and trailing complete-week windows. Task 3 above creates `lib/reports/phWindow.ts` — Manila month boundaries and half-open window tests. Two date modules in one directory needs an explanation, or the third department will add a third.

They do not conflict on the thing that would actually hurt: **both import `PH_OFFSET_MS` from `lib/payments.ts` rather than redeclaring it**, so there is exactly one definition of what UTC+8 means in this codebase and `revenueByMonth`, the week windows, and the month boundaries can never disagree about it. What is duplicated is the idiom — shift the instant by the offset, then read UTC fields off the shifted value — which now appears in two files.

Ownership, so neither grows into the other:

| Module | Owns | Exports | Built for |
|---|---|---|---|
| `lib/reports/phWeek.ts` | Days and weeks | `PhWindow`, `phDate`, `phDayStartUtc`, `phWeekWindows` | Growth's weekly cadence |
| `lib/reports/phWindow.ts` | Months and arbitrary windows | `phMonthKey`, `phMonthStartUtc`, `phDayOfMonth`, `phDaysInMonth`, `daysAgo`, `inWindow` | Finance's monthly cadence |

Three rules while both exist:

- **Neither imports the other.** They are siblings built by different plans that may be executed in either order or partially; a cross-import makes one plan's tests fail depending on whether the other plan has landed.
- **Finance never adds a week helper to `phWindow.ts`, and Growth never adds a month helper to `phWeek.ts`.** The moment either does, there are two answers to the same question and the next reader has to work out which is authoritative.
- **The Finance collector does not import `phDate`** even though `phWeek.phDate` is exactly the Manila-calendar-date function its weekly filename needs. Task 9 derives that date with `toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })`, the same expression `scripts/reports/ops.ts` already uses. That is deliberately a third copy of a one-liner rather than a dependency on whether Growth has been built yet — build order is a fact about a Tuesday, not something a collector should encode.

**Recommended end state, explicitly not this plan:** once all four departments exist, fold both modules into one `lib/reports/phTime.ts` in a single consolidation commit that moves the exports verbatim, keeps every existing test, and updates the import sites. Doing it here would mean editing a module created by a plan that may still be mid-execution, and two half-finished refactors meeting in `lib/reports/` is a worse outcome than one duplicated eight-hour shift.

---

### Task 4: Revenue accounting, pricing attribution and unit economics

**Files:**
- Create: `lib/reports/unitEconomics.ts`
- Test: `lib/reports/unitEconomics.test.ts`

**Interfaces:**
- Consumes: `PLANS`, `PlanKey` from `lib/paymongo.ts`; `MonthlyRevenue` from `lib/payments.ts`; `phMonthKey`, `phDayOfMonth`, `phDaysInMonth` from `lib/reports/phWindow.ts`.
- Produces: `pesosFromCentavos`, `unlockRevenuePesos`, `attributePlan`, `revenueByPlan`, `PLAN_BUCKETS`, `arpu`, `observedLtv`, `acquisitionCost`, `ZERO_CAC_DISCLAIMER`, `paybackMonths`, `modelPayback`, `scenarios`, `SCENARIO_MULTIPLIERS`, `annotateMonths`, `completeMonths`, `completeMonthDelta`.

This is charter sub-functions 1, 4, 5 and 10 — revenue accounting, unit economics, pricing and packaging, and scenario modelling. They live in one module because they are one thing: the arithmetic that turns ledger rows into money. Splitting them would mean four files that all import each other.

Four decisions here are load-bearing.

**Units are in the names, always.** `payments.amount` is centavos and `unlocks.amount` is pesos — verified, `supabase/migrations/001_initial_schema.sql:53` versus `20260624120000_payments_ledger.sql`. Confusing them misstates revenue by 100×, in the direction that looks like success. There is one conversion function, `pesosFromCentavos`, and the legacy unlock ledger gets its own function whose name says pesos so it can never be piped through the converter a second time. `revenueByMonth` in `lib/payments.ts` **already divides by 100** — its `revenue` field is pesos. Do not divide again.

**The block-price matcher is a required argument, not an optional one with a false default.** A class block sale lands in `payments` with an amount computed from the seat formula, not from `PLANS`. If `attributePlan` were allowed to run without a block matcher it would see a large amount on a subject-scoped row, find that it clears the subject plan price, and file it under `subject_sem` — quietly overstating subject-plan revenue by more than an order of magnitude per sale. Making the matcher required turns forgetting it into a compile error. Task 7 supplies the real one; the tests here supply a fake, which is the correct dependency direction and keeps `unitEconomics.ts` free of a second copy of the block formula.

**Attribution never loses a peso.** The webhook grants on `paid >= expected`, so an overpayment is a real granted purchase and cannot be discarded as unrecognised. Anything that matches nothing lands in an explicit `unattributed` bucket rather than being dropped, and there is a test asserting the buckets sum to the total. A revenue breakdown that silently omits rows is worse than no breakdown.

**Nothing divides by zero and nothing returns `Infinity` or `NaN`.** ARPU with no paying devices is `null`, which renders `not read`; it is not `0`, which would read as "people are paying nothing" rather than "nobody has paid". Same for payback and LTV.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/unitEconomics.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  pesosFromCentavos,
  unlockRevenuePesos,
  attributePlan,
  revenueByPlan,
  PLAN_BUCKETS,
  arpu,
  observedLtv,
  acquisitionCost,
  ZERO_CAC_DISCLAIMER,
  paybackMonths,
  modelPayback,
  scenarios,
  SCENARIO_MULTIPLIERS,
  annotateMonths,
  completeMonths,
  completeMonthDelta,
} from "./unitEconomics";

// Synthetic amounts only. Real figures never enter a tracked file.
const SUBJECT_MONTH = 4900;
const SUBJECT_SEM = 9900;
const YEAR_SEM = 29900;

// Stands in for lib/reports/blockPrice.ts (Task 7). The real matcher reads the
// three source files; this one only has to be a matcher.
const isBlockAmount = (centavos: number, scope: "subject" | "all") =>
  scope === "subject" ? centavos === 79900 : centavos === 99900;

const payment = (amount: number, subjectId: string | null) => ({
  amount,
  subject_id: subjectId,
});

describe("pesosFromCentavos", () => {
  it("converts centavos to pesos", () => {
    expect(pesosFromCentavos(29900)).toBe(299);
  });

  it("keeps a fractional peso rather than rounding it away", () => {
    expect(pesosFromCentavos(4950)).toBe(49.5);
  });

  it("converts zero to zero", () => {
    expect(pesosFromCentavos(0)).toBe(0);
  });
});

describe("unlockRevenuePesos", () => {
  it("sums the legacy unlocks ledger, which is already in pesos", () => {
    expect(unlockRevenuePesos([{ amount: 20 }, { amount: 20 }])).toBe(40);
  });

  it("is zero for an empty legacy ledger", () => {
    expect(unlockRevenuePesos([])).toBe(0);
  });
});

describe("attributePlan", () => {
  it("matches the whole-year plan exactly", () => {
    expect(attributePlan(YEAR_SEM, null, isBlockAmount)).toEqual({
      bucket: "year_sem",
      match: "exact",
    });
  });

  it("matches the monthly subject plan exactly", () => {
    expect(attributePlan(SUBJECT_MONTH, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_month",
      match: "exact",
    });
  });

  it("matches the semester subject plan exactly", () => {
    expect(attributePlan(SUBJECT_SEM, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_sem",
      match: "exact",
    });
  });

  it("recognises a subject-scoped block sale before any subject plan", () => {
    expect(attributePlan(79900, "subject-1", isBlockAmount)).toEqual({
      bucket: "block",
      match: "block",
    });
  });

  it("recognises an all-subjects block sale before the year plan", () => {
    expect(attributePlan(99900, null, isBlockAmount)).toEqual({
      bucket: "block",
      match: "block",
    });
  });

  it("attributes an overpayment to the most expensive plan it clears", () => {
    // The webhook grants on paid >= expected, so this is a real purchase.
    expect(attributePlan(SUBJECT_SEM + 100, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_sem",
      match: "over",
    });
  });

  it("leaves an amount below every candidate unattributed", () => {
    expect(attributePlan(100, "subject-1", isBlockAmount)).toEqual({
      bucket: "unattributed",
      match: "none",
    });
  });

  it("does not attribute a subject-priced amount to a year-scoped row", () => {
    // No subject means the only candidate is year_sem, which this underpays.
    expect(attributePlan(SUBJECT_MONTH, null, isBlockAmount).bucket).toBe(
      "unattributed"
    );
  });
});

describe("revenueByPlan", () => {
  it("always returns every bucket in a fixed order, even when empty", () => {
    const rows = revenueByPlan([], isBlockAmount);
    expect(rows.map((r) => r.bucket)).toEqual([...PLAN_BUCKETS]);
    expect(rows.every((r) => r.revenuePesos === 0 && r.payments === 0)).toBe(true);
  });

  it("sums pesos and counts payments per bucket", () => {
    const rows = revenueByPlan(
      [
        payment(SUBJECT_MONTH, "s1"),
        payment(SUBJECT_MONTH, "s2"),
        payment(YEAR_SEM, null),
      ],
      isBlockAmount
    );
    const byBucket = new Map(rows.map((r) => [r.bucket, r]));
    expect(byBucket.get("subject_month")).toMatchObject({ payments: 2, revenuePesos: 98 });
    expect(byBucket.get("year_sem")).toMatchObject({ payments: 1, revenuePesos: 299 });
  });

  it("files a block sale under block, not under a subject plan", () => {
    const rows = revenueByPlan([payment(79900, "s1")], isBlockAmount);
    const byBucket = new Map(rows.map((r) => [r.bucket, r]));
    expect(byBucket.get("block")?.payments).toBe(1);
    expect(byBucket.get("subject_sem")?.payments).toBe(0);
  });

  it("never loses a peso — the buckets sum to the total", () => {
    const rows = [
      payment(SUBJECT_MONTH, "s1"),
      payment(SUBJECT_SEM + 51, "s2"),
      payment(YEAR_SEM, null),
      payment(79900, "s3"),
      payment(7, "s4"), // attributable to nothing
    ];
    const total = rows.reduce((sum, r) => sum + r.amount, 0) / 100;
    const bucketed = revenueByPlan(rows, isBlockAmount).reduce(
      (sum, r) => sum + r.revenuePesos,
      0
    );
    expect(bucketed).toBeCloseTo(total, 10);
  });

  it("keeps unmatched money visible in the unattributed bucket", () => {
    const rows = revenueByPlan([payment(7, "s1")], isBlockAmount);
    const unattributed = rows.find((r) => r.bucket === "unattributed");
    expect(unattributed).toMatchObject({ payments: 1 });
    expect(unattributed?.revenuePesos).toBeGreaterThan(0);
  });
});

describe("arpu", () => {
  it("divides revenue by paying devices", () => {
    expect(arpu(600, 4)).toBe(150);
  });

  it("rounds to two decimal places", () => {
    expect(arpu(100, 3)).toBe(33.33);
  });

  it("returns null rather than zero when nobody has paid", () => {
    expect(arpu(0, 0)).toBeNull();
  });

  it("returns null rather than Infinity for revenue with no payers", () => {
    expect(arpu(500, 0)).toBeNull();
  });
});

describe("observedLtv", () => {
  it("is revenue per paying device, observed to date", () => {
    expect(observedLtv(600, 4, 4).pesos).toBe(150);
  });

  it("flags that it is indistinguishable from ARPU while nobody has paid twice", () => {
    expect(observedLtv(600, 4, 4).indistinguishableFromArpu).toBe(true);
  });

  it("stops flagging once a device has paid more than once", () => {
    const observation = observedLtv(600, 4, 6);
    expect(observation.indistinguishableFromArpu).toBe(false);
    expect(observation.paymentsPerPayingDevice).toBe(1.5);
  });

  it("is null with no paying devices", () => {
    expect(observedLtv(0, 0, 0)).toMatchObject({
      pesos: null,
      paymentsPerPayingDevice: null,
    });
  });
});

describe("acquisitionCost", () => {
  it("reports zero spend as a basis, not as efficiency", () => {
    expect(acquisitionCost(0, 12)).toEqual({ pesos: 0, basis: "zero-spend" });
  });

  it("computes cost per acquisition when money is actually spent", () => {
    expect(acquisitionCost(1000, 8)).toEqual({ pesos: 125, basis: "computed" });
  });

  it("returns null when money was spent and nobody converted", () => {
    expect(acquisitionCost(1000, 0)).toEqual({ pesos: null, basis: "no-acquisitions" });
  });

  it("states plainly that zero CAC is not a compliment", () => {
    expect(ZERO_CAC_DISCLAIMER).toMatch(/not because/i);
    expect(ZERO_CAC_DISCLAIMER).toMatch(/no money is spent/i);
  });
});

describe("paybackMonths", () => {
  it("is immediate at zero CAC", () => {
    expect(paybackMonths(0, 150)).toBe(0);
  });

  it("divides CAC by monthly ARPU", () => {
    expect(paybackMonths(300, 150)).toBe(2);
  });

  it("returns null rather than Infinity when ARPU is zero", () => {
    expect(paybackMonths(300, 0)).toBeNull();
  });

  it("returns null when ARPU was not measured", () => {
    expect(paybackMonths(300, null)).toBeNull();
  });

  it("returns null when CAC was not measured", () => {
    expect(paybackMonths(null, 150)).toBeNull();
  });
});

describe("modelPayback", () => {
  it("models what payback becomes if acquisition spend starts", () => {
    expect(modelPayback(1000, 8, 125)).toMatchObject({ cacPesos: 125, months: 1 });
  });

  it("carries its assumptions rather than presenting a bare number", () => {
    expect(modelPayback(1000, 8, 125).assumptions.length).toBeGreaterThan(0);
  });
});

describe("scenarios", () => {
  const baseline = {
    month: "2026-07",
    revenuePesos: 1000,
    payments: 10,
    complete: true,
  };

  it("models 2x, 5x and 10x by default", () => {
    expect(scenarios(baseline).map((s) => s.multiplier)).toEqual([
      ...SCENARIO_MULTIPLIERS,
    ]);
  });

  it("scales the baseline revenue", () => {
    expect(scenarios(baseline).map((s) => s.revenuePesos)).toEqual([2000, 5000, 10000]);
  });

  it("attaches assumptions to every scenario", () => {
    expect(scenarios(baseline).every((s) => s.assumptions.length > 0)).toBe(true);
  });

  it("gives every scenario the same assumptions, so none can be stripped", () => {
    const [first, ...rest] = scenarios(baseline);
    expect(rest.every((s) => s.assumptions.join("|") === first.assumptions.join("|"))).toBe(
      true
    );
  });

  it("refuses to model from an incomplete month", () => {
    expect(() => scenarios({ ...baseline, complete: false })).toThrow(/incomplete/i);
  });
});

describe("annotateMonths", () => {
  // revenueByMonth returns newest first: index 0 is the running month.
  const months = [
    { month: "2026-08", revenue: 500, payments: 5 },
    { month: "2026-07", revenue: 900, payments: 9 },
    { month: "2026-06", revenue: 700, payments: 7 },
  ];
  const now = new Date("2026-08-08T05:00:00.000Z"); // 2026-08-08 13:00 Manila

  it("marks the running Manila month incomplete", () => {
    expect(annotateMonths(months, now)[0]).toMatchObject({
      month: "2026-08",
      complete: false,
    });
  });

  it("marks every other month complete", () => {
    expect(annotateMonths(months, now).slice(1).every((m) => m.complete)).toBe(true);
  });

  it("carries the progress through the month only on the incomplete one", () => {
    const [current, previous] = annotateMonths(months, now);
    expect(current).toMatchObject({ dayOfMonth: 8, daysInMonth: 31 });
    expect(previous.dayOfMonth).toBeUndefined();
  });

  it("uses the Manila month, not the UTC one, at the boundary", () => {
    // 2026-07-31T16:00Z is already August in Manila.
    const boundary = new Date("2026-07-31T16:00:00.000Z");
    const annotated = annotateMonths(months, boundary);
    expect(annotated.find((m) => m.month === "2026-08")?.complete).toBe(false);
    expect(annotated.find((m) => m.month === "2026-07")?.complete).toBe(true);
  });

  it("does not divide revenue again — revenueByMonth already returns pesos", () => {
    expect(annotateMonths(months, now)[1].revenuePesos).toBe(900);
  });

  it("preserves the newest-first order it was given", () => {
    expect(annotateMonths(months, now).map((m) => m.month)).toEqual([
      "2026-08",
      "2026-07",
      "2026-06",
    ]);
  });
});

describe("completeMonths and completeMonthDelta", () => {
  const months = [
    { month: "2026-08", revenue: 500, payments: 5 },
    { month: "2026-07", revenue: 900, payments: 9 },
    { month: "2026-06", revenue: 700, payments: 7 },
  ];
  const now = new Date("2026-08-08T05:00:00.000Z");

  it("drops the running month from the comparable set", () => {
    expect(completeMonths(annotateMonths(months, now)).map((m) => m.month)).toEqual([
      "2026-07",
      "2026-06",
    ]);
  });

  it("compares the two most recent complete months, never the running one", () => {
    expect(completeMonthDelta(annotateMonths(months, now))).toEqual({
      from: "2026-06",
      to: "2026-07",
      deltaPesos: 200,
    });
  });

  it("returns null when there are not two complete months to compare", () => {
    const thin = [{ month: "2026-08", revenue: 500, payments: 5 }];
    expect(completeMonthDelta(annotateMonths(thin, now))).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/unitEconomics.test.ts`
Expected: FAIL — cannot resolve `./unitEconomics`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/unitEconomics.ts`:

```typescript
/**
 * Revenue accounting, plan attribution, unit economics and scenario modelling.
 *
 * Four rules run through everything here.
 *
 * UNITS ARE IN THE NAMES. `payments.amount` is centavos; the legacy
 * `unlocks.amount` is pesos (default 20, per 001_initial_schema.sql); and
 * `revenueByMonth` in lib/payments.ts has ALREADY divided by 100, so its
 * `revenue` field is pesos and must not be converted a second time. Mixing any
 * two of those misstates revenue by 100×, in the flattering direction.
 *
 * ATTRIBUTION NEVER LOSES A PESO. The webhook grants access on
 * `paid >= expected`, so an overpayment is a real purchase, not a rounding
 * error. Anything that matches no known price lands in an explicit
 * `unattributed` bucket. A breakdown that silently omits rows would let a
 * whole category of revenue disappear without the total moving.
 *
 * NOTHING DIVIDES BY ZERO. Every rate returns null instead of Infinity or NaN.
 * A null renders as "not read", which is honest; a zero would read as "people
 * are paying nothing", which is a different and much more alarming claim.
 *
 * THE BLOCK MATCHER IS REQUIRED. Class block sales are priced by a seat
 * formula, not from PLANS. Without a matcher, a block payment clears the
 * subject-plan price and gets filed as a subject plan — overstating that plan's
 * revenue by more than an order of magnitude per sale. Making the argument
 * required turns forgetting it into a compile error. lib/reports/blockPrice.ts
 * supplies the real one; this module deliberately holds no copy of the formula.
 */

import { PLANS, type PlanKey } from "../paymongo";
import type { MonthlyRevenue } from "../payments";
import { phDayOfMonth, phDaysInMonth, phMonthKey } from "./phWindow";

export const CENTAVOS_PER_PESO = 100;

/** Money is rounded for display at two decimals and nowhere else. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pesosFromCentavos(centavos: number): number {
  return centavos / CENTAVOS_PER_PESO;
}

/**
 * The pre-pivot `unlocks` ledger, which stores PESOS. Separate function and
 * separate name so it can never be piped through pesosFromCentavos as well.
 */
export function unlockRevenuePesos(rows: { amount: number }[]): number {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

// ── Plan attribution ────────────────────────────────────────────────────────

export type PlanBucket = PlanKey | "block" | "unattributed";

/** Fixed order. The metrics row set must not change shape between runs. */
export const PLAN_BUCKETS: readonly PlanBucket[] = [
  "subject_month",
  "subject_sem",
  "year_sem",
  "block",
  "unattributed",
] as const;

export interface PlanAttribution {
  bucket: PlanBucket;
  /**
   * How the amount was matched. `over` is a real purchase at more than the
   * list price; `none` means no known price explains it.
   */
  match: "exact" | "over" | "block" | "none";
}

/** Matches an amount against the class block-sale price. Supplied by blockPrice.ts. */
export type BlockAmountMatcher = (
  centavos: number,
  scope: "subject" | "all"
) => boolean;

export function attributePlan(
  amountCentavos: number,
  subjectId: string | null,
  isBlockAmount: BlockAmountMatcher
): PlanAttribution {
  const scope: "subject" | "all" = subjectId === null ? "all" : "subject";

  // Block first. A block sale is larger than every per-device plan, so testing
  // the plans first would file it under whichever one it happens to clear.
  if (isBlockAmount(amountCentavos, scope)) {
    return { bucket: "block", match: "block" };
  }

  // Scope decides which plans are even possible: a row with no subject can
  // only be the whole-year plan, and a subject row can only be a subject plan.
  const candidates: PlanKey[] =
    subjectId === null ? ["year_sem"] : ["subject_month", "subject_sem"];

  for (const plan of candidates) {
    if (PLANS[plan].amount === amountCentavos) return { bucket: plan, match: "exact" };
  }

  const cleared = candidates
    .filter((plan) => amountCentavos > PLANS[plan].amount)
    .sort((a, b) => PLANS[b].amount - PLANS[a].amount)[0];
  if (cleared) return { bucket: cleared, match: "over" };

  return { bucket: "unattributed", match: "none" };
}

export interface PlanRevenue {
  bucket: PlanBucket;
  revenuePesos: number;
  payments: number;
}

export function revenueByPlan(
  rows: { amount: number; subject_id: string | null }[],
  isBlockAmount: BlockAmountMatcher
): PlanRevenue[] {
  const centavos = new Map<PlanBucket, { centavos: number; payments: number }>(
    PLAN_BUCKETS.map((bucket) => [bucket, { centavos: 0, payments: 0 }])
  );

  for (const row of rows) {
    const { bucket } = attributePlan(row.amount, row.subject_id, isBlockAmount);
    const acc = centavos.get(bucket);
    // Every bucket is pre-seeded, so this cannot miss — but a defensive skip
    // here would silently drop money, which is the one thing that must not
    // happen. Fail loudly instead.
    if (!acc) throw new Error(`unknown plan bucket: ${bucket}`);
    acc.centavos += row.amount;
    acc.payments += 1;
  }

  // Divide once at the end so centavos stay integers while summing — the same
  // discipline revenueByMonth uses.
  return PLAN_BUCKETS.map((bucket) => {
    const acc = centavos.get(bucket)!;
    return {
      bucket,
      revenuePesos: pesosFromCentavos(acc.centavos),
      payments: acc.payments,
    };
  });
}

// ── Unit economics ──────────────────────────────────────────────────────────

export function arpu(revenuePesos: number, payingDevices: number): number | null {
  if (payingDevices <= 0) return null;
  return round2(revenuePesos / payingDevices);
}

export interface LtvObservation {
  pesos: number | null;
  paymentsPerPayingDevice: number | null;
  /**
   * True while no device has paid twice. LTV is then arithmetically identical
   * to ARPU, and reporting them as two numbers implies a second source that
   * does not exist. LEDGER must say so rather than quote both.
   */
  indistinguishableFromArpu: boolean;
}

export function observedLtv(
  revenuePesos: number,
  payingDevices: number,
  payments: number
): LtvObservation {
  if (payingDevices <= 0) {
    return {
      pesos: null,
      paymentsPerPayingDevice: null,
      indistinguishableFromArpu: true,
    };
  }
  return {
    pesos: round2(revenuePesos / payingDevices),
    paymentsPerPayingDevice: round2(payments / payingDevices),
    indistinguishableFromArpu: payments <= payingDevices,
  };
}

export type CacBasis = "zero-spend" | "computed" | "no-acquisitions";

export interface AcquisitionCost {
  pesos: number | null;
  basis: CacBasis;
}

/**
 * The sentence LEDGER must write whenever CAC is zero. Exported as a constant
 * rather than left to the agent's phrasing, because "CAC is zero" read on its
 * own is a claim about efficiency, and it is not one.
 */
export const ZERO_CAC_DISCLAIMER =
  "CAC is zero because no money is spent on acquisition, not because acquisition is efficient. " +
  "Distribution is organic; the number says nothing about how well it works.";

export function acquisitionCost(
  spendPesos: number,
  newPayingDevices: number
): AcquisitionCost {
  if (spendPesos === 0) return { pesos: 0, basis: "zero-spend" };
  if (newPayingDevices <= 0) return { pesos: null, basis: "no-acquisitions" };
  return { pesos: round2(spendPesos / newPayingDevices), basis: "computed" };
}

export function paybackMonths(
  cacPesos: number | null,
  monthlyArpuPesos: number | null
): number | null {
  if (cacPesos === null || monthlyArpuPesos === null) return null;
  if (cacPesos === 0) return 0; // nothing to pay back
  if (monthlyArpuPesos <= 0) return null;
  return round2(cacPesos / monthlyArpuPesos);
}

export interface PaybackModel {
  cacPesos: number | null;
  months: number | null;
  assumptions: string[];
}

/**
 * What payback becomes if acquisition spend starts. Kept separate from the
 * measured `paybackMonths` so a hypothetical can never be mistaken for a
 * reading — this belongs in prose and in `raw`, never in a metrics row.
 */
export function modelPayback(
  hypotheticalSpendPesos: number,
  hypotheticalNewPayingDevices: number,
  monthlyArpuPesos: number | null
): PaybackModel {
  const cac = acquisitionCost(hypotheticalSpendPesos, hypotheticalNewPayingDevices);
  return {
    cacPesos: cac.pesos,
    months: paybackMonths(cac.pesos, monthlyArpuPesos),
    assumptions: [
      "Spend and acquisitions are hypothetical; no acquisition money has been spent.",
      "Monthly ARPU is held at its observed value, which is measured over a period with no paid acquisition in it.",
      "Assumes paid acquisition converts at the same rate as organic, which is the assumption most likely to be wrong.",
    ],
  };
}

// ── Scenario modelling ──────────────────────────────────────────────────────

export const SCENARIO_MULTIPLIERS: readonly number[] = [2, 5, 10] as const;

export interface Scenario {
  multiplier: number;
  revenuePesos: number;
  assumptions: string[];
}

const SCENARIO_ASSUMPTIONS = [
  "Conversion is the only variable. Price points and plan mix are held at the baseline month's.",
  "No discounting, no new plan, and no change in what is sold.",
  "Cost of operation is held flat. The free-tier ceiling is a separate row and is not modelled here.",
  "This is a sensitivity, not a forecast. It says what the money would be at that multiple, not whether the multiple is reachable.",
];

export function scenarios(
  baseline: { month: string; revenuePesos: number; complete: boolean },
  multipliers: readonly number[] = SCENARIO_MULTIPLIERS
): Scenario[] {
  if (!baseline.complete) {
    throw new Error(
      `Refusing to model scenarios from ${baseline.month}, which is incomplete. ` +
        `Multiplying a partial month projects a partial month, and the result ` +
        `looks like a full one. Pass the last complete month.`
    );
  }

  return multipliers.map((multiplier) => ({
    multiplier,
    revenuePesos: round2(baseline.revenuePesos * multiplier),
    // Copied per scenario on purpose: the assumptions travel with the number
    // wherever it is quoted, including when only the 10x line is quoted.
    assumptions: [...SCENARIO_ASSUMPTIONS],
  }));
}

// ── Month-over-month ────────────────────────────────────────────────────────

export interface AnnotatedMonth {
  month: string; // "YYYY-MM", Manila calendar
  revenuePesos: number;
  payments: number;
  /** False only for the month currently running. */
  complete: boolean;
  /** Present only on the incomplete month: how far through it we are. */
  dayOfMonth?: number;
  daysInMonth?: number;
}

/**
 * Marks the running month so it can never be compared against a finished one.
 * Completeness is decided by the month key rather than by array position, so
 * it stays right whatever order the caller passes.
 */
export function annotateMonths(months: MonthlyRevenue[], now: Date): AnnotatedMonth[] {
  const currentKey = phMonthKey(now);

  return months.map((month) => {
    const complete = month.month !== currentKey;
    return {
      month: month.month,
      // Already pesos. revenueByMonth divided by 100 before returning.
      revenuePesos: month.revenue,
      payments: month.payments,
      complete,
      ...(complete
        ? {}
        : { dayOfMonth: phDayOfMonth(now), daysInMonth: phDaysInMonth(now) }),
    };
  });
}

export function completeMonths(months: AnnotatedMonth[]): AnnotatedMonth[] {
  return months.filter((month) => month.complete);
}

export interface MonthDelta {
  from: string;
  to: string;
  deltaPesos: number;
}

/**
 * The month-over-month move, computed across complete months only. Returns
 * null rather than reaching for the running month when there is only one
 * finished month to look at.
 */
export function completeMonthDelta(months: AnnotatedMonth[]): MonthDelta | null {
  const finished = completeMonths(months);
  if (finished.length < 2) return null;

  // Input is newest first, so index 0 is the most recently finished month.
  const [latest, previous] = finished;
  return {
    from: previous.month,
    to: latest.month,
    deltaPesos: round2(latest.revenuePesos - previous.revenuePesos),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/unitEconomics.test.ts`
Expected: PASS — 51 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/unitEconomics.ts lib/reports/unitEconomics.test.ts
git commit -m "feat(reports): add revenue attribution and unit economics"
```

---

### Task 5: Ledger integrity — reconcile entitlement against money

**Files:**
- Create: `lib/reports/ledgerIntegrity.ts`
- Test: `lib/reports/ledgerIntegrity.test.ts`

**Interfaces:**
- Consumes: `attributePlan`, `BlockAmountMatcher` from `lib/reports/unitEconomics.ts`.
- Produces: `LOCALLY_MINTED_PREFIXES`, `classifyLinkId`, `naturalKey`, `KNOWN_EXCEPTIONS`, `EXCEPTION_KINDS`, `LedgerException`, `MatchedPair`, `ReconcileResult`, `reconcile`, `summariseExceptions`.

This is the department's centrepiece and the reason Finance exists at this volume. Two tables claim to describe the same events: `payments` is the append-only record of money received, `subscriptions` and `classes` are the records of access granted. Every row in one should have a partner in the other. Where it does not, one of two things is true, and they are opposites — either someone was deliberately given access without paying, or a webhook wrote entitlement without recording money. **The collector's job is to classify and name each exception, never to count them.** "Three unmatched subscriptions" is not a finding; it is a prompt to go and look, which is the work this department is supposed to have already done.

Three things about the matching are not obvious and all three have been verified against the code.

**Link id alone is not a sufficient join.** `recordPayment` in `lib/payments.ts:80-88` **updates** an existing subscription's `paymongo_link_id` when a device pays again for the same year and subject. The earlier payment's link id therefore no longer appears on any subscription row, and a naive link-id join would report that payment as money received with nothing granted — a P0 by the Finance escalation list — when it is an ordinary renewal. So the reconciler matches on link id first and then falls back to the subscription's natural key, `(device_id, year_id, coalesce(subject_id, 'year'))`, which is exactly the tuple `subscriptions_device_year_subject_uidx` enforces. A payment that matches by natural key but not by link id is `matched via natural-key` and is reported as a renewal, not as an exception. **This is the single most likely false P0 in the department and the test suite pins it down.**

**Locally-minted link ids are named, not excused.** `supabase/migrations/20260716000000_classes.sql` documents `'block-<uuid>'` as a placeholder for manually-generated PayMongo links. An entitlement carrying one of those was granted by hand and has no ledger row by design. The classifier recognises an explicit list of locally-minted prefixes — `block-`, `comp-`, `manual-` — and treats **everything else** as a gateway id it cannot verify. That direction fails safe: an unrecognised id gets named and surfaced rather than silently excused. It never asserts a `link_` prefix, because no production link id was read and the PayMongo secret in `.env.reports.local` is the literal string `[SENSITIVE]`.

**The known-exception register ships empty.** Comped access is legitimate and should stop being re-reported every month — but only once someone has written down why. `KNOWN_EXCEPTIONS` is an owner-maintained list of link ids with a reason and a date, and it starts with nothing in it, the same way Growth's `TERM_CALENDAR` ships empty so nobody invents a term break to excuse a regression. An empty register means nothing is excused by default.

Exceptions are computed on three independent axes and a row can appear on more than one — a payment can be both unmatched and at an unrecognised price. Conservation is asserted per axis: **every payment appears exactly once on the matching axis and every entitlement exactly once on the entitlement axis.** Nothing is dropped.

**Disclosure:** exceptions carry `device_id`, `paymongo_link_id`, and amounts. Those are identifiers and money. They live in `docs/reports/finance/.data/`, which is gitignored, and never move into a tracked file, a commit message, or a plan.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/ledgerIntegrity.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  LOCALLY_MINTED_PREFIXES,
  classifyLinkId,
  naturalKey,
  KNOWN_EXCEPTIONS,
  EXCEPTION_KINDS,
  reconcile,
  summariseExceptions,
  type ClassRow,
  type PaymentRow,
  type SubscriptionRow,
} from "./ledgerIntegrity";

// Synthetic throughout. No production identifier or amount enters this file.
const isBlockAmount = (centavos: number, scope: "subject" | "all") =>
  scope === "subject" ? centavos === 79900 : centavos === 99900;

const payment = (over: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "pay-1",
  paymongo_link_id: "gw_1",
  device_id: "dev-1",
  year_id: "year-1",
  subject_id: null,
  amount: 29900,
  paid_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const subscription = (over: Partial<SubscriptionRow> = {}): SubscriptionRow => ({
  id: "sub-1",
  paymongo_link_id: "gw_1",
  device_id: "dev-1",
  year_id: "year-1",
  subject_id: null,
  status: "active",
  current_period_end: "2026-12-31T15:59:59.000Z",
  created_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const classRow = (over: Partial<ClassRow> = {}): ClassRow => ({
  id: "cls-1",
  code: "ABC123",
  paymongo_link_id: "gw_block_1",
  rep_device_id: "dev-rep",
  year_id: "year-1",
  subject_id: "subject-1",
  seat_cap: 11,
  status: "active",
  current_period_end: "2026-12-31T15:59:59.000Z",
  created_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const run = (input: {
  payments?: PaymentRow[];
  subscriptions?: SubscriptionRow[];
  classes?: ClassRow[];
  register?: typeof KNOWN_EXCEPTIONS;
}) =>
  reconcile({
    payments: input.payments ?? [],
    subscriptions: input.subscriptions ?? [],
    classes: input.classes ?? [],
    isBlockAmount,
    register: input.register,
  });

const kinds = (result: ReturnType<typeof run>) =>
  result.exceptions.map((exception) => exception.kind);

describe("classifyLinkId", () => {
  it("recognises the class block placeholder", () => {
    expect(classifyLinkId("block-abc")).toBe("block-placeholder");
  });

  it("recognises a comped grant", () => {
    expect(classifyLinkId("comp-abc")).toBe("comped");
  });

  it("recognises a manual grant", () => {
    expect(classifyLinkId("manual-abc")).toBe("manual");
  });

  it("treats anything else as a gateway id it cannot verify", () => {
    expect(classifyLinkId("link_someRealPaymongoId")).toBe("gateway");
  });

  it("treats an empty link id as a gateway id rather than as locally minted", () => {
    // Fail safe: an unrecognised id must be surfaced, never excused.
    expect(classifyLinkId("")).toBe("gateway");
  });

  it("lists exactly the prefixes this codebase mints locally", () => {
    expect([...LOCALLY_MINTED_PREFIXES]).toEqual(["block-", "comp-", "manual-"]);
  });
});

describe("naturalKey", () => {
  it("collapses a year plan onto the same sentinel the unique index uses", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: null })).toBe(
      "d|y|year"
    );
  });

  it("keys a subject plan by its subject", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: "s" })).toBe("d|y|s");
  });

  it("distinguishes a year plan from a subject plan on the same device", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: null })).not.toBe(
      naturalKey({ device_id: "d", year_id: "y", subject_id: "s" })
    );
  });
});

describe("KNOWN_EXCEPTIONS", () => {
  it("ships empty, so nothing is excused by default", () => {
    expect(KNOWN_EXCEPTIONS).toEqual([]);
  });

  it("requires a reason and a date on every entry that is ever added", () => {
    for (const entry of KNOWN_EXCEPTIONS) {
      expect(entry.reason.trim().length).toBeGreaterThan(0);
      expect(entry.since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("reconcile — matching axis", () => {
  it("matches a subscription to its payment by link id", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
  });

  it("matches a class to its payment by link id", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_block_1", amount: 79900, subject_id: "subject-1", device_id: "dev-rep" })],
      classes: [classRow()],
    });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
  });

  it("names an entitlement with a gateway link id and no payment as unexplained", () => {
    const result = run({ subscriptions: [subscription({ paymongo_link_id: "gw_missing" })] });
    expect(kinds(result)).toEqual(["entitlement-without-payment"]);
    expect(result.exceptions[0].linkId).toBe("gw_missing");
  });

  it("names a block-placeholder entitlement as locally minted, not as unexplained", () => {
    const result = run({ classes: [classRow({ paymongo_link_id: "block-xyz" })] });
    expect(kinds(result)).toEqual(["entitlement-locally-minted"]);
    expect(result.exceptions[0].reason).toMatch(/block-placeholder/);
  });

  it("names a comped subscription as locally minted", () => {
    const result = run({ subscriptions: [subscription({ paymongo_link_id: "comp-1" })] });
    expect(kinds(result)).toEqual(["entitlement-locally-minted"]);
  });

  it("moves an entitlement in the register to its own kind and carries the reason", () => {
    const result = run({
      subscriptions: [subscription({ paymongo_link_id: "gw_comped" })],
      register: [{ linkId: "gw_comped", reason: "Beta tester, agreed 2026-07", since: "2026-07-01" }],
    });
    expect(kinds(result)).toEqual(["entitlement-known-exception"]);
    expect(result.exceptions[0].reason).toMatch(/Beta tester/);
  });

  it("reports money received with nothing granted, and carries the amount", () => {
    const result = run({ payments: [payment({ paymongo_link_id: "gw_orphan" })] });
    expect(kinds(result)).toEqual(["payment-without-entitlement"]);
    expect(result.exceptions[0].amountCentavos).toBe(29900);
  });

  it("does not call a renewal-superseded payment an orphan", () => {
    // recordPayment overwrites subscriptions.paymongo_link_id on renewal, so
    // the first payment's link id no longer appears on any subscription.
    const first = payment({ id: "pay-1", paymongo_link_id: "gw_1" });
    const second = payment({ id: "pay-2", paymongo_link_id: "gw_2" });
    const result = run({
      payments: [first, second],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
    expect(result.counts.matchedByRenewal).toBe(1);
  });

  it("still reports an orphan when the natural key matches nothing either", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan", device_id: "dev-other" })],
      subscriptions: [subscription()],
    });
    expect(kinds(result)).toContain("payment-without-entitlement");
  });

  it("records how a pair was matched", () => {
    const result = run({
      payments: [payment({ id: "pay-1", paymongo_link_id: "gw_1" }), payment({ id: "pay-2", paymongo_link_id: "gw_2" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    expect(result.matched.map((pair) => pair.via).sort()).toEqual([
      "link-id",
      "natural-key",
    ]);
  });

  it("counts every payment exactly once on the matching axis", () => {
    const result = run({
      payments: [
        payment({ id: "pay-1", paymongo_link_id: "gw_1" }),
        payment({ id: "pay-2", paymongo_link_id: "gw_2" }),
        payment({ id: "pay-3", paymongo_link_id: "gw_3", device_id: "dev-nobody" }),
      ],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    const orphans = result.exceptions.filter(
      (exception) => exception.kind === "payment-without-entitlement"
    ).length;
    expect(result.counts.matchedDirect + result.counts.matchedByRenewal + orphans).toBe(3);
  });

  it("counts every entitlement exactly once on the entitlement axis", () => {
    const result = run({
      payments: [payment()],
      subscriptions: [
        subscription({ id: "sub-1", paymongo_link_id: "gw_1" }),
        subscription({ id: "sub-2", paymongo_link_id: "comp-1", device_id: "dev-2" }),
        subscription({ id: "sub-3", paymongo_link_id: "gw_missing", device_id: "dev-3" }),
      ],
    });
    const entitlementExceptions = result.exceptions.filter((exception) =>
      exception.kind.startsWith("entitlement-")
    ).length;
    expect(result.counts.matchedDirect + entitlementExceptions).toBe(3);
  });

  it("produces nothing at all from empty inputs", () => {
    const result = run({});
    expect(result.exceptions).toEqual([]);
    expect(result.matched).toEqual([]);
    expect(result.counts.payments).toBe(0);
    expect(result.counts.entitlements).toBe(0);
  });
});

describe("reconcile — amount axis", () => {
  it("flags a payment at a price this product does not sell", () => {
    const result = run({
      payments: [payment({ amount: 1234 })],
      subscriptions: [subscription()],
    });
    expect(kinds(result)).toEqual(["amount-not-attributable"]);
  });

  it("does not flag a payment at a listed price", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(kinds(result)).not.toContain("amount-not-attributable");
  });

  it("flags an unattributable amount even on a payment that matched", () => {
    // The axes are independent: matching well says nothing about the price.
    const result = run({
      payments: [payment({ amount: 7 })],
      subscriptions: [subscription()],
    });
    expect(result.counts.matchedDirect).toBe(1);
    expect(kinds(result)).toContain("amount-not-attributable");
  });

  it("does not flag a block-priced payment", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_block_1", amount: 79900, subject_id: "subject-1", device_id: "dev-rep" })],
      classes: [classRow()],
    });
    expect(kinds(result)).not.toContain("amount-not-attributable");
  });
});

describe("reconcile — integrity axis", () => {
  it("flags two entitlements sharing one natural key", () => {
    const result = run({
      payments: [payment({ id: "pay-1", paymongo_link_id: "gw_1" }), payment({ id: "pay-2", paymongo_link_id: "gw_2" })],
      subscriptions: [
        subscription({ id: "sub-1", paymongo_link_id: "gw_1" }),
        subscription({ id: "sub-2", paymongo_link_id: "gw_2" }),
      ],
    });
    expect(kinds(result)).toContain("duplicate-entitlement");
  });

  it("flags a grant whose device disagrees with the payment's", () => {
    const result = run({
      payments: [payment({ device_id: "dev-payer" })],
      subscriptions: [subscription({ device_id: "dev-other" })],
    });
    expect(kinds(result)).toContain("grant-device-mismatch");
  });

  it("does not flag a matched pair that agrees on device", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(kinds(result)).not.toContain("grant-device-mismatch");
  });
});

describe("exceptions carry enough to act on", () => {
  it("names the link id on every exception", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_missing", device_id: "dev-9" })],
    });
    expect(result.exceptions.every((exception) => exception.linkId.length > 0)).toBe(true);
  });

  it("writes a reason on every exception, not just a kind", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_missing", device_id: "dev-9" })],
    });
    expect(result.exceptions.every((exception) => exception.reason.trim().length > 0)).toBe(
      true
    );
  });

  it("keeps the device and year on an exception so it can be looked up", () => {
    const result = run({ payments: [payment({ paymongo_link_id: "gw_orphan" })] });
    expect(result.exceptions[0]).toMatchObject({ deviceId: "dev-1", yearId: "year-1" });
  });
});

describe("summariseExceptions", () => {
  it("reports every kind, zeroed, so the metrics row set never changes shape", () => {
    const summary = summariseExceptions([]);
    expect(Object.keys(summary.byKind).sort()).toEqual([...EXCEPTION_KINDS].sort());
    expect(Object.values(summary.byKind).every((count) => count === 0)).toBe(true);
  });

  it("counts the two unreconciled kinds separately from the explained ones", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [
        subscription({ paymongo_link_id: "gw_missing", device_id: "dev-2" }),
        subscription({ paymongo_link_id: "comp-1", device_id: "dev-3" }),
      ],
    });
    const summary = summariseExceptions(result.exceptions);
    expect(summary.unreconciled).toBe(2);
    expect(summary.byKind["entitlement-locally-minted"]).toBe(1);
  });

  it("totals the money sitting behind unmatched payments", () => {
    const result = run({
      payments: [
        payment({ id: "pay-1", paymongo_link_id: "gw_a", amount: 29900 }),
        payment({ id: "pay-2", paymongo_link_id: "gw_b", amount: 29900, device_id: "dev-2" }),
      ],
    });
    expect(summariseExceptions(result.exceptions).unmatchedPaymentCentavos).toBe(59800);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/ledgerIntegrity.test.ts`
Expected: FAIL — cannot resolve `./ledgerIntegrity`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/ledgerIntegrity.ts`:

```typescript
/**
 * Reconciles entitlement against money.
 *
 * `payments` records money received. `subscriptions` and `classes` record
 * access granted. Every row in one should have a partner in the other, and
 * where it does not, exactly one of two opposite things is true: someone was
 * deliberately given access without paying, or a webhook wrote entitlement
 * without recording money. Counting the gap is useless — the whole value of
 * this module is that it CLASSIFIES and NAMES each exception, so the report
 * arrives with the looking-up already done.
 *
 * THREE THINGS ABOUT THE MATCHING ARE NOT OBVIOUS.
 *
 * 1. Link id alone is not a sufficient join. recordPayment (lib/payments.ts)
 *    OVERWRITES subscriptions.paymongo_link_id when a device pays again for
 *    the same year and subject, so an earlier payment's link id appears on no
 *    subscription row. A link-id-only join reports that renewal as money with
 *    nothing granted — a P0 by the Finance escalation list — when nothing is
 *    wrong. The fallback is the subscription's natural key, the same tuple
 *    subscriptions_device_year_subject_uidx enforces.
 *
 * 2. Locally-minted link ids are named, not excused. 20260716000000_classes.sql
 *    documents 'block-<uuid>' as a placeholder for a manually-generated link.
 *    The classifier recognises an explicit list of OUR prefixes and treats
 *    everything else as an unverifiable gateway id. That direction fails safe:
 *    an unrecognised id is surfaced rather than quietly forgiven. It never
 *    asserts a "link_" prefix — no production link id was ever read, and the
 *    PayMongo secret in .env.reports.local is the literal string [SENSITIVE].
 *
 * 3. The known-exception register ships EMPTY. Comped access should stop being
 *    re-reported every month, but only once someone has written down why.
 *
 * THE AXES ARE INDEPENDENT. A payment can be both unmatched and at a price we
 * do not sell, and it produces one exception on each axis. Conservation holds
 * per axis: every payment appears exactly once on the matching axis and every
 * entitlement exactly once on the entitlement axis. Nothing is dropped.
 *
 * DISCLOSURE: exceptions carry device ids, link ids and amounts. They belong
 * in docs/reports/finance/.data/, which is gitignored, and nowhere else.
 */

import { attributePlan, type BlockAmountMatcher } from "./unitEconomics";

// ── Row shapes, as the collector reads them ─────────────────────────────────

export interface PaymentRow {
  id: string;
  paymongo_link_id: string;
  device_id: string;
  year_id: string;
  subject_id: string | null;
  amount: number; // centavos
  paid_at: string;
}

export interface SubscriptionRow {
  id: string;
  paymongo_link_id: string;
  device_id: string;
  year_id: string;
  subject_id: string | null;
  status: string;
  current_period_end: string;
  created_at: string;
}

export interface ClassRow {
  id: string;
  code: string;
  paymongo_link_id: string;
  rep_device_id: string;
  year_id: string;
  subject_id: string | null;
  seat_cap: number;
  status: string;
  current_period_end: string;
  created_at: string;
}

/** Subscriptions and classes normalised into one shape. */
export interface Entitlement {
  kind: "subscription" | "class";
  id: string;
  linkId: string;
  /** For a class this is the rep — the device that actually paid. */
  deviceId: string;
  yearId: string;
  subjectId: string | null;
  status: string;
  currentPeriodEnd: string;
  createdAt: string;
}

// ── Link id classification ──────────────────────────────────────────────────

/**
 * Prefixes this codebase mints itself. Everything not on this list is treated
 * as a gateway id we cannot verify — which is the safe direction, because an
 * unrecognised id then gets named instead of excused.
 */
export const LOCALLY_MINTED_PREFIXES = ["block-", "comp-", "manual-"] as const;

export type LinkIdClass = "block-placeholder" | "comped" | "manual" | "gateway";

export function classifyLinkId(linkId: string): LinkIdClass {
  if (linkId.startsWith("block-")) return "block-placeholder";
  if (linkId.startsWith("comp-")) return "comped";
  if (linkId.startsWith("manual-")) return "manual";
  return "gateway";
}

/**
 * The subscription uniqueness tuple, as a string. Mirrors
 * subscriptions_device_year_subject_uidx: the year plan collapses onto the
 * 'year' sentinel so a NULL subject is comparable.
 */
export function naturalKey(row: {
  device_id: string;
  year_id: string;
  subject_id: string | null;
}): string {
  return `${row.device_id}|${row.year_id}|${row.subject_id ?? "year"}`;
}

// ── The known-exception register ────────────────────────────────────────────

export interface KnownException {
  /** The entitlement's paymongo_link_id. */
  linkId: string;
  /** Why this entitlement legitimately has no payment row. Required. */
  reason: string;
  /** YYYY-MM-DD the exception was accepted. Required. */
  since: string;
}

/**
 * Owner-maintained. SHIPS EMPTY on purpose: an empty register means nothing is
 * excused by default, so the first month's report has to look at every
 * unmatched entitlement rather than inheriting someone's assumption. Adding an
 * entry is a deliberate act that costs one line and a sentence of reasoning —
 * the same shape as an ACCEPTED finding, and for the same reason.
 */
export const KNOWN_EXCEPTIONS: readonly KnownException[] = [];

// ── Exceptions ──────────────────────────────────────────────────────────────

export type ExceptionKind =
  | "entitlement-without-payment"
  | "entitlement-locally-minted"
  | "entitlement-known-exception"
  | "payment-without-entitlement"
  | "amount-not-attributable"
  | "duplicate-entitlement"
  | "grant-device-mismatch";

/** Fixed order so the summary's row set never changes shape between runs. */
export const EXCEPTION_KINDS: readonly ExceptionKind[] = [
  "entitlement-without-payment",
  "entitlement-locally-minted",
  "entitlement-known-exception",
  "payment-without-entitlement",
  "amount-not-attributable",
  "duplicate-entitlement",
  "grant-device-mismatch",
] as const;

/**
 * The two kinds nothing explains. Everything else on the matching axis has a
 * documented cause; these two are the ones the escalation list is about.
 */
export const UNRECONCILED_KINDS: readonly ExceptionKind[] = [
  "entitlement-without-payment",
  "payment-without-entitlement",
] as const;

export interface LedgerException {
  kind: ExceptionKind;
  /** The link id that ties this exception back to a real row. */
  linkId: string;
  deviceId: string;
  yearId: string;
  subjectId: string | null;
  /** Present when money is involved; null when the exception is about a grant. */
  amountCentavos: number | null;
  /** paid_at, or the entitlement's created_at. */
  occurredAt: string;
  /** Written for a human. A kind on its own is not a finding. */
  reason: string;
}

export interface MatchedPair {
  paymentId: string;
  entitlementId: string;
  entitlementKind: Entitlement["kind"];
  via: "link-id" | "natural-key";
}

export interface ReconcileInput {
  payments: PaymentRow[];
  subscriptions: SubscriptionRow[];
  classes: ClassRow[];
  isBlockAmount: BlockAmountMatcher;
  register?: readonly KnownException[];
}

export interface ReconcileResult {
  matched: MatchedPair[];
  exceptions: LedgerException[];
  counts: {
    payments: number;
    entitlements: number;
    matchedDirect: number;
    matchedByRenewal: number;
  };
}

function toEntitlements(input: ReconcileInput): Entitlement[] {
  return [
    ...input.subscriptions.map((row): Entitlement => ({
      kind: "subscription",
      id: row.id,
      linkId: row.paymongo_link_id,
      deviceId: row.device_id,
      yearId: row.year_id,
      subjectId: row.subject_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end,
      createdAt: row.created_at,
    })),
    ...input.classes.map((row): Entitlement => ({
      kind: "class",
      id: row.id,
      linkId: row.paymongo_link_id,
      // The rep is who paid. Members join for free against the rep's purchase.
      deviceId: row.rep_device_id,
      yearId: row.year_id,
      subjectId: row.subject_id,
      status: row.status,
      currentPeriodEnd: row.current_period_end,
      createdAt: row.created_at,
    })),
  ];
}

export function reconcile(input: ReconcileInput): ReconcileResult {
  const register = input.register ?? KNOWN_EXCEPTIONS;
  const registered = new Map(register.map((entry) => [entry.linkId, entry]));

  const entitlements = toEntitlements(input);
  const matched: MatchedPair[] = [];
  const exceptions: LedgerException[] = [];

  const paymentsByLinkId = new Map(
    input.payments.map((row) => [row.paymongo_link_id, row])
  );
  const entitlementsByLinkId = new Map(
    entitlements.map((entitlement) => [entitlement.linkId, entitlement])
  );
  const entitlementsByNaturalKey = new Map<string, Entitlement[]>();
  for (const entitlement of entitlements) {
    const key = naturalKey({
      device_id: entitlement.deviceId,
      year_id: entitlement.yearId,
      subject_id: entitlement.subjectId,
    });
    entitlementsByNaturalKey.set(key, [
      ...(entitlementsByNaturalKey.get(key) ?? []),
      entitlement,
    ]);
  }

  // ── Entitlement axis: every entitlement lands in exactly one bucket ──
  let matchedDirect = 0;
  for (const entitlement of entitlements) {
    const payment = paymentsByLinkId.get(entitlement.linkId);

    if (payment) {
      matchedDirect += 1;
      matched.push({
        paymentId: payment.id,
        entitlementId: entitlement.id,
        entitlementKind: entitlement.kind,
        via: "link-id",
      });

      // Integrity, not matching: the grant went somewhere the money did not.
      if (payment.device_id !== entitlement.deviceId) {
        exceptions.push({
          kind: "grant-device-mismatch",
          linkId: entitlement.linkId,
          deviceId: entitlement.deviceId,
          yearId: entitlement.yearId,
          subjectId: entitlement.subjectId,
          amountCentavos: payment.amount,
          occurredAt: entitlement.createdAt,
          reason:
            `The ${entitlement.kind} on device ${entitlement.deviceId} was granted ` +
            `against a payment made by device ${payment.device_id}. One device paid ` +
            `and a different one was given access.`,
        });
      }
      continue;
    }

    const known = registered.get(entitlement.linkId);
    if (known) {
      exceptions.push({
        kind: "entitlement-known-exception",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason: `Accepted ${known.since}: ${known.reason}`,
      });
      continue;
    }

    const linkClass = classifyLinkId(entitlement.linkId);
    if (linkClass !== "gateway") {
      exceptions.push({
        kind: "entitlement-locally-minted",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason:
          `${entitlement.kind} carries a locally-minted ${linkClass} link id, so it ` +
          `was granted by hand and has no ledger row by design. Confirm it was ` +
          `intended, then add it to KNOWN_EXCEPTIONS so it stops recurring.`,
      });
      continue;
    }

    exceptions.push({
      kind: "entitlement-without-payment",
      linkId: entitlement.linkId,
      deviceId: entitlement.deviceId,
      yearId: entitlement.yearId,
      subjectId: entitlement.subjectId,
      amountCentavos: null,
      occurredAt: entitlement.createdAt,
      reason:
        `${entitlement.kind} ${entitlement.id} carries a gateway link id with no ` +
        `payments row. Either it was comped without being recorded, or entitlement ` +
        `was written without money. Resolve which before next month.`,
    });
  }

  // ── Matching axis: every payment lands in exactly one bucket ──
  let matchedByRenewal = 0;
  for (const payment of input.payments) {
    if (entitlementsByLinkId.has(payment.paymongo_link_id)) continue; // counted above

    const siblings = entitlementsByNaturalKey.get(naturalKey(payment)) ?? [];
    const renewalTarget = siblings[0];
    if (renewalTarget) {
      // recordPayment overwrote the entitlement's link id on a later payment.
      // Legitimate, and emphatically not money-without-entitlement.
      matchedByRenewal += 1;
      matched.push({
        paymentId: payment.id,
        entitlementId: renewalTarget.id,
        entitlementKind: renewalTarget.kind,
        via: "natural-key",
      });
      continue;
    }

    exceptions.push({
      kind: "payment-without-entitlement",
      linkId: payment.paymongo_link_id,
      deviceId: payment.device_id,
      yearId: payment.year_id,
      subjectId: payment.subject_id,
      amountCentavos: payment.amount,
      occurredAt: payment.paid_at,
      reason:
        `Payment ${payment.id} has no subscription or class, by link id or by ` +
        `device/year/subject. Money was received and nothing was granted — this is ` +
        `a paying user who may be locked out right now.`,
    });
  }

  // ── Amount axis ──
  for (const payment of input.payments) {
    const { bucket } = attributePlan(
      payment.amount,
      payment.subject_id,
      input.isBlockAmount
    );
    if (bucket !== "unattributed") continue;

    exceptions.push({
      kind: "amount-not-attributable",
      linkId: payment.paymongo_link_id,
      deviceId: payment.device_id,
      yearId: payment.year_id,
      subjectId: payment.subject_id,
      amountCentavos: payment.amount,
      occurredAt: payment.paid_at,
      reason:
        `Payment ${payment.id} is at an amount no current plan or block price ` +
        `explains. Either a price changed without the ledger being re-read, or a ` +
        `link was minted by hand at a custom amount.`,
    });
  }

  // ── Integrity axis: duplicates ──
  for (const [key, group] of entitlementsByNaturalKey) {
    if (group.length < 2) continue;
    for (const entitlement of group) {
      exceptions.push({
        kind: "duplicate-entitlement",
        linkId: entitlement.linkId,
        deviceId: entitlement.deviceId,
        yearId: entitlement.yearId,
        subjectId: entitlement.subjectId,
        amountCentavos: null,
        occurredAt: entitlement.createdAt,
        reason:
          `${group.length} entitlements share the key ${key}. ` +
          `subscriptions_device_year_subject_uidx should make this impossible for ` +
          `subscriptions, so either the index is gone or a class overlaps a ` +
          `subscription.`,
      });
    }
  }

  return {
    matched,
    exceptions,
    counts: {
      payments: input.payments.length,
      entitlements: entitlements.length,
      matchedDirect,
      matchedByRenewal,
    },
  };
}

export interface ExceptionSummary {
  byKind: Record<ExceptionKind, number>;
  /** The two kinds nothing explains. This is the number that escalates. */
  unreconciled: number;
  /** Money sitting behind payments that granted nothing. */
  unmatchedPaymentCentavos: number;
}

export function summariseExceptions(
  exceptions: LedgerException[]
): ExceptionSummary {
  const byKind = Object.fromEntries(
    EXCEPTION_KINDS.map((kind) => [kind, 0])
  ) as Record<ExceptionKind, number>;

  let unmatchedPaymentCentavos = 0;
  for (const exception of exceptions) {
    byKind[exception.kind] += 1;
    if (exception.kind === "payment-without-entitlement") {
      unmatchedPaymentCentavos += exception.amountCentavos ?? 0;
    }
  }

  return {
    byKind,
    unreconciled: UNRECONCILED_KINDS.reduce((sum, kind) => sum + byKind[kind], 0),
    unmatchedPaymentCentavos,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/ledgerIntegrity.test.ts`
Expected: PASS — 37 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/ledgerIntegrity.ts lib/reports/ledgerIntegrity.test.ts
git commit -m "feat(reports): reconcile entitlement against the payments ledger"
```

---

### Task 6: Revenue recognition, renewals and expiry

**Files:**
- Create: `lib/reports/revenueRecognition.ts`
- Test: `lib/reports/revenueRecognition.test.ts`

**Interfaces:**
- Consumes: `SEMESTER_END`, `periodEndFor` from `lib/paymongo.ts`; `phMonthKey` from `lib/reports/phWindow.ts`.
- Produces: `recognise`, `recogniseLedger`, `semesterEndStatus`, `semesterPlanParity`, `EXPIRY_BUCKETS`, `expirySchedule`.

Charter sub-functions 7 and 8. Once subscriptions are the model, money received is not the same as money earned: a semester plan bought in August has been paid for but not yet delivered, and the undelivered part is a liability, not revenue. This module draws that line and then answers the next question — when does the delivered part run out, and how much is at risk when it does.

**Recognition is straight-line between `paid_at` and the entitlement's `current_period_end`.** Nothing more elaborate is justified: there is one deliverable, it is available continuously, and the period is short. `earned + deferred` is asserted to equal the payment exactly, with `deferred` computed by subtraction so integer centavos can never drift apart.

**A renewal destroys the original period, and the module says so rather than guessing.** `recordPayment` **updates** `subscriptions.current_period_end` in place, so a payment superseded by a later one has no recoverable period end of its own. Those are recognised as fully earned — which is right, because a period that was replaced by a renewal has by definition elapsed — and counted separately as `supersededCount` so LEDGER can qualify the deferred figure instead of presenting it as exact.

**Two standing checks on `SEMESTER_END` come out of this, and the second is the one that matters.** `SEMESTER_END` is a hardcoded constant in `lib/paymongo.ts:18`, bumped by hand once per semester. `periodEndFor` floors every semester plan at 31 days, so:

- **Parity.** Once `now + 31 days` reaches `SEMESTER_END`, `periodEndFor("subject_sem")` and `periodEndFor("subject_month")` return the same instant. From that day on the semester plan and the month plan deliver **identical access at double the price**, and nothing in the product notices. That starts 31 days *before* the semester ends, not after it, which is why nobody would catch it by watching the calendar.
- **Staleness.** After `SEMESTER_END` passes with no bump, every semester plan silently becomes a 31-day plan.

Both are deterministic functions of the constant and today's date, so both are computed here and neither is left to the agent to remember.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/revenueRecognition.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SEMESTER_END } from "../paymongo";
import {
  recognise,
  recogniseLedger,
  semesterEndStatus,
  semesterPlanParity,
  EXPIRY_BUCKETS,
  expirySchedule,
} from "./revenueRecognition";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("recognise", () => {
  const paidAt = "2026-07-01T00:00:00.000Z";
  const periodEnd = "2026-07-11T00:00:00.000Z"; // ten days

  it("earns nothing at the instant of payment", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date(paidAt),
    });
    expect(result).toMatchObject({ earnedCentavos: 0, deferredCentavos: 10000 });
  });

  it("earns half at the midpoint", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-07-06T00:00:00.000Z"),
    });
    expect(result.earnedCentavos).toBe(5000);
    expect(result.fractionElapsed).toBeCloseTo(0.5, 10);
  });

  it("earns everything once the period has ended", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-08-01T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, deferredCentavos: 0 });
  });

  it("never earns more than was paid, however far past the period", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2030-01-01T00:00:00.000Z"),
    });
    expect(result.fractionElapsed).toBe(1);
    expect(result.earnedCentavos).toBe(10000);
  });

  it("never earns a negative amount when asOf precedes the payment", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(result.fractionElapsed).toBe(0);
    expect(result.earnedCentavos).toBe(0);
  });

  it("treats a zero-length period as fully earned rather than dividing by zero", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd: paidAt,
      asOf: new Date("2026-07-05T00:00:00.000Z"),
    });
    expect(Number.isFinite(result.fractionElapsed)).toBe(true);
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "fully-earned" });
  });

  it("treats a payment superseded by a renewal as fully earned", () => {
    // recordPayment overwrote the subscription's period; the original is gone,
    // and a period replaced by a renewal has by definition elapsed.
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date(paidAt),
      superseded: true,
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "fully-earned" });
  });

  it("treats a payment with no known period as earned, and says which basis it used", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd: null,
      asOf: new Date("2026-07-05T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "no-period" });
  });

  it("always splits the payment exactly — earned plus deferred is the amount", () => {
    for (const amount of [4900, 9900, 29900, 79900, 1]) {
      for (const day of [1, 3, 7, 9]) {
        const result = recognise({
          amountCentavos: amount,
          paidAt,
          periodEnd,
          asOf: new Date(Date.parse(paidAt) + day * DAY_MS),
        });
        expect(result.earnedCentavos + result.deferredCentavos).toBe(amount);
      }
    }
  });

  it("returns whole centavos, never fractions", () => {
    const result = recognise({
      amountCentavos: 4900,
      paidAt,
      periodEnd,
      asOf: new Date("2026-07-04T00:00:00.000Z"),
    });
    expect(Number.isInteger(result.earnedCentavos)).toBe(true);
    expect(Number.isInteger(result.deferredCentavos)).toBe(true);
  });
});

describe("recogniseLedger", () => {
  const asOf = new Date("2026-07-06T00:00:00.000Z");
  const rows = [
    {
      amountCentavos: 10000,
      paidAt: "2026-07-01T00:00:00.000Z",
      periodEnd: "2026-07-11T00:00:00.000Z",
    },
    {
      amountCentavos: 10000,
      paidAt: "2026-06-01T00:00:00.000Z",
      periodEnd: "2026-06-11T00:00:00.000Z",
    },
  ];

  it("totals earned and deferred across the ledger", () => {
    expect(recogniseLedger(rows, asOf)).toMatchObject({
      earnedCentavos: 15000,
      deferredCentavos: 5000,
    });
  });

  it("is zero on an empty ledger rather than null", () => {
    expect(recogniseLedger([], asOf)).toMatchObject({
      earnedCentavos: 0,
      deferredCentavos: 0,
    });
  });

  it("counts the rows whose period was destroyed by a renewal", () => {
    const withRenewal = [...rows, { ...rows[0], superseded: true }];
    expect(recogniseLedger(withRenewal, asOf).supersededCount).toBe(1);
  });

  it("counts the rows that had no period at all", () => {
    const withOrphan = [...rows, { ...rows[0], periodEnd: null }];
    expect(recogniseLedger(withOrphan, asOf).noPeriodCount).toBe(1);
  });

  it("keeps the split exact across the whole ledger", () => {
    const totals = recogniseLedger(rows, asOf);
    const paid = rows.reduce((sum, row) => sum + row.amountCentavos, 0);
    expect(totals.earnedCentavos + totals.deferredCentavos).toBe(paid);
  });
});

describe("semesterEndStatus", () => {
  it("reads the constant rather than a copy of the date", () => {
    const status = semesterEndStatus(new Date("2026-08-08T05:00:00.000Z"));
    expect(status.semesterEndIso).toBe(SEMESTER_END.toISOString());
  });

  it("counts whole days remaining", () => {
    const oneWeekBefore = new Date(SEMESTER_END.getTime() - 7 * DAY_MS);
    expect(semesterEndStatus(oneWeekBefore).daysRemaining).toBe(7);
  });

  it("flags a constant that has gone stale", () => {
    const after = new Date(SEMESTER_END.getTime() + DAY_MS);
    expect(semesterEndStatus(after)).toMatchObject({ past: true });
  });

  it("does not report a live constant as stale", () => {
    const before = new Date(SEMESTER_END.getTime() - DAY_MS);
    expect(semesterEndStatus(before).past).toBe(false);
  });
});

describe("semesterPlanParity", () => {
  it("keeps the plans distinct well before the semester ends", () => {
    const early = new Date(SEMESTER_END.getTime() - 120 * DAY_MS);
    expect(semesterPlanParity(early).identical).toBe(false);
  });

  it("collapses the two plans 31 days out, while the semester plan still costs double", () => {
    const inside = new Date(SEMESTER_END.getTime() - 10 * DAY_MS);
    expect(semesterPlanParity(inside).identical).toBe(true);
  });

  it("stays collapsed once the constant is stale", () => {
    const after = new Date(SEMESTER_END.getTime() + 30 * DAY_MS);
    expect(semesterPlanParity(after).identical).toBe(true);
  });

  it("says how many days remain before the plans collapse", () => {
    const early = new Date(SEMESTER_END.getTime() - 61 * DAY_MS);
    expect(semesterPlanParity(early).daysUntilParity).toBe(30);
  });

  it("reports zero days once parity has already arrived", () => {
    const inside = new Date(SEMESTER_END.getTime() - 10 * DAY_MS);
    expect(semesterPlanParity(inside).daysUntilParity).toBe(0);
  });
});

describe("expirySchedule", () => {
  const now = new Date("2026-08-08T05:00:00.000Z");
  const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS).toISOString();

  const entitlement = (id: string, days: number, amount: number | null) => ({
    id,
    currentPeriodEnd: inDays(days),
    status: "active",
    amountCentavos: amount,
  });

  it("returns every bucket in a fixed order, even when empty", () => {
    const schedule = expirySchedule([], now);
    expect(schedule.buckets.map((bucket) => bucket.label)).toEqual([...EXPIRY_BUCKETS]);
  });

  it("sorts entitlements into the right horizon", () => {
    const schedule = expirySchedule(
      [
        entitlement("a", -1, 4900),
        entitlement("b", 3, 4900),
        entitlement("c", 20, 9900),
        entitlement("d", 60, 29900),
        entitlement("e", 300, 29900),
      ],
      now
    );
    const byLabel = new Map(schedule.buckets.map((bucket) => [bucket.label, bucket.count]));
    expect(byLabel.get("expired")).toBe(1);
    expect(byLabel.get("<=7d")).toBe(1);
    expect(byLabel.get("<=30d")).toBe(1);
    expect(byLabel.get("<=90d")).toBe(1);
    expect(byLabel.get("beyond")).toBe(1);
  });

  it("adds up the revenue at risk in each bucket", () => {
    const schedule = expirySchedule(
      [entitlement("a", 3, 4900), entitlement("b", 5, 9900)],
      now
    );
    const soon = schedule.buckets.find((bucket) => bucket.label === "<=7d");
    expect(soon).toMatchObject({ count: 2, revenueAtRiskCentavos: 14800 });
  });

  it("counts an entitlement whose amount is unknown without inventing one", () => {
    const schedule = expirySchedule([entitlement("a", 3, null)], now);
    const soon = schedule.buckets.find((bucket) => bucket.label === "<=7d");
    expect(soon).toMatchObject({ count: 1, revenueAtRiskCentavos: 0, unpricedCount: 1 });
  });

  it("surfaces the date the expiries cluster on", () => {
    const schedule = expirySchedule(
      [
        entitlement("a", 40, 9900),
        entitlement("b", 40, 9900),
        entitlement("c", 40, 9900),
        entitlement("d", 5, 4900),
      ],
      now
    );
    expect(schedule.clusters[0]).toMatchObject({ count: 3 });
  });

  it("reports concentration so the clustering can be quoted without arithmetic", () => {
    const schedule = expirySchedule(
      [entitlement("a", 40, 9900), entitlement("b", 40, 9900), entitlement("c", 5, 4900)],
      now
    );
    expect(schedule.concentration).toBeCloseTo(2 / 3, 10);
  });

  it("has zero concentration with nothing to cluster", () => {
    expect(expirySchedule([], now).concentration).toBe(0);
  });

  it("groups clusters by Manila calendar day, not UTC", () => {
    // Both instants are the same PH day; only one is the same UTC day.
    const schedule = expirySchedule(
      [
        { id: "a", currentPeriodEnd: "2026-09-30T16:30:00.000Z", status: "active", amountCentavos: 9900 },
        { id: "b", currentPeriodEnd: "2026-10-01T02:00:00.000Z", status: "active", amountCentavos: 9900 },
      ],
      now
    );
    expect(schedule.clusters).toHaveLength(1);
    expect(schedule.clusters[0].phDate).toBe("2026-10-01");
  });

  it("ignores an entitlement that is not active", () => {
    const schedule = expirySchedule(
      [{ ...entitlement("a", 3, 4900), status: "cancelled" }],
      now
    );
    expect(schedule.buckets.every((bucket) => bucket.count === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/revenueRecognition.test.ts`
Expected: FAIL — cannot resolve `./revenueRecognition`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/revenueRecognition.ts`:

```typescript
/**
 * Earned versus deferred revenue, and the expiry schedule behind it.
 *
 * Money received is not money earned. A semester plan bought in August has
 * been paid for and not yet delivered; the undelivered part is a liability.
 * That distinction did not matter under the one-time unlock and matters now
 * that subscriptions are the model.
 *
 * RECOGNITION IS STRAIGHT-LINE between paid_at and the entitlement's
 * current_period_end. Nothing more elaborate is justified: one deliverable,
 * continuously available, over a short period. `deferred` is computed by
 * SUBTRACTION from the payment rather than by its own multiplication, so
 * integer centavos can never drift apart from the amount actually received.
 *
 * A RENEWAL DESTROYS THE ORIGINAL PERIOD. recordPayment UPDATES
 * subscriptions.current_period_end in place, so a payment that a later payment
 * superseded has no recoverable period of its own. Those are recognised as
 * fully earned — a period replaced by a renewal has by definition elapsed —
 * and counted separately so the deferred total can be qualified rather than
 * presented as exact.
 *
 * TWO STANDING CHECKS ON SEMESTER_END, and the second is the dangerous one.
 * periodEndFor floors every semester plan at 31 days, so once `now + 31 days`
 * reaches SEMESTER_END the semester plan and the month plan return the SAME
 * period end — identical access at double the price. That begins 31 days
 * BEFORE the semester ends, which is why watching the calendar would not catch
 * it. The second check is the ordinary one: after SEMESTER_END passes without
 * a bump, every semester plan is silently a 31-day plan.
 */

import { SEMESTER_END, periodEndFor } from "../paymongo";
import { PH_OFFSET_MS } from "../payments";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface RecognitionInput {
  amountCentavos: number;
  paidAt: string;
  /** The entitlement's current_period_end. Null when nothing granted. */
  periodEnd: string | null;
  asOf: Date;
  /** True when a later payment overwrote this entitlement's period. */
  superseded?: boolean;
}

export interface Recognition {
  earnedCentavos: number;
  deferredCentavos: number;
  /** 0 to 1, clamped. Always finite. */
  fractionElapsed: number;
  basis: "straight-line" | "fully-earned" | "no-period";
}

function fullyEarned(
  amountCentavos: number,
  basis: Recognition["basis"]
): Recognition {
  return {
    earnedCentavos: amountCentavos,
    deferredCentavos: 0,
    fractionElapsed: 1,
    basis,
  };
}

export function recognise(input: RecognitionInput): Recognition {
  const { amountCentavos, superseded = false } = input;

  if (superseded) return fullyEarned(amountCentavos, "fully-earned");

  // No period means no entitlement was found for this payment. That row is
  // already being reported as a `payment-without-entitlement` exception at a
  // higher severity; counting it as deferred as well would inflate the
  // liability with money that is being escalated on another axis.
  if (input.periodEnd === null) return fullyEarned(amountCentavos, "no-period");

  const paid = Date.parse(input.paidAt);
  const end = Date.parse(input.periodEnd);
  if (!Number.isFinite(paid) || !Number.isFinite(end)) {
    return fullyEarned(amountCentavos, "no-period");
  }

  const span = end - paid;
  if (span <= 0) return fullyEarned(amountCentavos, "fully-earned");

  const elapsed = input.asOf.getTime() - paid;
  const fractionElapsed = Math.min(1, Math.max(0, elapsed / span));
  const earnedCentavos = Math.round(amountCentavos * fractionElapsed);

  return {
    earnedCentavos,
    deferredCentavos: amountCentavos - earnedCentavos,
    fractionElapsed,
    basis: "straight-line",
  };
}

export interface LedgerRecognition {
  earnedCentavos: number;
  deferredCentavos: number;
  /** Rows whose period was destroyed by a renewal. Qualifies `deferred`. */
  supersededCount: number;
  /** Rows with no entitlement to take a period from. Also qualifies it. */
  noPeriodCount: number;
  rows: number;
}

export function recogniseLedger(
  rows: Omit<RecognitionInput, "asOf">[],
  asOf: Date
): LedgerRecognition {
  const totals: LedgerRecognition = {
    earnedCentavos: 0,
    deferredCentavos: 0,
    supersededCount: 0,
    noPeriodCount: 0,
    rows: rows.length,
  };

  for (const row of rows) {
    const recognition = recognise({ ...row, asOf });
    totals.earnedCentavos += recognition.earnedCentavos;
    totals.deferredCentavos += recognition.deferredCentavos;
    if (row.superseded) totals.supersededCount += 1;
    if (recognition.basis === "no-period") totals.noPeriodCount += 1;
  }

  return totals;
}

// ── The SEMESTER_END constant ───────────────────────────────────────────────

export interface SemesterEndStatus {
  semesterEndIso: string;
  daysRemaining: number;
  /** True once the constant is in the past and has not been bumped. */
  past: boolean;
}

export function semesterEndStatus(now: Date): SemesterEndStatus {
  const remainingMs = SEMESTER_END.getTime() - now.getTime();
  return {
    semesterEndIso: SEMESTER_END.toISOString(),
    daysRemaining: Math.floor(remainingMs / DAY_MS),
    past: remainingMs <= 0,
  };
}

export interface PlanParity {
  /** True when the semester plan and the month plan grant the same period. */
  identical: boolean;
  semesterPlanEndIso: string;
  monthPlanEndIso: string;
  /** Days until the two collapse. Zero once they already have. */
  daysUntilParity: number;
}

/**
 * The check nobody would think to run. periodEndFor floors a semester plan at
 * 31 days, so from 31 days before SEMESTER_END the semester plan delivers
 * exactly what the month plan delivers — at double the price — and keeps doing
 * so forever if the constant is never bumped.
 */
export function semesterPlanParity(now: Date): PlanParity {
  const semesterPlanEnd = periodEndFor("subject_sem", now);
  const monthPlanEnd = periodEndFor("subject_month", now);
  const identical = semesterPlanEnd.getTime() === monthPlanEnd.getTime();

  const remainingMs = SEMESTER_END.getTime() - now.getTime();
  const daysUntilParity = identical
    ? 0
    : Math.max(0, Math.floor((remainingMs - 31 * DAY_MS) / DAY_MS));

  return {
    identical,
    semesterPlanEndIso: semesterPlanEnd.toISOString(),
    monthPlanEndIso: monthPlanEnd.toISOString(),
    daysUntilParity,
  };
}

// ── Expiry and revenue at risk ──────────────────────────────────────────────

export const EXPIRY_BUCKETS = ["expired", "<=7d", "<=30d", "<=90d", "beyond"] as const;
export type ExpiryBucket = (typeof EXPIRY_BUCKETS)[number];

export interface ExpiringEntitlement {
  id: string;
  currentPeriodEnd: string;
  status: string;
  /** From the payment that granted it. Null when no payment was matched. */
  amountCentavos: number | null;
}

export interface ExpiryBucketRow {
  label: ExpiryBucket;
  count: number;
  revenueAtRiskCentavos: number;
  /** How many of `count` had no matched payment, so contributed no money. */
  unpricedCount: number;
}

export interface ExpiryCluster {
  /** Manila calendar date the entitlements lapse on. */
  phDate: string;
  count: number;
  revenueAtRiskCentavos: number;
}

export interface ExpirySchedule {
  buckets: ExpiryBucketRow[];
  /** Busiest expiry dates, most crowded first. */
  clusters: ExpiryCluster[];
  /** Largest cluster as a share of all active entitlements. 0 when empty. */
  concentration: number;
}

function bucketFor(daysAway: number): ExpiryBucket {
  if (daysAway < 0) return "expired";
  if (daysAway <= 7) return "<=7d";
  if (daysAway <= 30) return "<=30d";
  if (daysAway <= 90) return "<=90d";
  return "beyond";
}

function phCalendarDate(iso: string): string {
  return new Date(Date.parse(iso) + PH_OFFSET_MS).toISOString().slice(0, 10);
}

export function expirySchedule(
  entitlements: ExpiringEntitlement[],
  now: Date
): ExpirySchedule {
  const buckets = new Map<ExpiryBucket, ExpiryBucketRow>(
    EXPIRY_BUCKETS.map((label) => [
      label,
      { label, count: 0, revenueAtRiskCentavos: 0, unpricedCount: 0 },
    ])
  );
  const clusters = new Map<string, ExpiryCluster>();

  // Only live entitlements are at risk. A cancelled row has already lapsed as
  // far as revenue is concerned, and counting it would double-count the loss.
  const active = entitlements.filter((entitlement) => entitlement.status === "active");

  for (const entitlement of active) {
    const daysAway = Math.floor(
      (Date.parse(entitlement.currentPeriodEnd) - now.getTime()) / DAY_MS
    );
    const row = buckets.get(bucketFor(daysAway))!;
    row.count += 1;
    if (entitlement.amountCentavos === null) row.unpricedCount += 1;
    row.revenueAtRiskCentavos += entitlement.amountCentavos ?? 0;

    // Manila day, not UTC: semester access clusters on an academic date, and
    // that date is a Philippine one. Grouping in UTC splits a single cluster
    // across two days for everything expiring after 16:00 UTC.
    const day = phCalendarDate(entitlement.currentPeriodEnd);
    const cluster = clusters.get(day) ?? {
      phDate: day,
      count: 0,
      revenueAtRiskCentavos: 0,
    };
    cluster.count += 1;
    cluster.revenueAtRiskCentavos += entitlement.amountCentavos ?? 0;
    clusters.set(day, cluster);
  }

  const ordered = [...clusters.values()].sort((a, b) => b.count - a.count);

  return {
    buckets: EXPIRY_BUCKETS.map((label) => buckets.get(label)!),
    clusters: ordered,
    concentration: active.length > 0 ? (ordered[0]?.count ?? 0) / active.length : 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/revenueRecognition.test.ts`
Expected: PASS — 33 tests.

**If the parity tests fail, do not weaken them.** They are pinned to `SEMESTER_END` as it is imported, so they follow the constant when it is bumped. A failure means `periodEndFor`'s flooring behaviour changed, which is a product change and a finding in its own right.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/revenueRecognition.ts lib/reports/revenueRecognition.test.ts
git commit -m "feat(reports): add revenue recognition and the expiry schedule"
```

---

### Task 7: Formula drift — a standing assertion against the block price

**Files:**
- Create: `lib/reports/blockPrice.ts`
- Test: `lib/reports/blockPrice.test.ts`

**Interfaces:**
- Consumes: `computePrice`, `MIN_SEATS`, `MAX_SEATS` from `app/(main)/for-blocks/pricing.ts` (test only); the three source files, read as text.
- Produces: `BLOCK_SOURCES`, `BlockConstants`, `extractConstants`, `normaliseToCentavos`, `blockPriceCentavos`, `isBlockAmountFrom`, `compareSources`, `FORMULA_MARKERS`, `formulaMarkersPresent`, `seatBoundEnforcement`.

Charter sub-function 6, and the one written as a standing assertion rather than a fix. The block price is computed in three places and has already drifted twice, most recently documented in commit `44c2957` — whose entire content was a comment correction, because the third copy existed and the warning comment did not mention it. Verified again on 2026-08-08, all three are still there:

| File | Unit | Role |
|---|---|---|
| `app/(main)/for-blocks/pricing.ts:5-10` | pesos | The client preview the buyer sees |
| `app/api/class/checkout/route.ts:9-19` | centavos | Prices the PayMongo link |
| `app/api/webhooks/paymongo/route.ts:118-123` | centavos | Recomputes the expected amount to reject underpayment |

The third is the one that must not drift: it is what stands between the product and a tampered link. If the webhook's copy ever falls below the checkout's, underpayments start being accepted silently. If it rises above, every legitimate payment is rejected with `Amount too low` and buyers are charged nothing while seeing a failure. Neither shows up in a test today.

**This is planned as a test that fails loudly, not as a report row.** A drift here is a P0 by the Finance escalation list — "price formula disagreement between any two sources" — and a P0 should break the build, not wait for the next monthly report. The collector still emits a row so LEDGER can state the check ran, but the enforcement lives in Vitest.

Two limits are stated rather than papered over. **The two route files are read as text, not imported.** Importing `app/api/class/checkout/route.ts` would pull in `next/server`, `next/headers` and a Supabase client, evaluate module-level code, and make a pricing assertion depend on the whole server runtime booting under jsdom. Textual extraction of named constants is narrower and far more robust. The consequence is that constant agreement is checked exactly, while formula *shape* is checked only structurally, by asserting both files still contain the canonical `Math.max(0, seats - INCLUDED_SEATS)` and `PER_SEAT_CENTAVOS` markers. That is weaker than executing them and it is said so in the module.

**`MAX_SEATS` is reported, not asserted.** `pricing.ts` declares `MAX_SEATS = 55`, and neither server path enforces it — both check only a lower bound. Whether that is deliberate could not be verified, so failing a test on it would be inventing a requirement. `seatBoundEnforcement` reports it and LEDGER writes it up as a finding with options. The seat *minimum* is different: it is genuinely duplicated three times, once as a bare literal in the webhook, and that one is asserted.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/blockPrice.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  computePrice,
  MIN_SEATS,
  MAX_SEATS,
} from "../../app/(main)/for-blocks/pricing";
import {
  BLOCK_SOURCES,
  extractConstants,
  normaliseToCentavos,
  blockPriceCentavos,
  isBlockAmountFrom,
  compareSources,
  FORMULA_MARKERS,
  formulaMarkersPresent,
  seatBoundEnforcement,
  type BlockConstants,
} from "./blockPrice";

// process.cwd() rather than __dirname: vitest runs from the repo root (see
// vitest.config.ts, which excludes .claude worktrees precisely because it does)
// and __dirname is not reliably defined in a Vite-transformed test module.
const REPO_ROOT = process.cwd();

function readSource(relativePath: string): string {
  const full = join(REPO_ROOT, relativePath);
  if (!existsSync(full)) {
    throw new Error(
      `Block-price source not found at ${full}. Either the file moved — in which ` +
        `case update BLOCK_SOURCES — or vitest is running from somewhere other ` +
        `than the repo root.`
    );
  }
  return readFileSync(full, "utf8");
}

const CONSTANTS: BlockConstants = {
  baseSubjectCentavos: 79900,
  baseAllCentavos: 99900,
  perSeatCentavos: 5900,
  includedSeats: 11,
};

describe("extractConstants", () => {
  const spec = BLOCK_SOURCES[1]; // the centavos-named checkout spec

  it("reads constants declared one per statement", () => {
    const source = `
      const BASE_SUBJECT_CENTAVOS = 79900;
      const BASE_ALL_CENTAVOS = 99900;
      const PER_SEAT_CENTAVOS = 5900;
      const INCLUDED_SEATS = 11;
    `;
    expect(extractConstants(source, spec)).toEqual({
      ok: true,
      constants: {
        baseSubjectCentavos: 79900,
        baseAllCentavos: 99900,
        perSeatCentavos: 5900,
        includedSeats: 11,
      },
    });
  });

  it("reads a comma-declared list spanning several lines", () => {
    // This is the webhook's actual shape.
    const source = `
      const BASE_SUBJECT_CENTAVOS = 79900,
        BASE_ALL_CENTAVOS = 99900,
        PER_SEAT_CENTAVOS = 5900,
        INCLUDED_SEATS = 11;
    `;
    expect(extractConstants(source, spec).ok).toBe(true);
  });

  it("names every constant it could not find", () => {
    const result = extractConstants("const PER_SEAT_CENTAVOS = 5900;", spec);
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.missing).toContain("BASE_SUBJECT_CENTAVOS");
      expect(result.missing).toContain("INCLUDED_SEATS");
    }
  });

  it("does not mistake a longer identifier for the one it wants", () => {
    // BASE_SUBJECT must not match inside BASE_SUBJECT_CENTAVOS.
    const pesosSpec = BLOCK_SOURCES[0];
    const result = extractConstants("const BASE_SUBJECT_CENTAVOS = 79900;", pesosSpec);
    expect(result).toMatchObject({ ok: false });
  });
});

describe("normaliseToCentavos", () => {
  it("scales pesos to centavos", () => {
    const scaled = normaliseToCentavos(
      { baseSubjectCentavos: 799, baseAllCentavos: 999, perSeatCentavos: 59, includedSeats: 11 },
      "pesos"
    );
    expect(scaled).toMatchObject({ baseSubjectCentavos: 79900, perSeatCentavos: 5900 });
  });

  it("leaves the seat count alone — it is a count, not money", () => {
    const scaled = normaliseToCentavos(
      { baseSubjectCentavos: 799, baseAllCentavos: 999, perSeatCentavos: 59, includedSeats: 11 },
      "pesos"
    );
    expect(scaled.includedSeats).toBe(11);
  });

  it("passes centavos through untouched", () => {
    expect(normaliseToCentavos(CONSTANTS, "centavos")).toEqual(CONSTANTS);
  });
});

describe("blockPriceCentavos", () => {
  it("charges the base at exactly the included seat count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 11)).toBe(79900);
  });

  it("uses the all-subjects base for an all-subjects block", () => {
    expect(blockPriceCentavos(CONSTANTS, "all", 11)).toBe(99900);
  });

  it("adds the per-seat price for every seat past the included count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 14)).toBe(79900 + 3 * 5900);
  });

  it("never goes below the base for a seat count under the included count", () => {
    expect(blockPriceCentavos(CONSTANTS, "subject", 2)).toBe(79900);
  });
});

describe("isBlockAmountFrom", () => {
  const isBlockAmount = isBlockAmountFrom(CONSTANTS);

  it("recognises the subject base", () => {
    expect(isBlockAmount(79900, "subject")).toBe(true);
  });

  it("recognises the all-subjects base", () => {
    expect(isBlockAmount(99900, "all")).toBe(true);
  });

  it("recognises a base plus whole extra seats", () => {
    expect(isBlockAmount(79900 + 4 * 5900, "subject")).toBe(true);
  });

  it("rejects an amount between two seat steps", () => {
    expect(isBlockAmount(79900 + 100, "subject")).toBe(false);
  });

  it("rejects a per-device plan price", () => {
    expect(isBlockAmount(9900, "subject")).toBe(false);
    expect(isBlockAmount(29900, "all")).toBe(false);
  });

  it("does not read a subject amount as an all-subjects block", () => {
    expect(isBlockAmount(79900, "all")).toBe(false);
  });
});

describe("compareSources", () => {
  it("finds no drift when every source agrees", () => {
    expect(
      compareSources([
        { path: "a", constants: CONSTANTS },
        { path: "b", constants: CONSTANTS },
      ])
    ).toEqual([]);
  });

  it("names the field and every value when a source disagrees", () => {
    const drift = compareSources([
      { path: "a", constants: CONSTANTS },
      { path: "b", constants: { ...CONSTANTS, perSeatCentavos: 6900 } },
    ]);
    expect(drift).toHaveLength(1);
    expect(drift[0].field).toBe("perSeatCentavos");
    expect(drift[0].values.map((entry) => entry.path).sort()).toEqual(["a", "b"]);
  });

  it("reports one drift per disagreeing field, not one per pair", () => {
    const drift = compareSources([
      { path: "a", constants: CONSTANTS },
      { path: "b", constants: { ...CONSTANTS, perSeatCentavos: 1, includedSeats: 2 } },
    ]);
    expect(drift.map((entry) => entry.field).sort()).toEqual([
      "includedSeats",
      "perSeatCentavos",
    ]);
  });
});

describe("formulaMarkersPresent", () => {
  it("accepts a source carrying the canonical expression", () => {
    expect(
      formulaMarkersPresent(
        "const extra = Math.max(0, seats - INCLUDED_SEATS) * PER_SEAT_CENTAVOS;"
      )
    ).toEqual([]);
  });

  it("names the markers a source is missing", () => {
    expect(formulaMarkersPresent("const extra = seats - 11;")).toEqual([
      ...FORMULA_MARKERS,
    ]);
  });
});

describe("seatBoundEnforcement", () => {
  it("reports a lower bound that is enforced", () => {
    const result = seatBoundEnforcement("if (seats < MIN_SEATS) return;", "if (seats < 11) return;");
    expect(result.minSeatsCheckout).toBe("MIN_SEATS");
    expect(result.minSeatsWebhookLiteral).toBe(11);
  });

  it("reports an unenforced upper bound rather than failing on it", () => {
    const result = seatBoundEnforcement("if (seats < MIN_SEATS) return;", "if (seats < 11) return;");
    expect(result.maxEnforcedAtCheckout).toBe(false);
    expect(result.maxEnforcedAtWebhook).toBe(false);
  });

  it("notices if an upper bound is ever added", () => {
    const result = seatBoundEnforcement("if (seats > MAX_SEATS) return;", "if (seats < 11) return;");
    expect(result.maxEnforcedAtCheckout).toBe(true);
  });
});

// ── The standing assertion. This is the point of the module. ────────────────

describe("the block price formula agrees across every source in the repo", () => {
  const sources = BLOCK_SOURCES.map((spec) => ({
    spec,
    text: readSource(spec.path),
  }));

  it("finds all three sources where the plan says they are", () => {
    expect(sources).toHaveLength(3);
    expect(sources.every((source) => source.text.length > 0)).toBe(true);
  });

  it("finds every constant in every source", () => {
    for (const { spec, text } of sources) {
      const result = extractConstants(text, spec);
      // If this fails, a constant was renamed or inlined. Update BLOCK_SOURCES
      // — do not delete the assertion.
      expect(result, `${spec.path} is missing constants`).toMatchObject({ ok: true });
    }
  });

  it("agrees on every constant once units are normalised", () => {
    const entries = sources.map(({ spec, text }) => {
      const result = extractConstants(text, spec);
      if (!result.ok) throw new Error(`${spec.path}: missing ${result.missing.join(", ")}`);
      return { path: spec.path, constants: normaliseToCentavos(result.constants, spec.unit) };
    });

    const drift = compareSources(entries);
    // A failure here is a P0 by the Finance escalation list: the webhook is
    // what rejects an underpayment, and a webhook that disagrees with checkout
    // either accepts short payments or rejects correct ones.
    expect(drift, `block price drift: ${JSON.stringify(drift)}`).toEqual([]);
  });

  it("agrees with the client preview at every seat count that can be sold", () => {
    const { spec, text } = sources[0];
    const result = extractConstants(text, spec);
    if (!result.ok) throw new Error("pricing.ts constants missing");
    const constants = normaliseToCentavos(result.constants, spec.unit);

    for (const seats of [MIN_SEATS, MIN_SEATS + 1, 20, 40, MAX_SEATS]) {
      for (const scope of ["subject", "all"] as const) {
        expect(
          Math.round(computePrice(scope, seats).total * 100),
          `computePrice disagrees at ${scope}/${seats} seats`
        ).toBe(blockPriceCentavos(constants, scope, seats));
      }
    }
  });

  it("still carries the canonical formula shape in both server copies", () => {
    for (const { spec, text } of sources.slice(1)) {
      expect(formulaMarkersPresent(text), `${spec.path} lost a formula marker`).toEqual([]);
    }
  });

  it("agrees on the seat minimum across all three copies, including the bare literal", () => {
    const checkout = sources[1].text;
    const webhook = sources[2].text;
    const bounds = seatBoundEnforcement(checkout, webhook);
    // The webhook hardcodes the minimum instead of importing it. That is a
    // fourth copy of a shared number and it is asserted, not merely reported.
    expect(bounds.minSeatsWebhookLiteral).toBe(MIN_SEATS);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/blockPrice.test.ts`
Expected: FAIL — cannot resolve `./blockPrice`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/blockPrice.ts`:

```typescript
/**
 * The standing assertion against block-price formula drift.
 *
 * The class block price is computed in three places and has drifted twice —
 * see commit 44c2957, whose whole content was a comment correction, because
 * the third copy existed and the warning comment did not name it:
 *
 *   app/(main)/for-blocks/pricing.ts        pesos     the buyer's preview
 *   app/api/class/checkout/route.ts         centavos  prices the PayMongo link
 *   app/api/webhooks/paymongo/route.ts      centavos  rejects underpayment
 *
 * The third is the one that must not drift. Below the checkout's price it
 * starts accepting short payments; above it, every legitimate payment is
 * rejected with "Amount too low" while the buyer sees a failure and is charged
 * nothing. Neither has a test today, which is why this module exists as an
 * assertion rather than as a report row: a P0 should break the build, not wait
 * for the next monthly report.
 *
 * THE ROUTE FILES ARE READ AS TEXT, NOT IMPORTED. Importing the checkout route
 * pulls in next/server, next/headers and a Supabase client, evaluates
 * module-level code, and makes a pricing assertion depend on the whole server
 * runtime booting under jsdom. Textual extraction of named constants is
 * narrower and much harder to break. The cost is real and is stated here
 * rather than hidden: constant agreement is checked exactly, but formula SHAPE
 * is only checked structurally, by asserting the canonical markers are still
 * present. A rewrite that keeps the constants and changes the arithmetic would
 * pass. Nothing short of executing all three copies closes that gap.
 */

export interface BlockConstants {
  baseSubjectCentavos: number;
  baseAllCentavos: number;
  perSeatCentavos: number;
  /** A seat count, not money. Never scaled by normaliseToCentavos. */
  includedSeats: number;
}

export interface BlockSourceSpec {
  /** Repo-relative path. */
  path: string;
  unit: "pesos" | "centavos";
  /** The identifier each constant goes by in this file. */
  names: {
    baseSubject: string;
    baseAll: string;
    perSeat: string;
    includedSeats: string;
  };
}

const CENTAVOS_NAMES = {
  baseSubject: "BASE_SUBJECT_CENTAVOS",
  baseAll: "BASE_ALL_CENTAVOS",
  perSeat: "PER_SEAT_CENTAVOS",
  includedSeats: "INCLUDED_SEATS",
} as const;

/**
 * Every place the block price is computed. Adding a fourth copy of the formula
 * without adding it here is how the drift happens; adding it here is how it
 * gets caught.
 */
export const BLOCK_SOURCES: readonly BlockSourceSpec[] = [
  {
    path: "app/(main)/for-blocks/pricing.ts",
    unit: "pesos",
    names: {
      baseSubject: "BASE_SUBJECT",
      baseAll: "BASE_ALL",
      perSeat: "PER_SEAT",
      includedSeats: "INCLUDED_SEATS",
    },
  },
  { path: "app/api/class/checkout/route.ts", unit: "centavos", names: CENTAVOS_NAMES },
  { path: "app/api/webhooks/paymongo/route.ts", unit: "centavos", names: CENTAVOS_NAMES },
] as const;

export type ExtractResult =
  | { ok: true; constants: BlockConstants }
  | { ok: false; missing: string[] };

/**
 * Pulls a named integer constant out of source text. Matches both
 * `const NAME = 123;` and the comma-declared form the webhook uses, and will
 * not match a longer identifier that merely starts with the name — the `=`
 * must follow the name directly, so BASE_SUBJECT never matches inside
 * BASE_SUBJECT_CENTAVOS.
 */
function readNumber(source: string, name: string): number | null {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}

export function extractConstants(
  source: string,
  spec: BlockSourceSpec
): ExtractResult {
  const found = {
    baseSubjectCentavos: readNumber(source, spec.names.baseSubject),
    baseAllCentavos: readNumber(source, spec.names.baseAll),
    perSeatCentavos: readNumber(source, spec.names.perSeat),
    includedSeats: readNumber(source, spec.names.includedSeats),
  };

  const missing = (
    [
      ["baseSubjectCentavos", spec.names.baseSubject],
      ["baseAllCentavos", spec.names.baseAll],
      ["perSeatCentavos", spec.names.perSeat],
      ["includedSeats", spec.names.includedSeats],
    ] as const
  )
    .filter(([field]) => found[field] === null)
    .map(([, name]) => name);

  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, constants: found as BlockConstants };
}

/** Money scales; the seat count does not. Getting that backwards is the bug. */
export function normaliseToCentavos(
  constants: BlockConstants,
  unit: BlockSourceSpec["unit"]
): BlockConstants {
  if (unit === "centavos") return constants;
  return {
    baseSubjectCentavos: constants.baseSubjectCentavos * 100,
    baseAllCentavos: constants.baseAllCentavos * 100,
    perSeatCentavos: constants.perSeatCentavos * 100,
    includedSeats: constants.includedSeats,
  };
}

/** The formula, defined once. Every comparison goes through this. */
export function blockPriceCentavos(
  constants: BlockConstants,
  scope: "subject" | "all",
  seats: number
): number {
  const base =
    scope === "all" ? constants.baseAllCentavos : constants.baseSubjectCentavos;
  const extraSeats = Math.max(0, seats - constants.includedSeats);
  return base + extraSeats * constants.perSeatCentavos;
}

/**
 * The BlockAmountMatcher lib/reports/unitEconomics.ts requires. An amount is a
 * block sale when it is the scope's base plus a whole number of extra seats.
 *
 * A per-device plan can never collide: every plan price is far below either
 * base. An OVERPAYMENT on a per-device plan theoretically could, and would be
 * filed as a block sale — but an overpayment large enough to reach ₱799 is
 * already an exception the reconciler surfaces on the amount axis.
 */
export function isBlockAmountFrom(constants: BlockConstants) {
  return (centavos: number, scope: "subject" | "all"): boolean => {
    const base =
      scope === "all" ? constants.baseAllCentavos : constants.baseSubjectCentavos;
    if (centavos < base) return false;
    const extra = centavos - base;
    return extra % constants.perSeatCentavos === 0;
  };
}

export interface Drift {
  field: keyof BlockConstants;
  values: { path: string; value: number }[];
}

export function compareSources(
  entries: { path: string; constants: BlockConstants }[]
): Drift[] {
  if (entries.length < 2) return [];

  const fields: (keyof BlockConstants)[] = [
    "baseSubjectCentavos",
    "baseAllCentavos",
    "perSeatCentavos",
    "includedSeats",
  ];

  // One entry per disagreeing FIELD, not per pair: three sources disagreeing
  // on one number is one problem, and reporting it three times buries it.
  return fields
    .filter(
      (field) => new Set(entries.map((entry) => entry.constants[field])).size > 1
    )
    .map((field) => ({
      field,
      values: entries.map((entry) => ({
        path: entry.path,
        value: entry.constants[field],
      })),
    }));
}

/**
 * The canonical expression both server copies must still contain. This is a
 * structural check, not a semantic one — see the module header for what it
 * does and does not catch.
 */
export const FORMULA_MARKERS = [
  "Math.max(0, seats - INCLUDED_SEATS)",
  "PER_SEAT_CENTAVOS",
] as const;

export function formulaMarkersPresent(source: string): string[] {
  return FORMULA_MARKERS.filter((marker) => !source.includes(marker));
}

export interface SeatBounds {
  /** The identifier the checkout route compares against, or null. */
  minSeatsCheckout: string | null;
  /** The bare literal the webhook compares against, or null. */
  minSeatsWebhookLiteral: number | null;
  maxEnforcedAtCheckout: boolean;
  maxEnforcedAtWebhook: boolean;
}

/**
 * Reported, not asserted, for the upper bound. MAX_SEATS is declared in
 * pricing.ts and enforced by neither server path — both check only a lower
 * bound. Whether that is deliberate could not be verified, and failing a test
 * on it would be inventing a requirement. LEDGER writes it up as a finding
 * with options instead.
 *
 * The lower bound is different: it is duplicated three times, once as a bare
 * literal in the webhook, and the test asserts those agree.
 */
export function seatBoundEnforcement(
  checkoutSource: string,
  webhookSource: string
): SeatBounds {
  const checkoutMin = checkoutSource.match(/seats\s*<\s*([A-Za-z_][A-Za-z0-9_]*)/);
  const webhookMin = webhookSource.match(/seats\s*<\s*(\d+)/);

  return {
    minSeatsCheckout: checkoutMin ? checkoutMin[1] : null,
    minSeatsWebhookLiteral: webhookMin ? Number(webhookMin[1]) : null,
    maxEnforcedAtCheckout: /MAX_SEATS/.test(checkoutSource),
    maxEnforcedAtWebhook: /MAX_SEATS/.test(webhookSource),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/blockPrice.test.ts`
Expected: PASS — 31 tests.

**If the standing assertion fails on the first run, that is not a broken test.** It means the three copies disagree right now, which is the P0 this module exists to find. Stop and fix the source, then re-run. Do not relax the assertion to make it pass.

- [ ] **Step 5: Confirm the assertion actually bites**

Temporarily change `PER_SEAT` in `app/(main)/for-blocks/pricing.ts` from `59` to `60`, then run:

```bash
npx vitest run lib/reports/blockPrice.test.ts
```

Expected: FAIL, with `block price drift:` naming `perSeatCentavos` and all three paths, plus a second failure from the `computePrice` seat spread.

**Revert the edit** and re-run to confirm green:

```bash
git checkout -- "app/(main)/for-blocks/pricing.ts"
npx vitest run lib/reports/blockPrice.test.ts
```

A standing assertion nobody has watched fail is an assertion nobody knows works.

- [ ] **Step 6: Commit**

```bash
git add lib/reports/blockPrice.ts lib/reports/blockPrice.test.ts
git commit -m "feat(reports): assert the block price agrees across all three sources"
```

---

### Task 8: Billing operations and the `PAYMONGO_LIVEMODE` mode-matching trap

**Files:**
- Create: `lib/reports/billingSignals.ts`
- Test: `lib/reports/billingSignals.test.ts`

**Interfaces:**
- Consumes: nothing. Pure, and deliberately takes counts rather than rows so it can be tested without a database.
- Produces: `SENSITIVE_PLACEHOLDER`, `readLivemodeFlag`, `LIVEMODE_TRAP`, `modeMatchSignal`, `INTENT_EVENT_TYPES`, `intentPerPayment`, `quietLedger`, `WEBHOOK_LANDING_CEILING`, `INTENT_IS_NOT_DEVICES`, `abandonmentHandoff`.

Charter sub-function 3, plus the `PAYMONGO_LIVEMODE` trap that appears in both the Finance and Security charters. This is the hardest module to make honest, because the thing most worth knowing is the thing that cannot be read.

**The trap, exactly.** `app/api/webhooks/paymongo/route.ts:21` computes `const EXPECTED_LIVEMODE = process.env.PAYMONGO_LIVEMODE === "true"`, and line 74 returns `200 { ok: true, ignored: "livemode" }` on a mismatch. Returning 2xx is correct — it stops PayMongo retrying an event this deployment will never act on — but it means **a mismatch produces no error anywhere**. PayMongo sees success. Vercel logs a 200. The buyer's money is taken. No subscription is written. The only visible symptom is an absence: payments stop arriving and nothing says why.

The coercion is what makes it dangerous. `=== "true"` turns *every* non-`"true"` value into "expect test mode" — unset, empty, `True`, a typo, and the literal string `[SENSITIVE]`. Any of those in a production environment silently switches production into test-only mode.

**The collector cannot read production's value, and must not pretend otherwise.** `PAYMONGO_LIVEMODE`, `PAYMONGO_SECRET_KEY` and `PAYMONGO_WEBHOOK_SECRET` in `.env.reports.local` are all the literal string `[SENSITIVE]` — verified — because `vercel env pull` cannot retrieve Sensitive values. And even if it could, that file is a local copy, not the deployed environment. So the reading is `not read`, twice over, and the metric row says so.

**What is left is a database-side proxy, and it is a good one.** A row in `payments` can only be written by a webhook that already passed the livemode gate. So **any payment at all is proof the mode matched at the moment it landed.** That gives three deterministic states:

| Payments in window | Intent in window | State | What it means |
|---|---|---|---|
| > 0 | any | `consistent` | The gate passed. Mode matching is fine. |
| 0 | > 0 | `intent-without-money` | People tried and nothing landed. Three live hypotheses, all named. |
| 0 | 0 | `no-signal` | Nobody tried. This says nothing about the webhook either way. |

The middle row is the one worth a report, and the module refuses to collapse it into a verdict. Its three hypotheses — a livemode mismatch, a webhook failing for another reason, or simply nobody completing a purchase — are all consistent with the same evidence, and LEDGER presents all three rather than picking the alarming one.

**Abandonment is counted in events, not devices, and is handed to Growth rather than resolved here.** Intent comes from `events` rows of type `subscribe_click` and `paywall_teaser_click`, which are counted with `head: true` queries so the 1000-row select cap does not apply. One device can click many times, so `intentPerPayment` is emphatically **not** a conversion rate; the device-level funnel is `growth_funnel_agg`'s job and Finance names it as a handoff instead of computing a second, disagreeing version.

**The authoritative webhook-landing check is a manual procedure, and the module says which one.** Confirming that every paid link produced a ledger row means listing payments at PayMongo — `listRecentPaidLinks` in `lib/paymongo.ts` — which needs the live secret key. That is `[SENSITIVE]`, so the collector cannot do it. The existing admin reconcile view (`app/api/admin/reconcile/route.ts`) already performs exactly this check with real credentials, so LEDGER recommends running it rather than inventing a substitute.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/billingSignals.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  SENSITIVE_PLACEHOLDER,
  readLivemodeFlag,
  LIVEMODE_TRAP,
  modeMatchSignal,
  INTENT_EVENT_TYPES,
  intentPerPayment,
  quietLedger,
  WEBHOOK_LANDING_CEILING,
  INTENT_IS_NOT_DEVICES,
  abandonmentHandoff,
} from "./billingSignals";

const WINDOW = {
  sinceIso: "2026-08-01T16:00:00.000Z",
  untilIso: "2026-09-01T16:00:00.000Z",
};

describe("readLivemodeFlag", () => {
  it("reads an explicit true", () => {
    expect(readLivemodeFlag("true")).toMatchObject({ value: true, state: "true" });
  });

  it("reads an explicit false", () => {
    expect(readLivemodeFlag("false")).toMatchObject({ value: false, state: "false" });
  });

  it("reports an unset variable as unset, not as false", () => {
    expect(readLivemodeFlag(undefined)).toMatchObject({ value: null, state: "unset" });
  });

  it("reports the Sensitive placeholder as not read, never as a value", () => {
    expect(readLivemodeFlag(SENSITIVE_PLACEHOLDER)).toMatchObject({
      value: null,
      state: "sensitive-placeholder",
    });
  });

  it("reproduces the webhook's coercion exactly, including its failure mode", () => {
    // Everything that is not the literal "true" makes the app expect TEST.
    expect(readLivemodeFlag("true").appWouldExpectLive).toBe(true);
    expect(readLivemodeFlag("True").appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(" true").appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(undefined).appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(SENSITIVE_PLACEHOLDER).appWouldExpectLive).toBe(false);
  });

  it("flags any value that is neither a clean true nor a clean false", () => {
    expect(readLivemodeFlag("True").state).toBe("malformed");
    expect(readLivemodeFlag("").state).toBe("unset");
  });

  it("keeps the trap written down rather than leaving it to memory", () => {
    expect(LIVEMODE_TRAP).toMatch(/200/);
    expect(LIVEMODE_TRAP).toMatch(/silent/i);
  });
});

describe("modeMatchSignal", () => {
  it("treats any payment as proof the livemode gate passed", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 1, intentInWindow: 0 });
    expect(signal.state).toBe("consistent");
    expect(signal.hypotheses).toEqual([]);
  });

  it("reports intent with no money without deciding what caused it", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 25 });
    expect(signal.state).toBe("intent-without-money");
    expect(signal.hypotheses).toHaveLength(3);
  });

  it("names all three hypotheses, including the boring one", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 25 });
    const text = signal.hypotheses.join(" ").toLowerCase();
    expect(text).toContain("livemode");
    expect(text).toContain("webhook");
    expect(text).toMatch(/nobody|did not complete|no one/);
  });

  it("says nothing at all when nobody tried", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 0 });
    expect(signal.state).toBe("no-signal");
    expect(signal.hypotheses).toEqual([]);
  });

  it("carries the evidence it used, so the state can be checked", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 4 });
    expect(signal.evidence).toMatchObject({ paymentsInWindow: 0, intentInWindow: 4 });
  });

  it("treats a null intent count as no signal rather than as zero", () => {
    // A failed count must never read as "nobody tried".
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: null });
    expect(signal.state).toBe("no-signal");
  });
});

describe("INTENT_EVENT_TYPES", () => {
  it("counts the two live paywall click events and nothing dead", () => {
    expect([...INTENT_EVENT_TYPES]).toEqual(["subscribe_click", "paywall_teaser_click"]);
  });
});

describe("intentPerPayment", () => {
  it("divides intent events by payments", () => {
    expect(intentPerPayment(40, 4)).toBe(10);
  });

  it("returns null rather than Infinity when nothing was paid", () => {
    expect(intentPerPayment(40, 0)).toBeNull();
  });

  it("returns null when intent could not be counted", () => {
    expect(intentPerPayment(null, 4)).toBeNull();
  });

  it("rounds to two decimals", () => {
    expect(intentPerPayment(10, 3)).toBe(3.33);
  });
});

describe("quietLedger", () => {
  const now = new Date("2026-08-08T05:00:00.000Z");

  it("counts whole days since the last payment", () => {
    expect(
      quietLedger("2026-08-01T05:00:00.000Z", now).daysSinceLastPayment
    ).toBe(7);
  });

  it("is null, not zero, when the ledger has never had a payment", () => {
    expect(quietLedger(null, now).daysSinceLastPayment).toBeNull();
  });

  it("does not go negative on a clock skew", () => {
    expect(
      quietLedger("2026-08-09T05:00:00.000Z", now).daysSinceLastPayment
    ).toBe(0);
  });
});

describe("abandonmentHandoff", () => {
  const handoff = abandonmentHandoff({
    window: WINDOW,
    intentEvents: 40,
    payments: 4,
  });

  it("names the window it covers", () => {
    expect(handoff.window).toEqual(WINDOW);
  });

  it("carries the ratio it computed", () => {
    expect(handoff.intentPerPayment).toBe(10);
  });

  it("states that this is not a conversion rate", () => {
    expect(handoff.caveat).toBe(INTENT_IS_NOT_DEVICES);
    expect(handoff.caveat).toMatch(/not a conversion rate/i);
  });

  it("points at the department that owns the device-level number", () => {
    expect(handoff.caveat.toLowerCase()).toContain("growth");
  });
});

describe("WEBHOOK_LANDING_CEILING", () => {
  it("names the manual procedure instead of implying the collector can do it", () => {
    expect(WEBHOOK_LANDING_CEILING).toMatch(/reconcile/i);
    expect(WEBHOOK_LANDING_CEILING).toMatch(/\[SENSITIVE\]/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/billingSignals.test.ts`
Expected: FAIL — cannot resolve `./billingSignals`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/billingSignals.ts`:

```typescript
/**
 * Billing operations, and the PAYMONGO_LIVEMODE mode-matching trap.
 *
 * THE TRAP. app/api/webhooks/paymongo/route.ts:21 computes
 * `EXPECTED_LIVEMODE = process.env.PAYMONGO_LIVEMODE === "true"`, and line 74
 * answers a mismatch with 200 { ok: true, ignored: "livemode" }. The 2xx is
 * correct — it stops PayMongo retrying an event this deployment will never act
 * on — but it means a mismatch produces NO ERROR ANYWHERE. PayMongo records
 * success. Vercel logs a 200. The buyer is charged. No subscription is written.
 * The only symptom is an absence.
 *
 * The `=== "true"` coercion is what makes it dangerous: every value that is not
 * the exact literal "true" means "expect test mode" — unset, empty, "True", a
 * trailing space, or the literal string "[SENSITIVE]". Any of those in a
 * production environment quietly switches production into test-only mode.
 *
 * THIS COLLECTOR CANNOT READ PRODUCTION'S VALUE. The PayMongo variables in
 * .env.reports.local are all the literal "[SENSITIVE]", because `vercel env
 * pull` cannot retrieve Sensitive values — and even a readable value would
 * only describe a local file, not the deployed environment. The reading is
 * `not read`, twice over, and it is reported that way rather than coerced.
 *
 * WHAT IS LEFT IS A DATABASE-SIDE PROXY, AND IT IS A GOOD ONE. A row in
 * `payments` can only be written by a webhook that already passed the livemode
 * gate, so ANY payment is proof the mode matched when it landed. Absence of
 * payments proves nothing on its own — which is exactly why the signal is
 * three-valued and why the middle state carries three hypotheses instead of a
 * verdict.
 *
 * Everything here takes counts rather than rows: intent is counted with
 * `head: true` queries against `events`, which is far past the 1000-row select
 * cap, and a count query is unaffected by it.
 */

/** What `vercel env pull` writes in place of a Sensitive value. */
export const SENSITIVE_PLACEHOLDER = "[SENSITIVE]";

export const LIVEMODE_TRAP =
  "A PAYMONGO_LIVEMODE mismatch is silent: the webhook answers 200 with " +
  'ignored: "livemode", so PayMongo records success, Vercel logs no error, the ' +
  "buyer is charged, and no entitlement is written. The only symptom is payments " +
  "stopping. Because the check is `=== \"true\"`, any value other than that exact " +
  "literal — unset, empty, mis-cased, or [SENSITIVE] — puts production in test mode.";

export type LivemodeState = "true" | "false" | "unset" | "sensitive-placeholder" | "malformed";

export interface LivemodeReading {
  /** The honest reading. Null whenever the value is not usable. */
  value: boolean | null;
  state: LivemodeState;
  /**
   * What the webhook's `=== "true"` would produce for this raw value. The gap
   * between this and `value` is the trap made visible: a value we cannot read
   * still coerces to "expect test mode" in the running app.
   */
  appWouldExpectLive: boolean;
}

export function readLivemodeFlag(raw: string | undefined): LivemodeReading {
  const appWouldExpectLive = raw === "true";

  if (raw === undefined || raw === "") {
    return { value: null, state: "unset", appWouldExpectLive };
  }
  if (raw === SENSITIVE_PLACEHOLDER) {
    return { value: null, state: "sensitive-placeholder", appWouldExpectLive };
  }
  if (raw === "true") return { value: true, state: "true", appWouldExpectLive };
  if (raw === "false") return { value: false, state: "false", appWouldExpectLive };

  // "True", " true", "1" — all coerce to test mode in the webhook, and none of
  // them is what anybody meant to write.
  return { value: null, state: "malformed", appWouldExpectLive };
}

// ── The database-side proxy ─────────────────────────────────────────────────

export type ModeMatchState = "consistent" | "intent-without-money" | "no-signal";

export interface ModeMatchSignal {
  state: ModeMatchState;
  /** Everything that could explain the state. Never narrowed to one. */
  hypotheses: string[];
  evidence: { paymentsInWindow: number; intentInWindow: number | null };
}

export function modeMatchSignal(input: {
  paymentsInWindow: number;
  intentInWindow: number | null;
}): ModeMatchSignal {
  const evidence = {
    paymentsInWindow: input.paymentsInWindow,
    intentInWindow: input.intentInWindow,
  };

  if (input.paymentsInWindow > 0) {
    return { state: "consistent", hypotheses: [], evidence };
  }

  // A count that failed is not a count of zero. Treating a null as "nobody
  // tried" would turn a broken query into a reassuring answer.
  if (input.intentInWindow === null || input.intentInWindow === 0) {
    return { state: "no-signal", hypotheses: [], evidence };
  }

  return {
    state: "intent-without-money",
    hypotheses: [
      "PAYMONGO_LIVEMODE in production does not match the events PayMongo is sending, so every payment is being acknowledged and discarded.",
      "The webhook is failing for another reason — signature verification, a malformed payload, or an error after the ledger insert.",
      "Nobody actually completed a purchase. Clicking the paywall is not paying, and this is the most common explanation at low volume.",
    ],
    evidence,
  };
}

// ── Abandonment, which belongs to Growth ────────────────────────────────────

/** Live intent events. `unlock_click` and `unlock_submitted` are dead types. */
export const INTENT_EVENT_TYPES = ["subscribe_click", "paywall_teaser_click"] as const;

export const INTENT_IS_NOT_DEVICES =
  "This counts intent EVENTS, not devices — one device can click many times — so it " +
  "is not a conversion rate. The device-level funnel belongs to Growth " +
  "(growth_funnel_agg); Finance hands this across rather than computing a second " +
  "number that would disagree with it.";

export function intentPerPayment(
  intentEvents: number | null,
  payments: number
): number | null {
  if (intentEvents === null) return null;
  if (payments <= 0) return null;
  return Math.round((intentEvents / payments) * 100) / 100;
}

export interface GrowthHandoff {
  window: { sinceIso: string; untilIso: string };
  intentEvents: number | null;
  payments: number;
  intentPerPayment: number | null;
  caveat: string;
}

export function abandonmentHandoff(input: {
  window: { sinceIso: string; untilIso: string };
  intentEvents: number | null;
  payments: number;
}): GrowthHandoff {
  return {
    window: input.window,
    intentEvents: input.intentEvents,
    payments: input.payments,
    intentPerPayment: intentPerPayment(input.intentEvents, input.payments),
    caveat: INTENT_IS_NOT_DEVICES,
  };
}

// ── What this module cannot do ──────────────────────────────────────────────

export const WEBHOOK_LANDING_CEILING =
  "Confirming that every paid PayMongo link produced a ledger row means listing " +
  "payments at PayMongo (listRecentPaidLinks in lib/paymongo.ts), which needs the " +
  "live secret key. That key is [SENSITIVE] and cannot be pulled, so the collector " +
  "cannot perform this check. The admin reconcile view " +
  "(app/api/admin/reconcile/route.ts) already does exactly it with real " +
  "credentials — recommend running that rather than substituting an estimate.";

export interface QuietLedger {
  daysSinceLastPayment: number | null;
}

export function quietLedger(lastPaidAtIso: string | null, now: Date): QuietLedger {
  if (!lastPaidAtIso) return { daysSinceLastPayment: null };
  const last = Date.parse(lastPaidAtIso);
  if (!Number.isFinite(last)) return { daysSinceLastPayment: null };
  const days = Math.floor((now.getTime() - last) / (24 * 60 * 60 * 1000));
  // A future timestamp is a clock skew, not negative days.
  return { daysSinceLastPayment: Math.max(0, days) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/billingSignals.test.ts`
Expected: PASS — 26 tests.

- [ ] **Step 5: Confirm the placeholder claim is still true**

The whole design of this module rests on the PayMongo values being unreadable. Check it rather than trusting the plan:

```bash
grep -c '^PAYMONGO_.*=\[SENSITIVE\]$' .env.reports.local
```

Expected: `3`. If it prints `0`, the values have become readable — in which case the metric row can carry a real reading, but **only of the local file**, never of production. Leave the module as written and note the change in `docs/reports/finance/README.md`.

This command prints a count, never a value. Do not `cat` that file.

- [ ] **Step 6: Commit**

```bash
git add lib/reports/billingSignals.ts lib/reports/billingSignals.test.ts
git commit -m "feat(reports): detect the livemode mismatch trap from the ledger side"
```

---

### Task 9: The Finance collector, monthly and weekly

**Files:**
- Create: `scripts/reports/finance.ts`

**Interfaces:**
- Consumes: `loadReportsEnv`, `reportsClient`, `readAllRows`, `countRows` from `scripts/reports/supabaseClient.ts`; `readPreviousRun` from `lib/reports/previousRun.ts`; `archiveExistingRun` from `lib/reports/runArchive.ts`; `diffMetrics`, `renderMetricsTable`, `Metric` from `lib/reports/metrics.ts`; `phMonthKey`, `phDayOfMonth`, `phDaysInMonth`, `daysAgo`, `inWindow` from `lib/reports/phWindow.ts`; `revenueByMonth` from `lib/payments.ts`; everything from Tasks 4–8.
- Produces: `docs/reports/finance/.data/<YYYY-MM>.json` on a monthly run and `docs/reports/finance/.data/weekly/<YYYY-MM-DD>.json` on a weekly one.

**This task does not touch `package.json`.** The `report:finance` and `report:finance:weekly` scripts, and the `finance` row in `.claude/skills/report/SKILL.md`, are added once and centrally in a separate integration pass covering all four departments — see *Integration pass* after Task 11. Until then the collector runs as `npx tsx scripts/reports/finance.ts`, which is exactly what the npm script will wrap. Nothing in this plan depends on the wrapper existing.

**The dual cadence is the structural departure from Ops and Growth.** Finance is monthly, because a month is the smallest window in which revenue accounting means anything, with a lightweight weekly delta so a ledger that stops moving is noticed in days rather than weeks. Two modes, two output directories, one script:

| Mode | Output | Filename | Contents |
|---|---|---|---|
| default | `.data/` | `<YYYY-MM>.json` | Everything. Reconciliation, economics, recognition, expiry, scenarios. |
| `--weekly` | `.data/weekly/` | `<YYYY-MM-DD>.json` | Six rows. Did money move, and did anything break. |

The weekly runs live in a **subdirectory** of the same `.data` directory on purpose: `readPreviousRun` globs non-recursively, so a weekly file can never be mistaken for last month's baseline. Task 1's test suite already pins that behaviour down with a `weekly/` directory in it.

**The current month never gets a delta.** It renders in its own `MONTH TO DATE` table, built by passing `null` as the previous metric set — which makes `diffMetrics` emit `—` in both the previous and delta columns by construction, rather than by anyone remembering to suppress them. And the month-to-date rows are **excluded from the persisted `metrics` array**, so next month's run cannot pick them up as a baseline either. Two independent guards, because this is the one comparison the Global Constraints forbid outright.

**Fatal versus degradable.** `payments` and `subscriptions` are fatal: a Finance report without a ledger and its entitlements is not a Finance report, and a file full of `not read` would be worse than no file. Everything else — classes, class members, the legacy unlocks table, the intent counts, the block-price sources, the Operations handoff — records into `errors[]`, leaves its rows `null`, and lets the run finish. LEDGER reports each `errors[]` entry as a finding.

**`events` is never selected from, only counted.** It is far past the 1000-row select cap. `countRows` issues `head: true` queries, which return a count header and no rows and are unaffected by the cap.

**Active CPU is copied, never derived.** The collector opens the most recent Operations run and copies the metric labelled exactly `Active CPU / 4h` — verified as that literal against `docs/reports/ops/.data/2026-08-05.json`. If Ops has not run, or the row is `null` because nobody read the meter, Finance writes `null` and it renders `not read`. Operations owns that measurement; Finance never estimates it.

**Where the tests are.** This file has no colocated `.test.ts`, and that is the architecture rather than an omission: `scripts/reports/` holds credentials and network I/O, and `lib/reports/` holds everything that computes. Every figure this collector emits is produced by a Vitest-covered function from Tasks 1 and 3–8 — attribution, reconciliation, recognition, expiry, block-price comparison, and the billing signals are all tested in isolation with synthetic fixtures. What remains here is reading rows, assembling, and formatting, and that is verified empirically by Steps 3–8 below. `scripts/reports/ops.ts` and `scripts/reports/growth.ts` are structured the same way, for the same reason: a test that needs production credentials is not a unit test.

- [ ] **Step 1: Write the collector**

Create `scripts/reports/finance.ts`:

```typescript
/**
 * Finance collector.
 *
 * Deterministic. Reads production Supabase read-only, computes every figure
 * through tested functions in lib/reports/, renders the finished tables, and
 * writes JSON for LEDGER to interpret. No model is involved, so running this
 * costs nothing and it can be re-run freely while debugging.
 *
 * DUAL CADENCE. Monthly by default — a month is the smallest window in which
 * revenue accounting means anything. `--weekly` writes a six-row delta into a
 * SUBDIRECTORY of the same data directory, so a weekly file can never be
 * picked up as last month's baseline by readPreviousRun, which globs
 * non-recursively.
 *
 * THE CURRENT MONTH NEVER GETS A DELTA. Its rows render in their own table
 * built from diffMetrics(rows, null) — which emits "—" in the previous and
 * delta columns by construction rather than by anyone remembering to suppress
 * them — and are excluded from the persisted `metrics` array so a later run
 * cannot use them as a baseline either.
 *
 * EVERY NUMBER COMES FROM TESTED CODE. This file reads rows, calls pure
 * functions, and formats. It does no arithmetic of its own beyond summing and
 * counting, and LEDGER does none at all.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not —
 * hence main().catch().
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  diffMetrics,
  renderMetricsTable,
  type Metric,
} from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { readPreviousRun } from "../../lib/reports/previousRun";
import {
  daysAgo,
  inWindow,
  phDayOfMonth,
  phDaysInMonth,
  phMonthKey,
} from "../../lib/reports/phWindow";
import { revenueByMonth } from "../../lib/payments";
import {
  annotateMonths,
  acquisitionCost,
  arpu,
  completeMonthDelta,
  completeMonths,
  modelPayback,
  observedLtv,
  paybackMonths,
  pesosFromCentavos,
  revenueByPlan,
  scenarios,
  unlockRevenuePesos,
  ZERO_CAC_DISCLAIMER,
  type BlockAmountMatcher,
} from "../../lib/reports/unitEconomics";
import {
  reconcile,
  summariseExceptions,
  type ClassRow,
  type PaymentRow,
  type SubscriptionRow,
} from "../../lib/reports/ledgerIntegrity";
import {
  expirySchedule,
  recogniseLedger,
  semesterEndStatus,
  semesterPlanParity,
} from "../../lib/reports/revenueRecognition";
import {
  abandonmentHandoff,
  INTENT_EVENT_TYPES,
  intentPerPayment,
  modeMatchSignal,
  quietLedger,
  readLivemodeFlag,
  WEBHOOK_LANDING_CEILING,
} from "../../lib/reports/billingSignals";
import {
  BLOCK_SOURCES,
  compareSources,
  extractConstants,
  isBlockAmountFrom,
  normaliseToCentavos,
  seatBoundEnforcement,
  type BlockConstants,
} from "../../lib/reports/blockPrice";
import {
  countRows,
  loadReportsEnv,
  readAllRows,
  reportsClient,
} from "./supabaseClient";

const REPO_ROOT = join(__dirname, "..", "..");
const MONTHS_OF_HISTORY = 13; // the running month plus twelve complete ones
const WEEK_DAYS = 7;

/** The Ops metric this collector copies. Verified as this exact literal. */
const ACTIVE_CPU_LABEL = "Active CPU / 4h";

interface CollectorError {
  source: string;
  message: string;
}

interface ClassMemberRow {
  id: string;
  class_id: string;
  device_id: string;
}

interface UnlockRow {
  id: string;
  amount: number; // PESOS, not centavos. See unitEconomics.ts.
}

/**
 * Reads the three block-price sources and builds the matcher plan attribution
 * needs. A failure here degrades attribution rather than stopping the run, but
 * it is always recorded — an unavailable matcher would silently file block
 * sales under a subject plan.
 */
function resolveBlockPricing(errors: CollectorError[]): {
  matcher: BlockAmountMatcher;
  constants: BlockConstants | null;
  sourcesRead: number;
  drift: ReturnType<typeof compareSources>;
  seatBounds: ReturnType<typeof seatBoundEnforcement> | null;
} {
  const entries: { path: string; constants: BlockConstants }[] = [];
  const texts = new Map<string, string>();

  for (const spec of BLOCK_SOURCES) {
    const full = join(REPO_ROOT, spec.path);
    if (!existsSync(full)) {
      errors.push({ source: spec.path, message: "file not found" });
      continue;
    }
    const text = readFileSync(full, "utf8");
    texts.set(spec.path, text);

    const result = extractConstants(text, spec);
    if (!result.ok) {
      errors.push({ source: spec.path, message: `missing ${result.missing.join(", ")}` });
      continue;
    }
    entries.push({
      path: spec.path,
      constants: normaliseToCentavos(result.constants, spec.unit),
    });
  }

  const drift = compareSources(entries);
  if (drift.length > 0) {
    errors.push({
      source: "block-price",
      message: `formula drift on ${drift.map((entry) => entry.field).join(", ")}`,
    });
  }

  const constants = entries[0]?.constants ?? null;
  const checkout = texts.get(BLOCK_SOURCES[1].path);
  const webhook = texts.get(BLOCK_SOURCES[2].path);

  return {
    // With no readable source there is no matcher. Returning false for
    // everything is wrong, and it is recorded as an error rather than hidden:
    // block sales would then land in the unattributed bucket, which is visible.
    matcher: constants ? isBlockAmountFrom(constants) : () => false,
    constants,
    sourcesRead: entries.length,
    drift,
    seatBounds: checkout && webhook ? seatBoundEnforcement(checkout, webhook) : null,
  };
}

/**
 * Copies the Active CPU reading from the most recent Operations run.
 *
 * readPreviousRun returns the latest file that sorts BEFORE the name it is
 * given, so a sentinel filename that sorts after every real date returns the
 * newest run. That reuses tested code instead of adding a second directory
 * scan with its own edge cases.
 *
 * Never estimated. If Ops has not run, or ran without the meter being read by
 * eye, this stays null and renders as "not read".
 */
function activeCpuFromOps(errors: CollectorError[]): {
  value: Metric["value"];
  fromRun: string | null;
} {
  const opsDir = join(REPO_ROOT, "docs", "reports", "ops", ".data");
  const latest = readPreviousRun(opsDir, "9999-99-99.json");
  if (!latest) {
    errors.push({
      source: "ops-handoff",
      message: "no Operations run found; Active CPU stays not read",
    });
    return { value: null, fromRun: null };
  }

  const row = latest.metrics.find((metric) => metric.label === ACTIVE_CPU_LABEL);
  if (!row) {
    errors.push({
      source: "ops-handoff",
      message: `Operations run ${latest.key} has no "${ACTIVE_CPU_LABEL}" row`,
    });
    return { value: null, fromRun: latest.key };
  }

  return { value: row.value, fromRun: latest.key };
}

async function main(): Promise<void> {
  const started = Date.now();
  const weekly = process.argv.includes("--weekly");
  const now = new Date();
  const errors: CollectorError[] = [];

  loadReportsEnv();
  const client = reportsClient();

  // ── Fatal reads ──
  const payments = await readAllRows<PaymentRow>(
    client,
    "payments",
    "id,paymongo_link_id,device_id,year_id,subject_id,amount,paid_at"
  );
  const subscriptions = await readAllRows<SubscriptionRow>(
    client,
    "subscriptions",
    "id,paymongo_link_id,device_id,year_id,subject_id,status,current_period_end,created_at"
  );

  // ── Degradable reads. A failure costs a section, not the run. ──
  async function optional<T>(table: string, columns: string): Promise<T[] | null> {
    try {
      return await readAllRows<T>(client, table, columns);
    } catch (error) {
      errors.push({
        source: table,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  const classes = await optional<ClassRow>(
    "classes",
    "id,code,paymongo_link_id,rep_device_id,year_id,subject_id,seat_cap,status,current_period_end,created_at"
  );
  const classMembers = await optional<ClassMemberRow>(
    "class_members",
    "id,class_id,device_id"
  );
  const unlocks = await optional<UnlockRow>("unlocks", "id,amount");

  // ── Windows ──
  const weekFrom = daysAgo(now, WEEK_DAYS);
  const priorWeekFrom = daysAgo(now, WEEK_DAYS * 2);
  const monthKey = phMonthKey(now);

  // Intent is COUNTED, never selected: `events` is far past the 1000-row cap
  // and head:true queries return a count header with no rows.
  const intentWindow = weekly
    ? { since: weekFrom, until: now }
    : { since: daysAgo(now, phDayOfMonth(now) - 1), until: now };
  const intentEvents = await countRows(client, "events", (query) =>
    query
      .in("event_type", [...INTENT_EVENT_TYPES])
      .gte("created_at", intentWindow.since.toISOString())
      .lt("created_at", intentWindow.until.toISOString())
  );
  if (intentEvents === null) {
    errors.push({ source: "events", message: "intent count unavailable" });
  }

  // ── Pure computation. Everything below comes from tested functions. ──
  const blockPricing = resolveBlockPricing(errors);
  const reconciliation = reconcile({
    payments,
    subscriptions,
    classes: classes ?? [],
    isBlockAmount: blockPricing.matcher,
  });
  const exceptions = summariseExceptions(reconciliation.exceptions);

  const months = annotateMonths(revenueByMonth(payments, MONTHS_OF_HISTORY, now), now);
  const finished = completeMonths(months);
  const monthDelta = completeMonthDelta(months);
  const current = months[0];

  const planRevenue = revenueByPlan(payments, blockPricing.matcher);
  const revenuePesosAllTime = pesosFromCentavos(
    payments.reduce((sum, row) => sum + row.amount, 0)
  );
  const payingDevices = new Set(payments.map((row) => row.device_id)).size;
  const ltv = observedLtv(revenuePesosAllTime, payingDevices, payments.length);
  const cac = acquisitionCost(0, payingDevices); // no acquisition spend exists

  // Recognition needs a period end, which lives on the entitlement, not the
  // payment. Build the join from the reconciler's matched pairs so the two
  // cannot disagree about which payment granted what.
  const entitlementById = new Map(
    [
      ...subscriptions.map((row) => [row.id, row.current_period_end] as const),
      ...(classes ?? []).map((row) => [row.id, row.current_period_end] as const),
    ]
  );
  const matchByPaymentId = new Map(
    reconciliation.matched.map((pair) => [pair.paymentId, pair])
  );
  const recognitionRows = payments.map((row) => {
    const pair = matchByPaymentId.get(row.id);
    return {
      amountCentavos: row.amount,
      paidAt: row.paid_at,
      periodEnd: pair ? entitlementById.get(pair.entitlementId) ?? null : null,
      // A payment matched only by natural key had its period overwritten by a
      // later renewal — the original is unrecoverable, so it is fully earned.
      superseded: pair?.via === "natural-key",
    };
  });
  const recognition = recogniseLedger(recognitionRows, now);

  // Revenue at risk needs the amount that bought each entitlement.
  const amountByEntitlementId = new Map<string, number>();
  for (const pair of reconciliation.matched) {
    if (pair.via !== "link-id") continue; // the renewal's own payment is the live one
    const payment = payments.find((row) => row.id === pair.paymentId);
    if (payment) amountByEntitlementId.set(pair.entitlementId, payment.amount);
  }
  const expiry = expirySchedule(
    [
      ...subscriptions.map((row) => ({
        id: row.id,
        currentPeriodEnd: row.current_period_end,
        status: row.status,
        amountCentavos: amountByEntitlementId.get(row.id) ?? null,
      })),
      ...(classes ?? []).map((row) => ({
        id: row.id,
        currentPeriodEnd: row.current_period_end,
        status: row.status,
        amountCentavos: amountByEntitlementId.get(row.id) ?? null,
      })),
    ],
    now
  );
  const expiringSoon = expiry.buckets
    .filter((bucket) => bucket.label === "<=7d" || bucket.label === "<=30d")
    .reduce(
      (acc, bucket) => ({
        count: acc.count + bucket.count,
        centavos: acc.centavos + bucket.revenueAtRiskCentavos,
      }),
      { count: 0, centavos: 0 }
    );

  const semesterEnd = semesterEndStatus(now);
  const parity = semesterPlanParity(now);

  const lastPaidAt =
    payments
      .map((row) => row.paid_at)
      .sort()
      .at(-1) ?? null;
  const quiet = quietLedger(lastPaidAt, now);

  const paymentsThisWeek = payments.filter((row) =>
    inWindow(row.paid_at, weekFrom, now)
  );
  const paymentsPriorWeek = payments.filter((row) =>
    inWindow(row.paid_at, priorWeekFrom, weekFrom)
  );

  const livemode = readLivemodeFlag(process.env.PAYMONGO_LIVEMODE);
  const modeMatch = modeMatchSignal({
    paymentsInWindow: weekly
      ? paymentsThisWeek.length
      : payments.filter((row) => phMonthKey(new Date(row.paid_at)) === monthKey).length,
    intentInWindow: intentEvents,
  });

  const activeCpu = activeCpuFromOps(errors);

  // ── Metric rows. The row set is the contract: identical every run. ──
  const planRow = (bucket: string) =>
    planRevenue.find((row) => row.bucket === bucket)?.revenuePesos ?? null;

  const ledgerRows: Metric[] = [
    { label: "Payments recorded", value: payments.length },
    { label: "Subscriptions", value: subscriptions.length },
    {
      label: "Subscriptions active",
      value: subscriptions.filter((row) => row.status === "active").length,
    },
    { label: "Classes", value: classes?.length ?? null },
    {
      label: "Class seats sold",
      value: classes ? classes.reduce((sum, row) => sum + row.seat_cap, 0) : null,
    },
    { label: "Class seats occupied", value: classMembers?.length ?? null },
    { label: "Matched by link id", value: reconciliation.counts.matchedDirect },
    { label: "Matched via renewal", value: reconciliation.counts.matchedByRenewal },
    { label: "Ledger exceptions", value: reconciliation.exceptions.length },
    {
      label: "Unexplained entitlements",
      value: exceptions.byKind["entitlement-without-payment"],
    },
    {
      label: "Payments without entitlement",
      value: exceptions.byKind["payment-without-entitlement"],
    },
    {
      label: "Locally-minted grants",
      value: exceptions.byKind["entitlement-locally-minted"],
    },
    {
      label: "Amounts not attributable",
      value: exceptions.byKind["amount-not-attributable"],
    },
    { label: "Duplicate entitlements", value: exceptions.byKind["duplicate-entitlement"] },
    { label: "Grant device mismatches", value: exceptions.byKind["grant-device-mismatch"] },
    { label: "Days since last payment", value: quiet.daysSinceLastPayment },
    // Not read, twice over: the value is [SENSITIVE], and this file is a local
    // copy rather than the deployed environment. See billingSignals.ts.
    { label: "LIVEMODE (local copy)", value: livemode.value === null ? null : String(livemode.value) },
    { label: "Mode-match signal", value: modeMatch.state },
    { label: "Intent events (window)", value: intentEvents },
    { label: "Intent per payment", value: intentPerPayment(intentEvents, paymentsThisWeek.length) },
    {
      label: "Block price sources agreeing",
      value: `${blockPricing.drift.length === 0 ? blockPricing.sourcesRead : 0}/${BLOCK_SOURCES.length}`,
    },
    {
      label: "MAX_SEATS enforced",
      value: blockPricing.seatBounds
        ? blockPricing.seatBounds.maxEnforcedAtCheckout &&
          blockPricing.seatBounds.maxEnforcedAtWebhook
          ? "yes"
          : "no"
        : null,
    },
    { label: "Collector errors", value: errors.length },
  ];

  const economicsRows: Metric[] = [
    { label: "Revenue · last complete", value: finished[0]?.revenuePesos ?? null },
    { label: "Payments · last complete", value: finished[0]?.payments ?? null },
    { label: "Month-over-month Δ", value: monthDelta?.deltaPesos ?? null },
    { label: "Revenue · subject_month", value: planRow("subject_month") },
    { label: "Revenue · subject_sem", value: planRow("subject_sem") },
    { label: "Revenue · year_sem", value: planRow("year_sem") },
    { label: "Revenue · block", value: planRow("block") },
    { label: "Revenue · unattributed", value: planRow("unattributed") },
    {
      label: "Legacy unlock revenue",
      value: unlocks ? unlockRevenuePesos(unlocks) : null,
    },
    { label: "Paying devices", value: payingDevices },
    { label: "ARPU", value: arpu(revenuePesosAllTime, payingDevices) },
    { label: "Observed LTV", value: ltv.pesos },
    { label: "Payments per paying device", value: ltv.paymentsPerPayingDevice },
    { label: "CAC", value: cac.pesos },
    {
      label: "Payback (months)",
      value: paybackMonths(cac.pesos, arpu(revenuePesosAllTime, payingDevices)),
    },
    { label: "Earned revenue", value: pesosFromCentavos(recognition.earnedCentavos) },
    { label: "Deferred revenue", value: pesosFromCentavos(recognition.deferredCentavos) },
    { label: "Entitlements expiring <=30d", value: expiringSoon.count },
    { label: "Revenue at risk <=30d", value: pesosFromCentavos(expiringSoon.centavos) },
    {
      label: "Expiry concentration",
      value: Math.round(expiry.concentration * 100),
      unit: "%",
    },
    { label: "Semester end", value: semesterEnd.semesterEndIso.slice(0, 10) },
    { label: "Days to semester end", value: semesterEnd.daysRemaining },
    { label: "Sem/month plan parity", value: parity.identical ? "IDENTICAL" : "distinct" },
    // Copied from Operations, never estimated here.
    { label: ACTIVE_CPU_LABEL, value: activeCpu.value },
  ];

  // Never diffed and never persisted into `metrics`. See the module header.
  const monthToDateRows: Metric[] = [
    { label: "Month", value: current?.month ?? monthKey },
    {
      label: "Day of month",
      value: `${current?.dayOfMonth ?? phDayOfMonth(now)}/${current?.daysInMonth ?? phDaysInMonth(now)}`,
    },
    { label: "Revenue so far", value: current?.revenuePesos ?? 0 },
    { label: "Payments so far", value: current?.payments ?? 0 },
  ];

  const weeklyRows: Metric[] = [
    {
      label: "Revenue this week",
      value: pesosFromCentavos(
        paymentsThisWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
    },
    { label: "Payments this week", value: paymentsThisWeek.length },
    { label: "Days since last payment", value: quiet.daysSinceLastPayment },
    {
      label: "Unexplained entitlements",
      value: exceptions.byKind["entitlement-without-payment"],
    },
    {
      label: "Payments without entitlement",
      value: exceptions.byKind["payment-without-entitlement"],
    },
    { label: "Collector errors", value: errors.length },
  ];

  // ── Output ──
  const collectMs = Date.now() - started;
  const baseDir = join(REPO_ROOT, "docs", "reports", "finance", ".data");
  const outDir = weekly ? join(baseDir, "weekly") : baseDir;
  mkdirSync(outDir, { recursive: true });

  // Manila calendar key. The monthly run is keyed by month; the weekly one by
  // day, using the same expression scripts/reports/ops.ts uses so the two
  // collectors cannot drift apart on what "today" means.
  const key = weekly
    ? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })
    : monthKey;
  const outFilename = `${key}.json`;
  const previous = readPreviousRun(outDir, outFilename);

  const metrics = weekly ? weeklyRows : [...ledgerRows, ...economicsRows];
  const previousMetrics = previous?.metrics ?? null;

  const tables = weekly
    ? {
        week: renderMetricsTable(diffMetrics(weeklyRows, previousMetrics), "WEEK", {
          now: "THIS WEEK",
          previous: "LAST RUN",
        }),
      }
    : {
        ledger: renderMetricsTable(diffMetrics(ledgerRows, previousMetrics), "LEDGER", {
          now: "NOW",
          previous: "LAST MONTH",
        }),
        economics: renderMetricsTable(
          diffMetrics(economicsRows, previousMetrics),
          "ECONOMICS",
          { now: "NOW", previous: "LAST MONTH" }
        ),
        // diffMetrics(rows, null) renders "—" in both comparison columns by
        // construction. The running month cannot be given a delta even by
        // accident.
        monthToDate: renderMetricsTable(
          diffMetrics(monthToDateRows, null),
          "MONTH TO DATE",
          { now: "SO FAR", previous: "n/a" }
        ),
      };

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    mode: weekly ? "weekly" : "monthly",
    key,
    monthKey,
    previousKey: previous?.key ?? null,
    metrics,
    tables,
    reconciliation: {
      counts: reconciliation.counts,
      summary: exceptions,
      // Named, not counted. Carries device and link ids — gitignored only.
      exceptions: reconciliation.exceptions,
    },
    months,
    monthDelta,
    weekOverWeek: {
      thisWeekPesos: pesosFromCentavos(
        paymentsThisWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
      priorWeekPesos: pesosFromCentavos(
        paymentsPriorWeek.reduce((sum, row) => sum + row.amount, 0)
      ),
      thisWeekPayments: paymentsThisWeek.length,
      priorWeekPayments: paymentsPriorWeek.length,
    },
    economics: {
      planRevenue,
      revenuePesosAllTime,
      payingDevices,
      ltv,
      cac: { ...cac, disclaimer: ZERO_CAC_DISCLAIMER },
      modelledPayback: modelPayback(1000, 8, arpu(revenuePesosAllTime, payingDevices)),
      scenarios: finished[0]
        ? scenarios(finished[0])
        : null, // no complete month yet; stated rather than modelled from a partial one
    },
    recognition,
    expiry,
    semester: { ...semesterEnd, parity },
    billing: {
      livemode,
      modeMatch,
      handoffToGrowth: abandonmentHandoff({
        window: {
          sinceIso: intentWindow.since.toISOString(),
          untilIso: intentWindow.until.toISOString(),
        },
        intentEvents,
        payments: paymentsThisWeek.length,
      }),
      webhookLandingCeiling: WEBHOOK_LANDING_CEILING,
    },
    blockPrice: {
      sourcesRead: blockPricing.sourcesRead,
      expected: BLOCK_SOURCES.length,
      drift: blockPricing.drift,
      seatBounds: blockPricing.seatBounds,
    },
    costOfOperation: {
      activeCpu: activeCpu.value,
      activeCpuFromOpsRun: activeCpu.fromRun,
      note:
        "Vercel Active CPU has no API and is read by eye at the usage page. " +
        "Operations owns that measurement; this row is copied from the latest " +
        "Operations run or left not read. Hosting is on free tiers, so the " +
        "marginal cost of one more paying device is zero until a tier is " +
        "exceeded — which is a threshold, not a slope.",
    },
    errors,
  };

  // A second run in the same period would land on the same filename. Displace
  // the earlier run rather than overwriting it, so a report already published
  // from it can still be checked against the numbers it cited.
  const superseded = archiveExistingRun(outDir, outFilename);

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
  if (superseded) console.log(`superseded earlier run -> ${superseded}`);
  if (errors.length > 0) {
    console.log(`${errors.length} error(s) recorded in the payload's errors array`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
```

- [ ] **Step 2: Run the monthly collector**

Run: `npx tsx scripts/reports/finance.ts`

Expected: prints a path ending `docs/reports/finance/.data/<YYYY-MM>.json`, where the month is the **Manila** calendar month. It should take a couple of seconds — these are small whole-table reads plus one count query.

If it throws on `.env.reports.local`, that file is missing or incomplete. Get the Supabase URL and service-role key from the Supabase dashboard (Project Settings → API). **Never point it at `.env.local`**, which deliberately holds no Supabase values.

If it throws from `assertUnderCap`, a table has reached the 1000-row select cap. Stop and add an aggregate RPC for that table before continuing — see `lib/reports/rowCap.ts`.

- [ ] **Step 3: Verify the output shape without printing any figure**

```bash
node -e "
const key = new Date(Date.now()+8*3600e3).toISOString().slice(0,7);
const p = require('./docs/reports/finance/.data/' + key + '.json');
console.log('mode        :', p.mode);
console.log('key         :', p.key, '(monthKey', p.monthKey + ')');
console.log('metrics     :', p.metrics.length);
console.log('tables      :', Object.keys(p.tables).join(','));
console.log('exceptions  :', p.reconciliation.exceptions.length, 'kinds:', [...new Set(p.reconciliation.exceptions.map(e=>e.kind))].join(',') || 'none');
console.log('months      :', p.months.length, 'complete:', p.months.filter(m=>m.complete).length);
console.log('scenarios   :', p.economics.scenarios ? p.economics.scenarios.length : 'null');
console.log('errors      :', p.errors.length, p.errors.map(e=>e.source).join(','));
console.log('mtd comparison cells blank:', (p.tables.monthToDate.match(/—/g)||[]).length >= 8);
"
```

Expected: `mode: monthly`, a `key` equal to `monthKey`, **47 metrics** (23 LEDGER + 24 ECONOMICS), tables `ledger,economics,monthToDate`, `months: 13` with 12 complete, `scenarios: 3`, and `mtd comparison cells blank: true` — four month-to-date rows, each with an empty previous column and an empty delta column.

The table rule is drawn with `─`, a box-drawing character, while an empty cell is `—`, an em dash. They are different code points, so that count matches only real blank cells.

This prints shapes and counts, never values. **Do not `cat` the JSON into a transcript that might be pasted into a tracked file.**

- [ ] **Step 4: Verify the month-to-date rows never became a baseline**

```bash
node -e "
const key = new Date(Date.now()+8*3600e3).toISOString().slice(0,7);
const p = require('./docs/reports/finance/.data/' + key + '.json');
const labels = p.metrics.map(m => m.label);
const leaked = ['Month','Day of month','Revenue so far','Payments so far'].filter(l => labels.includes(l));
console.log('leaked month-to-date rows:', leaked.length ? leaked.join(',') : 'none');
"
```

Expected: `none`. A leak here means next month's run would diff a complete month against a partial one — exactly the false comparison the Global Constraints forbid.

- [ ] **Step 5: Run the weekly collector**

Run: `npx tsx scripts/reports/finance.ts --weekly`

Expected: a path ending `docs/reports/finance/.data/weekly/<YYYY-MM-DD>.json`.

```bash
node -e "
const d = new Date(Date.now()+8*3600e3).toISOString().slice(0,10);
const p = require('./docs/reports/finance/.data/weekly/' + d + '.json');
console.log('mode   :', p.mode);
console.log('metrics:', p.metrics.length);
console.log('tables :', Object.keys(p.tables).join(','));
"
```

Expected: `mode: weekly`, `metrics: 6`, `tables: week`.

- [ ] **Step 6: Verify the weekly run cannot become the monthly baseline**

```bash
ls docs/reports/finance/.data/
```

Expected: the month file and a `weekly/` directory, nothing else. `readPreviousRun` globs non-recursively, so the weekly files are invisible to the monthly run by construction — and Task 1's test suite already pins that behaviour.

- [ ] **Step 7: Verify the same-period archive**

Run `npx tsx scripts/reports/finance.ts` a second time.
Expected: a second line reading `superseded earlier run -> .../superseded/<YYYY-MM>.1.json`.

Run: `ls docs/reports/finance/.data/superseded/`
Expected: `<YYYY-MM>.1.json`.

- [ ] **Step 8: Verify nothing became trackable**

```bash
git status --porcelain docs/reports/
git check-ignore -v docs/reports/finance/.data/
```

Expected: the first prints nothing; the second matches the `docs/reports/` rule. If either check fails, **stop** — this data carries revenue figures, device ids, and PayMongo link ids, and the repo is public.

- [ ] **Step 9: Commit**

```bash
git add scripts/reports/finance.ts
git commit -m "feat(finance): add the finance collector with a weekly delta mode"
```

---

### Task 10: LEDGER agent definition and the department README

**Files:**
- Create: `.claude/agents/ledger.md`
- Create: `docs/reports/finance/README.md` — standing open items. **Gitignored, so it is created but never committed.**

**Interfaces:**
- Consumes: the collector JSON from Task 9, and the previous report under `docs/reports/finance/`.
- Produces: `docs/reports/finance/<YYYY-MM>.md` on a monthly run, `docs/reports/finance/weekly/<YYYY-MM-DD>.md` on a weekly one, and one appended line in `docs/reports/cost-ledger.jsonl`.

LEDGER gets no MCP tools. Its data comes entirely from the collector JSON, because an agent in this system never writes ad-hoc SQL against production and never reaches PayMongo directly.

**Note the trap from `docs/HANDOFF-2026-08-05.md` §6:** editing an agent definition does not affect the agent in the session it was edited in. Definitions load at session start. **Restart the session before dispatching LEDGER for the first time**, or the dispatch runs against a definition that does not exist yet. This has already cost one whole verification run on PULSE.

**One formatting rule for this file specifically.** `.claude/skills/report/SKILL.md` was once mangled by a dollar-sign-followed-by-a-digit being treated as a positional argument (HANDOFF §5.3). Agent definitions take no positional arguments, so it should not apply here — but the real value is pasted from a script regardless, so the `CUMULATIVE` examples below simply never write that sequence. Do not "improve" them by adding one.

- [ ] **Step 1: Create the agent**

Create `.claude/agents/ledger.md`:

````markdown
---
name: ledger
description: Finance department agent. Use when running the monthly finance report or the weekly revenue delta — revenue accounting, ledger integrity, billing operations, unit economics, pricing, formula drift, revenue recognition, renewals and expiry, cost of operation, scenario modelling.
tools: Bash, Read, Write, Edit, Glob, Grep
---

# LEDGER · Finance

You are LEDGER, the Finance department. You reconcile before you opine. You distrust
any figure that has only one source, and you say so out loud rather than quietly
presenting it as confirmed.

**What you guard against:** reporting a number that no second source confirms. Revenue
has exactly one source in this product — the `payments` table — and the second source
that would confirm it, PayMongo's own payments list, needs a secret key that cannot be
read. That does not make the number wrong. It makes it unconfirmed, and unconfirmed is
a thing you write down.

## Core principle

**Reconcile first. Revenue second.** A revenue figure computed over a ledger that does
not reconcile is a confident number about an unknown quantity. If the reconciliation
has unexplained exceptions, that is the report's headline, whatever the revenue did.

The house rule applies as everywhere else: **a scan is a diff, not a snapshot.** The
value is what changed since last month.

## Step 0 — Which cadence are you running?

Finance has two, and they are not the same job.

| Mode | Collector | You write | Job |
|---|---|---|---|
| **monthly** | `npx tsx scripts/reports/finance.ts` | `docs/reports/finance/<YYYY-MM>.md` | The full report. All ten lenses. |
| **weekly** | `npx tsx scripts/reports/finance.ts --weekly` | `docs/reports/finance/weekly/<YYYY-MM-DD>.md` | Six rows. A tripwire. |

The collector JSON's `mode` field tells you which one you are in. Read it before
anything else.

**The weekly delta is a tripwire, not a report.** It exists so a ledger that stops
moving is noticed in days rather than weeks. It opens a finding **only** if something
reaches P0 or P1 — an unexplained exception appearing, or the ledger going quiet with
intent still arriving. Everything else waits for the monthly run, which has the data to
analyse it. A weekly delta that produces three P2s every week is noise, and noise is
how a log stops being read.

## Step 1 — Read the previous report FIRST

Before any other tool call.

**Monthly:**

```sh
find docs/reports/finance -maxdepth 1 -name '[0-9][0-9][0-9][0-9]-[0-9][0-9].md' \
  | awk -F/ '{print $NF"\t"$0}' | sort | tail -1 | cut -f2
```

**Weekly:**

```sh
find docs/reports/finance/weekly -maxdepth 1 -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' \
  | awk -F/ '{print $NF"\t"$0}' | sort | tail -1 | cut -f2
```

Read whatever it prints. You need its findings so each one can be marked NEW, ONGOING,
or CLOSED. If it prints nothing, there is no earlier report — say so, this is a
baseline.

**On a weekly run, also read the latest monthly report** using the monthly command. The
monthly report is where findings live; the weekly one must not silently drop a P1 that
the month opened.

**Record the path(s) it printed.** Step 5 names them in the report. A diff nobody can
trace to its baseline is not auditable.

Four things about those commands are load-bearing:

- **There are two commands, not one clever one.** A combined glob would work by
  accident and not by design: a basename like `2026-08-05.md` sorts *before*
  `2026-08.md`, because a hyphen is a lower byte than a dot — so `sort | tail -1`
  would pick the monthly report over a same-month weekly. That is the answer you want,
  but nothing in the code says so, and the next person to "simplify" it would not know
  it was doing that on purpose. Two commands, two intents.
- **The date-shaped `-name` pattern is a filter, not decoration.** A plain `*.md` glob
  picks up `README.md`, which is the standing-open-items file and sorts last in some
  directories — you would diff against a to-do list and not notice.
- **Sorting is on the filename, not the path**, so the newest date wins wherever it
  lives.
- **The current period is deliberately not excluded.** You read this before you write,
  so an existing `<YYYY-MM>.md` is an earlier run's report and is the closest prior
  there is. Skipping it strands every finding it opened. Reports displaced by a re-run
  are archived under `superseded/` with a `.<n>` suffix the pattern will not match, so
  they never come back as a baseline.

You do **not** need its metrics tables. The collector reads the previous run's data
file itself, computes the diffs, and hands you finished tables in Step 2.

## Step 2 — Read the collector output

**Monthly:**

```sh
cat "docs/reports/finance/.data/$(TZ=Asia/Manila date +%Y-%m).json"
```

**Weekly:**

```sh
cat "docs/reports/finance/.data/weekly/$(TZ=Asia/Manila date +%F).json"
```

If it is missing, run the collector first — `npx tsx scripts/reports/finance.ts`, with
`--weekly` for the weekly file. It costs nothing, and re-running is safe: the collector
moves the period's earlier run into `.data/superseded/` rather than overwriting it, so
a report already published from that run can still be checked against the numbers it
cited.

**Always pass `TZ=Asia/Manila`.** The collector keys its file with the Manila calendar
month or day. A bare `date` agrees only as long as the machine happens to be set to PH
time — pin it explicitly so the two cannot drift apart.

**The `tables` field holds finished tables.** The collector already read the previous
run's data file (see `previousKey`, `null` on a baseline run), diffed it, and rendered
aligned columns. Paste them into the report verbatim in Step 5. **Never compute or edit
a delta yourself, and never retype a number out of a table.** If a value looks wrong,
that is a finding — write it up like any other defect — not something to quietly
correct on the way to the report. Every number in the report must trace back to tested
code, never to your own arithmetic.

**`tables.monthToDate` has no comparison columns, and that is deliberate.** The running
month is incomplete. Comparing it against a finished month is the classic way a revenue
chart lies, so the collector renders it with both comparison columns empty and keeps its
rows out of next month's baseline. Paste it as-is and label it "so far". **Never
annualise it, never extrapolate it to a full month, and never put a run-rate in a
table.** A projection belongs in prose with its assumptions attached.

Fields you will use beyond the tables:

| Field | What it is for |
|---|---|
| `mode` | `monthly` or `weekly`. Decides which job you are doing. |
| `reconciliation.exceptions` | **Start here.** Every exception, named, with a reason. |
| `reconciliation.summary` | Counts by kind, and `unreconciled` — the number that escalates. |
| `months` | Trailing PH calendar months, newest first. Index 0 is incomplete. |
| `monthDelta` | The month-over-month move across **complete** months only. |
| `weekOverWeek` | This week against last week. Usable even on a baseline run. |
| `economics` | Plan revenue, ARPU, LTV, CAC and its disclaimer, scenarios. |
| `recognition` | Earned versus deferred, plus the counts that qualify it. |
| `expiry` | Buckets, clusters, and concentration. Renewals and revenue at risk. |
| `semester` | `SEMESTER_END`, days remaining, and the plan-parity check. |
| `billing` | Livemode reading, mode-match signal, the Growth handoff. |
| `blockPrice` | Formula drift and seat-bound enforcement. |
| `costOfOperation` | Active CPU copied from Operations, and the note about it. |
| `errors` | Reads that failed. Each one is a finding. |

## Step 3 — Reconcile before opining

This is the department's first act, every run, before you look at revenue at all.

Read `reconciliation.exceptions`. Each carries a `kind`, a `linkId`, a `deviceId`, and a
written `reason`. **Name them individually. Never write "3 exceptions" and move on** —
counting is what the collector already did, and the whole reason this department exists
is that somebody has to say *which* ones and *what to do*.

Six kinds, and they are not equally serious:

| Kind | What it means |
|---|---|
| `payment-without-entitlement` | Money in, nothing granted. **A paying user may be locked out right now.** |
| `entitlement-without-payment` | Access granted, no money recorded. Either uncomped comping or a webhook bug. |
| `entitlement-locally-minted` | A `block-`, `comp-` or `manual-` link id. Granted by hand, by design. Confirm and register it. |
| `entitlement-known-exception` | Already in `KNOWN_EXCEPTIONS` with a reason. Report it, do not re-argue it. |
| `amount-not-attributable` | Paid at a price we do not sell. |
| `duplicate-entitlement` | Two entitlements on one natural key. The unique index should prevent this. |
| `grant-device-mismatch` | One device paid, a different one got access. |

**`matchedByRenewal` is not an exception and must never be reported as one.**
`recordPayment` overwrites a subscription's `paymongo_link_id` when a device renews, so
the earlier payment's link id appears on no entitlement. The collector matches it by
device/year/subject instead. A non-zero `matchedByRenewal` means people are renewing,
which is good news.

When an exception turns out to be legitimate, the fix is not to ignore it — it is to add
it to `KNOWN_EXCEPTIONS` in `lib/reports/ledgerIntegrity.ts` with a reason and a date, so
it stops recurring. Say so in the finding.

## Step 4 — Two sources, or say which one you have

For every figure you quote, know where it came from. Say it plainly when there is only
one, and never imply a confirmation that does not exist.

| Figure | Sources |
|---|---|
| Revenue | `payments` only. PayMongo's own list needs a secret key that is `[SENSITIVE]`. **Single-source. Say so.** |
| Entitlements | `subscriptions` and `classes`, reconciled against `payments`. Two sources. |
| Block price | Three source files, compared. Three sources — the strongest figure in the report. |
| `PAYMONGO_LIVEMODE` | **Zero sources.** Unreadable, and the local file is not production anyway. |
| Active CPU | Copied from Operations, or `not read`. Never derived here. |
| Abandonment | Intent *events*, not devices. Growth owns the device-level number. |

**ARPU and observed LTV are the same arithmetic** until a device pays twice. The
collector says so in `economics.ltv.indistinguishableFromArpu`. When that is true, quote
one number, not two — presenting them as separate figures implies a second measurement
that has not happened.

**CAC is zero, and `economics.cac.disclaimer` is the sentence that must go with it.**
Zero CAC is not a compliment; it is a description of a business that spends nothing on
acquisition. Never quote the number without the sentence.

## Step 5 — Write the report

Write `docs/reports/finance/<YYYY-MM>.md` on a monthly run, or
`docs/reports/finance/weekly/<YYYY-MM-DD>.md` on a weekly one, keyed to the **Manila**
calendar so the report file and the collector's data file always carry the same key.

**If that file already exists, move it aside before you write** — it is an earlier
report from this period and the only record of the findings it opened:

```sh
d=$(TZ=Asia/Manila date +%Y-%m); f=docs/reports/finance/$d.md
if [ -e "$f" ]; then
  mkdir -p docs/reports/finance/superseded
  n=1; while [ -e "docs/reports/finance/superseded/$d.$n.md" ]; do n=$((n+1)); done
  mv "$f" "docs/reports/finance/superseded/$d.$n.md"
  echo "superseded -> docs/reports/finance/superseded/$d.$n.md"
fi
```

Never overwrite a published report. It is the only place some findings are written down,
and destroying it to publish a newer one loses exactly the history this log exists to
keep. The `.<n>` suffix keeps the archived copy out of Step 1's date-shaped pattern, so
it can never come back as a baseline.

### Monthly layout

```
LEDGER · FINANCE                                  <YYYY-MM> · monthly
═══════════════════════════════════════════════════════════════════
PERIOD    <key>  ·  vs <previousKey, or "baseline · no earlier run">
VERDICT   One line. Does the ledger reconcile, and the single thing that moved.

RECONCILIATION   <matchedDirect + matchedByRenewal matched · n exceptions · n unexplained>
 · <kind>  <linkId>  — <what it is, and what to do about it>
 · … one line per exception, named. Never a bare count.

<the collector JSON's `tables.ledger`, pasted verbatim>

<the collector JSON's `tables.economics`, pasted verbatim>

<the collector JSON's `tables.monthToDate`, pasted verbatim>
  Incomplete month, shown without comparison columns by design. Not annualised.

FINDINGS · vs <the Step 1 path, or "baseline · no earlier report">
 [P0] NEW      <title>
 [P1] ONGOING  <title>                                   (month <n>)
 [ok] CLOSED   <title>

ACCEPTED (<n>)  not re-litigated · reopens on trigger
 · <finding>                          → reopens if <trigger>

───────────────────────────────────────────────────────────────────
DETAIL · <severity> · <title>

  What      <the defect or signal>
  Evidence  <file:line, a metric with its delta, or a named exception>
  Impact    <who or what is affected, quantified where possible>
  Why <sev> <what makes this the current severity, not higher or lower>

  A  <accept>          <cost of inaction>
  B  <minimal>         <effort>
  C  <full fix>        <effort, trade>

  → <choice, with the reasoning in a sentence>

───────────────────────────────────────────────────────────────────
SOURCES      <every figure quoted above that has only one source>
UNIT ECON    <ARPU/LTV relationship, and the CAC disclaimer verbatim>
RENEWALS     <expiry concentration, the cluster date, revenue at risk>
SCENARIOS    <2x/5x/10x from `economics.scenarios`, with the assumptions>
HANDOFF      Growth: <billing.handoffToGrowth, including its caveat>
───────────────────────────────────────────────────────────────────
SOURCE       collector run <the collector JSON's `collectedAt`>
RUN          collect <n>s · interpret not read · turns not read
COST         not read
CUMULATIVE   <paste from npm run report:cost>
```

### Weekly layout

Short on purpose. Six rows and a verdict.

```
LEDGER · FINANCE                            <YYYY-MM-DD> · weekly delta
═══════════════════════════════════════════════════════════════════
VERDICT   One line. Did money move, and did anything break.

<the collector JSON's `tables.week`, pasted verbatim>

MOVED     <weekOverWeek, this week against last>
LEDGER    <"reconciles" or the unexplained exception count>
CARRIED   <any P0/P1 still open from the latest monthly report>
───────────────────────────────────────────────────────────────────
SOURCE       collector run <collectedAt>
RUN          collect <n>s · interpret not read · turns not read
COST         not read
```

`SOURCE` is the collector JSON's `collectedAt`, copied verbatim. The data file's name
carries only the period key, so it cannot identify *which* run produced these numbers —
`collectedAt` can. That timestamp is what separates "this report is wrong" from "this
report was superseded by a re-run"; the displaced run is still on disk under
`.data/superseded/`.

`collect <n>s` is the collector JSON's `collectMs` **divided by 1000 and rounded**.
`collectMs` is milliseconds. Writing it literally turns a real `collectMs: 4820` into
`collect 4820s`, about eighty minutes.

Interpret time, turn count, and cost are things you cannot measure about yourself from
inside a session. They are always **`not read`**, full stop — the same convention the
Active CPU row uses. Never estimate them.

`CUMULATIVE` comes from a script, never your own arithmetic:

```sh
npm run report:cost
```

Paste its output verbatim. Never hand-sum `cost-ledger.jsonl`.

Rules:

- **Detail is written for the top finding only, plus every P0 and P1.** P2 and below
  stay one-liners. A report nobody finishes reading has failed.
- **Paste every table verbatim.** Never compute or edit a delta.
- **Name each reconciliation exception individually.** A count is not a finding.
- **Every finding from the previous report appears**, even if only to be CLOSED.
- **ACCEPTED items list their reopen trigger** and are never re-argued until it fires.
  An ACCEPTED finding must never reappear as NEW.
- **Option A is always "do nothing", argued honestly** with the cost of inaction. For a
  solo founder, not acting is usually correct.
- **Never present a projection without its assumptions.** `economics.scenarios` carries
  them on every scenario; copy them, including onto the 10x line.

## Step 6 — Record the cost

Append one line to `docs/reports/cost-ledger.jsonl`:

```json
{"timestamp":"<ISO>","department":"finance","costUsd":null,"inputTokens":null,"outputTokens":null,"cacheReadTokens":null,"cacheCreationTokens":null,"collectMs":<from the collector JSON>,"interpretMs":null,"turns":null,"findingCount":<n>}
```

Use `"department":"finance-weekly"` on a weekly run, so the two cadences can be told
apart when asking whether this department earns its cost. Use `null` for anything you
cannot measure. Never estimate a cost.

## Step 7 — Report in chat

The file is the archive. The chat summary is the deliverable:

1. **Does the ledger reconcile** — yes or no, first line. Not buried under revenue.
2. **What moved** — the month-over-month direction, and any finding opened or closed.
   If nothing moved, say "no change since <period>" plainly.
3. **Anything urgent**, or an explicit "nothing needs action this month".

Do not quote a revenue figure into a context that might be pasted somewhere tracked. See
Disclosure.

## Escalation — what is actually P0

Only these justify interrupting other work:

1. **Money received without entitlement granted** — a paying user locked out. Evidence:
   a `payment-without-entitlement` exception.
2. **Entitlement granted without money received, at a rate suggesting a bug rather than
   deliberate comping.** Evidence: `entitlement-without-payment` with a *gateway* link
   id, several of them, appearing in one period. One, with a locally-minted prefix, is
   comping and is P3 at most.
3. **Webhook signature verification failing, or live payments being silently rejected
   through a `PAYMONGO_LIVEMODE` mismatch.** Evidence: `billing.modeMatch.state` is
   `intent-without-money`. **Present all three hypotheses the collector supplies** — the
   boring one, that nobody completed a purchase, is usually the right one at this volume.
4. **Price formula disagreement between any two sources.** Evidence:
   `blockPrice.drift` non-empty. This should already have failed the test suite; if it
   reached a report, the standing assertion is not running.
5. **Free-tier limits about to be exceeded with no plan.** Evidence: the Active CPU row,
   when Operations has actually read it.

Everything else is planned work. Label it as such.

## The Active CPU rule

**No API returns Vercel Active CPU usage. There is no usage or billing endpoint.** The
meter is read by eye at https://vercel.com/lauurnces-projects/~/usage

The collector copies whatever the most recent Operations run recorded. If Operations did
not read it, the row is `not read`, and **that is the honest entry**.

**Never write an estimate into the Active CPU row, and never derive one from traffic.**
An estimate that hardens into a baseline poisons every future delta. Operations owns
that measurement — say "Operations has not read it" rather than filling the gap.

The 4h/month allowance is account-wide, so it is not a Finance number to begin with.

## Disclosure

`docs/reports/` is gitignored. The repo is **public**, and these reports carry revenue,
conversion, ARPU, device ids, and PayMongo link ids — the same class of data that keeps
`docs/POST-MORTEM.md` private.

**Never copy a figure from a report into a tracked file**, including into a commit
message, a migration comment, a plan, or a code comment. Revenue is private under the
same rule as the post-mortem.

`reconciliation.exceptions` carries device identifiers and payment link ids. Those never
leave `docs/reports/finance/`. When a finding needs to reference one, reference it — the
report is the private place where that is allowed.

## Common mistakes

| Mistake | Fix |
|---|---|
| Reporting revenue before saying whether the ledger reconciles | Step 3. Reconcile first. |
| Writing "3 exceptions" | Name each one, with what to do. That is the whole job. |
| Calling `matchedByRenewal` an exception | It is a renewal. `recordPayment` overwrites the link id — see Step 3. |
| Comparing the current month against last month | The running month has no comparison column by design. |
| Annualising or extrapolating the month-to-date figure | Projections go in prose, with assumptions. Never in a table. |
| Quoting ARPU and LTV as two findings | They are the same arithmetic until someone pays twice. |
| Quoting CAC without its disclaimer | Zero CAC means zero spend, not efficiency. Paste the sentence. |
| Presenting revenue as confirmed | It is single-source. PayMongo's list needs a `[SENSITIVE]` key. |
| Calling `intent-without-money` a livemode bug | It is three hypotheses. The boring one usually wins at this volume. |
| Putting an estimate in the Active CPU row | "not read" is the honest entry. Operations owns it. |
| Opening P2s on a weekly run | The weekly delta is a tripwire. Only P0/P1 escalate. |
| Dropping a monthly finding on a weekly run | Read the latest monthly report too — Step 1. |
| Computing or retyping a delta by hand | Paste the collector's tables verbatim. |
| Re-arguing an ACCEPTED finding | Only its trigger reopens it. |
| Hand-summing `cost-ledger.jsonl` | Run `npm run report:cost` and paste its output. |
| Writing `collectMs` straight into the RUN row | It is milliseconds. Divide by 1000 and round. |
| `grep --include=*.ts` unquoted | zsh expands the glob. Quote it: `--include="*.ts"`. |
````

- [ ] **Step 2: Create the department README**

Create `docs/reports/finance/README.md`. This is the standing-open-items file every
department carries. It is **gitignored** — it lives under `docs/reports/` — so it is
created and never committed.

```markdown
# Finance department — standing items

Reports: `docs/reports/finance/<YYYY-MM>.md` (monthly), `weekly/<YYYY-MM-DD>.md` (delta).
Collector data: `.data/`. Displaced runs: `.data/superseded/`.

## Known-exception register

Legitimate entitlements without a payment row live in `KNOWN_EXCEPTIONS` in
`lib/reports/ledgerIntegrity.ts`, not here — they need to be in code so the collector
can classify them. This file records why each one was added.

(none yet)

## Standing watches

- **Row cap.** `payments`, `subscriptions`, `classes`, `class_members` and `unlocks` are
  read with plain selects and are far under Supabase's 1000-row cap. `assertUnderCap`
  throws if that stops being true. Record here if any table reaches "approaching cap".
- **`SEMESTER_END` parity.** 31 days before the constant in `lib/paymongo.ts`, the
  semester plan and the month plan start granting identical access at double the price.
  The collector reports `Sem/month plan parity` and `Days to semester end`.
- **`MAX_SEATS`.** Declared in `app/(main)/for-blocks/pricing.ts`, enforced by neither
  server path. Reported, not asserted — whether that is deliberate was never confirmed.
- **`PAYMONGO_LIVEMODE`.** Unreadable from here. The database-side proxy is the only
  signal. Never estimated.

## Open questions carried between runs

(none yet)
```

- [ ] **Step 3: Verify the agent is registered**

Run: `ls -1 .claude/agents/`
Expected: `ledger.md` alongside `pulse.md`, and `vantage.md` if Growth has been built.

- [ ] **Step 4: Verify the README stayed untracked**

```bash
git status --porcelain docs/reports/
git check-ignore -v docs/reports/finance/README.md
```

Expected: the first prints nothing; the second matches the `docs/reports/` rule.

- [ ] **Step 5: Commit**

Only the agent definition is tracked.

```bash
git add .claude/agents/ledger.md
git commit -m "feat(finance): add the LEDGER finance agent"
```

---

### Task 11: Run the department end to end

**Files:** none created or modified. This task is verification only, so it has no commit.

**Interfaces:**
- Consumes: everything built in Tasks 1–10.
- Produces: a real report at `docs/reports/finance/<YYYY-MM>.md`, a weekly delta, and one line in `docs/reports/cost-ledger.jsonl`.

- [ ] **Step 1: Run the full suite**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all pass, with **210 more tests than before this plan** — 9 from `previousRun`, 6 from `rowCap`, 17 from `phWindow`, 51 from `unitEconomics`, 37 from `ledgerIntegrity`, 33 from `revenueRecognition`, 31 from `blockPrice`, 26 from `billingSignals`.

**State the delta, not an absolute.** The suite was at 624 tests across 72 files on 2026-08-08, which gives 834 — but only if the Growth plan has not landed. Growth adds 70 of its own, and whether it has been executed is not knowable from inside this plan. Check the delta against whatever the suite reported before Task 1.

- [ ] **Step 2: Confirm the standing assertion is actually in the suite**

```bash
npx vitest run lib/reports/blockPrice.test.ts --reporter=verbose 2>&1 | grep -c "block price formula agrees"
```

Expected: at least `1`. A standing assertion that is not being run every time is not standing.

- [ ] **Step 3: Run both collectors fresh**

```bash
npx tsx scripts/reports/finance.ts
npx tsx scripts/reports/finance.ts --weekly
```

Expected: two paths printed, and ideally no `error(s) recorded` line. If Operations has never run, one error is expected and correct — `ops-handoff`, leaving Active CPU `not read`.

- [ ] **Step 4: Restart the session, then dispatch LEDGER**

Start a new Claude Code session. `.claude/agents/ledger.md` was created in Task 10 and the current session cannot see it — definitions load at session start, and dispatching now would run an agent that does not exist or, worse, a stale one.

**`/report finance` does not route yet.** The skill's routing table is updated in the integration pass described below, not here. Dispatch the agent directly with the Agent tool, `subagent_type: "ledger"`, and tell it this is a monthly run.

- [ ] **Step 5: Verify the monthly report**

Expected in `docs/reports/finance/<YYYY-MM>.md`:

- a `LEDGER · FINANCE` header ending `· monthly`
- a `PERIOD` line naming the month and its diff basis
- a `RECONCILIATION` block with **one line per exception, each naming a link id and an action** — or an explicit statement that the ledger reconciles cleanly
- all three tables, pasted verbatim, with `LAST MONTH` columns of `—` on a baseline run
- the `MONTH TO DATE` table with empty comparison columns and no annualised figure anywhere near it
- a `FINDINGS` line naming its diff basis
- a `SOURCES` block that says revenue is single-source
- the CAC disclaimer sentence, verbatim, wherever CAC is quoted
- `SCENARIOS` carrying assumptions on every line, including the 10x one
- a `HANDOFF` line for Growth carrying the "not a conversion rate" caveat
- `COST  not read`

- [ ] **Step 6: Verify the weekly delta stays a tripwire**

Dispatch LEDGER again for a weekly run.

Expected in `docs/reports/finance/weekly/<YYYY-MM-DD>.md`: a header ending `· weekly delta`, the six-row `WEEK` table, `MOVED` / `LEDGER` / `CARRIED` lines, and **no P2 or P3 findings**. If it opened a P2, the cadence rule in Step 0 of the agent definition is not being followed — that is a definition bug, not a judgment call.

- [ ] **Step 7: Verify the disclosure boundary held**

```bash
git status --porcelain docs/reports/
git diff --stat HEAD
git grep -nE '(ARPU|revenue|conversion) (is|was|of) [0-9]' -- ':!docs/reports' || echo "no figures in tracked files"
```

Expected: the first prints nothing, the second shows no file under `docs/reports/`, and the third prints the fallback line. If any figure from the run has landed in a tracked file — a plan, a commit message, a code comment — remove it before committing. The repo is public.

- [ ] **Step 8: Verify the cost ledger got its line**

```bash
tail -1 docs/reports/cost-ledger.jsonl
npm run report:cost
```

Expected: a line with `"department":"finance"` and `"costUsd":null`, and a `CUMULATIVE` line from the script. `costUsd` is null by design — an agent running as a subagent cannot measure its own token use.

---

## Integration pass — owned elsewhere, not planned here

Two files that Finance needs are **deliberately not touched by this plan**, because all four departments touch them and doing it once per department produces four conflicting edits to the same table:

| File | What it needs | Why not here |
|---|---|---|
| `package.json` | `report:finance` and `report:finance:weekly` scripts wrapping `tsx scripts/reports/finance.ts` | Every department adds a script to the same object. One pass, one edit. |
| `.claude/skills/report/SKILL.md` | A `finance` row in the routing table, with **both cadences**, and the council text updated for a third department | Same reason, plus the council wording depends on how many departments exist at the time. |

Until that pass runs:

- The collector is invoked as `npx tsx scripts/reports/finance.ts`, with `--weekly` for the delta. That is exactly what the npm script will wrap, so nothing changes when it lands.
- LEDGER is dispatched with the Agent tool, `subagent_type: "ledger"`, rather than through `/report finance`.
- **Nothing in Tasks 1–11 depends on either edit**, and the department is fully usable without them.

One warning for whoever runs that pass: `.claude/skills/report/SKILL.md` contains a note that must not be "restored" to include a dollar sign followed by a zero. That sequence is substituted as a positional argument when the skill is invoked, and the note documenting the bug was once mangled by it (HANDOFF §5.3). It spells the characters out in words on purpose.

The Finance row is also the first with two cadences, so the routing table needs a shape the other three do not: `finance` for the monthly report and something like `finance weekly` for the delta.

## What could not be verified

Flagged rather than guessed, as required.

**1. The `comp-` and `manual-` link-id prefixes are a proposal, not an observed convention.** Only `block-` is documented in the repo — `supabase/migrations/20260716000000_classes.sql` names `'block-<uuid>'` as a placeholder for manually-generated links. `comp-` and `manual-` were added to `LOCALLY_MINTED_PREFIXES` so that future deliberate grants have a shape that classifies itself. **No production row was read to confirm any of them are in use.** This fails safe in the right direction: an unrecognised id is classified `gateway` and surfaced, never excused. But the first LEDGER run should check whether any real entitlement carries a locally-minted prefix at all, and record the answer in the department README.

**2. A production PayMongo link id's literal prefix.** Never read; the secret is `[SENSITIVE]`. The classifier therefore never asserts a `link_` prefix and treats every unrecognised id as a gateway id.

**3. Whether `MAX_SEATS` going unenforced server-side is intentional.** `app/(main)/for-blocks/pricing.ts:10` declares `MAX_SEATS = 55`; neither `app/api/class/checkout/route.ts` nor the webhook checks an upper bound. Reported as a signal, never asserted, because failing a test on it would be inventing a requirement.

**4. Whether the webhook's class-insert failure path has ever stranded a payment.** `app/api/webhooks/paymongo/route.ts:135-178` inserts the `payments` row first and then the `classes` row, and there is no transaction. If the class insert fails — or all five class-code generation attempts collide — the route returns 500 **with the payment row already written and not rolled back**. That is exactly a `payment-without-entitlement` exception, and it is a P0 by the escalation list. Whether it has ever fired in production could not be determined from the repo. If the first LEDGER run finds a block-shaped orphan payment, this is the first thing to check.

**5. A false-positive shape for `duplicate-entitlement` that is plausible but unobserved.** `classes.subject_id` became nullable in `20260717000000_classes_subject_id_nullable.sql`, so an all-subjects class block has a null subject — and the reconciler's natural key collapses a null subject onto the `'year'` sentinel. A class rep who bought both a `year_sem` subscription and an all-subjects block **on the same device and year** would produce two entitlements sharing one natural key and be reported as a duplicate. Whether any such rep exists could not be checked. The exception carries both entitlement kinds, so LEDGER can recognise the shape; if it appears, the fix is to include the entitlement kind in the key, not to drop the check.

**6. Production's `PAYMONGO_LIVEMODE` value.** Unreadable, twice over — the local file holds `[SENSITIVE]`, and a local file is not the deployed environment regardless. The database-side proxy is the only signal available.

**7. Whether the `subscription_status` enum's `paused` and `cancelled` values are ever written.** Nothing in this repo writes them; `recordPayment` only ever sets `active`. The expiry schedule filters on `status === "active"`, so a row in another state is excluded from revenue at risk. If those states turn out to be set by something outside the repo, that filter is wrong and the schedule understates risk.

**8. Whether the legacy `unlocks` table still receives rows.** It is pre-pivot and its `amount` is in pesos with a default of 20. It is read and reported under its own unit-named row, kept out of every centavos calculation. Whether it should be reported at all beyond a historical footnote is a judgment for the first run.

**9. Free-tier headroom on Vercel and Supabase.** Neither exposes a usage API this collector can reach. Active CPU is copied from Operations or left `not read`; Supabase's limits are not read at all. Sub-function 9 therefore lands as "copy the one number Operations measured, and say plainly that the rest is unmeasured".

**10. Whether Growth (VANTAGE) has been built.** The build order is Ops → Growth → Finance → Security, so it probably has — but nothing in this plan depends on it. Task 2 Step 1 reuses a reports Supabase client if one exists, the collector's intent figure is event-counted and hands off rather than duplicating Growth's device-level funnel, and `phWindow.ts` never imports `phWeek.ts`.

## Deferred from this plan

The spec gives Finance ten sub-functions. This plan implements all ten. Five things around the edges are deliberately postponed.

**Real cost accounting.** Every department writes `costUsd: null`, because an agent running as a subagent cannot measure its own token use — that needs headless `claude -p --output-format json`. Finance inherits the limitation rather than solving it, and the fix belongs with Operations, which owns the ledger.

**PayMongo-side reconciliation.** The strongest possible integrity check is comparing the ledger against PayMongo's own payments list, which is exactly what `listRecentPaidLinks` and the admin reconcile view already do. Both need the live secret key, which is `[SENSITIVE]` and cannot be pulled. Rather than build a weaker substitute, `WEBHOOK_LANDING_CEILING` names the existing manual procedure and LEDGER recommends running it. **This is the single biggest gap in the department**, and it is a credentials problem, not a design one — the day that key is readable by a collector, this becomes a scheduled check.

**Refunds and chargebacks.** There is no refunds table and no refund path in the app. A refund today happens entirely inside PayMongo and leaves the ledger untouched, which means reported revenue would overstate. Naming that here is the honest position; building for it before a single refund has occurred is not.

**Cost per active user.** Sub-function 9 asks for it, and it needs an active-*device* count that belongs to Growth's aggregates. Crossing departments' numbers inside a collector is how two departments start disagreeing about the same figure. Finance reports cost per **paying** device — which it can compute from its own data — and leaves the active-device denominator to the council, where cross-department context is supposed to be combined.

**Subscription churn and cohort retention.** Meaningful only after more than one renewal cycle exists. `matchedByRenewal` counts renewals from today onward, so the data starts accumulating with the first run; the analysis waits until there is something to analyse.

**Consolidating `phWeek.ts` and `phWindow.ts`.** See the note after Task 3. Correct end state, wrong time to do it.

None of these block the department. Revenue accounting, ledger integrity, billing operations, unit economics, pricing and packaging, formula drift, revenue recognition, renewals and expiry, cost of operation, and scenario modelling are all live on the first run.

## Verification

After all tasks, confirm the department works end to end:

- [ ] `npx vitest run lib/reports/` passes, with 210 more tests than before this plan
- [ ] The block-price standing assertion is among them, and has been watched to fail once (Task 7 Step 5) and pass again
- [ ] `npx tsx scripts/reports/finance.ts` writes `docs/reports/finance/.data/<YYYY-MM>.json`, keyed to the **Manila** calendar month
- [ ] That payload carries 47 metrics, three rendered tables, and an `errors` array that is empty (or holds only `ops-handoff` if Operations has never run)
- [ ] The month-to-date labels do **not** appear in the persisted `metrics` array
- [ ] The `MONTH TO DATE` table has empty previous and delta columns
- [ ] `reconciliation.exceptions` entries each carry a `kind`, a `linkId`, a `deviceId` and a written `reason` — never a bare count
- [ ] `counts.matchedByRenewal` exists and is not reported as an exception
- [ ] `npx tsx scripts/reports/finance.ts --weekly` writes into `.data/weekly/` and produces exactly 6 metrics
- [ ] `ls docs/reports/finance/.data/` shows the month file and a `weekly/` directory, and the monthly run's `previousKey` never names a weekly file
- [ ] Running either collector twice in the same period archives the first run to `.data/superseded/<key>.1.json`
- [ ] `assertUnderCap` has not fired for any table
- [ ] Dispatching `ledger` in a **fresh session** produces `docs/reports/finance/<YYYY-MM>.md`
- [ ] The report reconciles before it quotes revenue, and names every exception individually
- [ ] The report states that revenue is single-source
- [ ] The CAC disclaimer appears verbatim wherever CAC is quoted
- [ ] Every scenario line carries its assumptions, including the 10x one
- [ ] The Active CPU row reads a copied value or `not read` — never an estimate
- [ ] The weekly delta opened no P2 or P3 findings
- [ ] `docs/reports/cost-ledger.jsonl` has a `"department":"finance"` line per monthly run and `"finance-weekly"` per delta
- [ ] `git status --porcelain docs/reports/` is empty
- [ ] `git diff HEAD` contains no revenue, conversion, or ARPU figure in any tracked file
- [ ] `npm test && npm run typecheck && npm run lint` all pass
