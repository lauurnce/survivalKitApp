# Growth Department Agent (VANTAGE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Growth department agent (VANTAGE) — a deterministic collector that aggregates the funnel in Postgres, a set of RPC migrations that make that possible, the interpreter that reads the result, and the admin-dashboard repair that removes two dead funnel steps.

**Architecture:** Same two layers Operations already proved. A deterministic collector (`scripts/reports/growth.ts`) calls Postgres aggregate functions over RPC with production credentials from `.env.reports.local`, then emits JSON and two finished metrics tables — no LLM, no tokens. An interpreter agent (`.claude/agents/vantage.md`) reads that JSON plus the previous report and writes the new one, doing judgment only. Pure logic lives in `lib/reports/` and is unit-tested with Vitest. The heavy lifting is in Postgres because Supabase caps a `select` at 1000 rows and `events` is far past that.

**Tech Stack:** TypeScript, Node 24, tsx, Vitest, Postgres/Supabase RPC, `@supabase/supabase-js` (already a dependency), Claude Code subagents and skills. No new npm dependencies.

## Global Constraints

- **Node 24.x** — matches `engines` in `package.json`.
- **No new npm dependencies.** Env parsing uses a small tested parser in `lib/reports/`, not `dotenv`. The Supabase client is `@supabase/supabase-js`, already present.
- **Collectors are read-only.** Every RPC in this plan is a `select`-only function. Nothing writes to Supabase.
- **Aggregate in Postgres, never in JavaScript.** Supabase caps a `select` at 1000 rows and `events` is far past that. A collector that pulls rows and counts them in Node produces a silently truncated number. Every count in this plan is computed by a Postgres function that returns a single JSON row.
- **Credentials come from `.env.reports.local` only.** Never `.env.local` — it deliberately carries no Supabase values so `npm run dev` cannot write into the dataset Growth reads.
- **`tsx` transpiles to CommonJS.** `__dirname` works. **Top-level `await` does not** — wrap async work in a `main()` and call it, exactly as `scripts/reports/ops.ts` does.
- **Manila dates everywhere.** File names, window boundaries, and week buckets all use `Asia/Manila`. UTC misfiles everything written between midnight and 8am PH.
- **Never write an estimate into a metric row.** An unmeasured value is `null` and renders as `not read`. This applies to a failed RPC as much as to Active CPU.
- **`docs/reports/` is gitignored in full.** The repo is public and these reports carry traffic and conversion figures. Nothing from `docs/reports/` may be copied into a tracked file — including into this plan. Every number in this document is either a synthetic test fixture or a description of where a real number lives.
- **Tests colocate with source** as `<name>.test.ts`.
- **Migrations get a `<name>.test.md` verification doc**, matching `20260716000000_classes.test.md` — a real Postgres run, not an assertion.
- **Commit messages use conventional-commit prefixes** and carry **no trailer block** — no `Co-Authored-By` of any kind.
- **Severity labels are exactly** `P0`, `P1`, `P2`, `P3`, `ACCEPTED`. Finding states are exactly `NEW`, `ONGOING`, `CLOSED`.

## Shared machinery this plan reuses and does not rebuild

These already exist, are tested, and are consumed as-is. Do not duplicate or re-plan them.

| Module | What VANTAGE uses it for |
|---|---|
| `lib/reports/severity.ts` | `Severity`, `FindingState`, `compareSeverity`, `validateFinding` |
| `lib/reports/metrics.ts` | `Metric`, `diffMetrics`, `renderMetricsTable` — `null` renders `not read` |
| `lib/reports/costLedger.ts` | `docs/reports/cost-ledger.jsonl` append, `summarizeMonth` |
| `lib/reports/runArchive.ts` | `archiveExistingRun` — displaces a same-day re-run to `.data/superseded/` |
| `scripts/reports/cost.ts` | `npm run report:cost`, pasted into the `CUMULATIVE` footer |
| `.claude/skills/report/SKILL.md` | The `/report` command; this plan adds a row to its routing table |

## File Structure

| Path | Responsibility |
|---|---|
| `lib/reports/phWeek.ts` (+ `.test.ts`) | Manila calendar dates and trailing complete-week windows. Pure. |
| `lib/reports/funnel.ts` (+ `.test.ts`) | Funnel step definitions, conversion rates, largest leak, metric rows. Pure. |
| `lib/reports/academicCalendar.ts` (+ `.test.ts`) | Owner-maintained term-phase lookup for seasonality. Returns `unknown` rather than guessing. Pure. |
| `lib/reports/reportsEnv.ts` (+ `.test.ts`) | Parses `.env.reports.local` text and validates the credentials it must contain. Pure. |
| `scripts/reports/supabaseAdmin.ts` | Thin service-role client factory for collectors. File I/O only. |
| `scripts/reports/growth.ts` | The Growth collector. Calls the RPCs, renders the tables, writes JSON. |
| `supabase/migrations/20260808000000_growth_identity_agg.sql` (+ `.test.md`) | The user-count reconciliation. First-run priority. |
| `supabase/migrations/20260808000001_growth_funnel_agg.sql` (+ `.test.md`) | Funnel steps, ledger completion, dead-event evidence. |
| `supabase/migrations/20260808000002_growth_audience_agg.sql` (+ `.test.md`) | Acquisition attribution and year/subject segmentation. |
| `supabase/migrations/20260808000003_growth_retention_agg.sql` (+ `.test.md`) | Cohorts, weekly active series, content fit, demand, voice of customer. |
| `lib/adminFunnel.ts` (+ `.test.ts`) | The admin dashboard's funnel step list, with a test that every step is emitted by real code. |
| `app/admin/page.tsx` | Imports the step list instead of defining it inline. |
| `components/AdminDashboard.tsx` | Drops the two frozen dead-event counters. |
| `.claude/agents/vantage.md` | The VANTAGE interpreter agent definition. |
| `.claude/skills/report/SKILL.md` | Adds the `growth` route. |
| `package.json` | Adds the `report:growth` script. |

`lib/reports/` stays pure and testable. Everything touching the network or the filesystem lives in `scripts/reports/`. SQL lives in migrations, never in a prompt — an agent in this system never writes ad-hoc SQL against production.

---

### Task 1: Manila week windows

**Files:**
- Create: `lib/reports/phWeek.ts`
- Test: `lib/reports/phWeek.test.ts`

**Interfaces:**
- Consumes: `PH_OFFSET_MS` from `lib/payments.ts`.
- Produces: `PhWindow`, `phDate(now: Date): string`, `phDayStartUtc(phCalendarDate: string): string`, `phWeekWindows(now: Date, weeks?: number): PhWindow[]`.

Growth is weekly, so every figure must be scoped to a window. Two rules make the windows honest. First, the window ends at the **start of today in Manila**, so it always covers whole PH calendar days — comparing a partial day against a complete one is the classic way a week-over-week chart lies. Second, boundaries are UTC instants derived from Manila midnight, because `events.created_at` is `timestamptz` and the comparison happens in Postgres.

The Philippines is UTC+8 year-round with no daylight saving, which is why a fixed offset is correct here and `PH_OFFSET_MS` already exists in `lib/payments.ts`. Import it rather than defining a second copy.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/phWeek.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { phDate, phDayStartUtc, phWeekWindows } from "./phWeek";

describe("phDate", () => {
  it("returns the Manila calendar date for an afternoon UTC instant", () => {
    expect(phDate(new Date("2026-08-08T10:00:00.000Z"))).toBe("2026-08-08");
  });

  it("rolls forward to the next PH day once UTC passes 16:00", () => {
    // 16:00Z is midnight in Manila. UTC still says the 8th; PH says the 9th.
    expect(phDate(new Date("2026-08-08T16:00:00.000Z"))).toBe("2026-08-09");
  });

  it("does not roll forward one second early", () => {
    expect(phDate(new Date("2026-08-08T15:59:59.999Z"))).toBe("2026-08-08");
  });
});

describe("phDayStartUtc", () => {
  it("maps a PH calendar date to the UTC instant of its midnight", () => {
    expect(phDayStartUtc("2026-08-08")).toBe("2026-08-07T16:00:00.000Z");
  });

  it("round-trips with phDate", () => {
    const start = phDayStartUtc("2026-01-01");
    expect(phDate(new Date(start))).toBe("2026-01-01");
  });
});

describe("phWeekWindows", () => {
  const now = new Date("2026-08-08T10:00:00.000Z"); // PH: 2026-08-08 18:00

  it("returns the two most recent complete PH weeks, newest first", () => {
    const [current, previous] = phWeekWindows(now, 2);

    expect(current.sinceIso).toBe("2026-07-31T16:00:00.000Z");
    expect(current.untilIso).toBe("2026-08-07T16:00:00.000Z");
    expect(current.label).toBe("2026-08-01 → 2026-08-07");

    expect(previous.sinceIso).toBe("2026-07-24T16:00:00.000Z");
    expect(previous.untilIso).toBe("2026-07-31T16:00:00.000Z");
    expect(previous.label).toBe("2026-07-25 → 2026-07-31");
  });

  it("excludes today, so a partial day is never compared against a whole one", () => {
    const [current] = phWeekWindows(now, 1);
    expect(current.untilIso).toBe(phDayStartUtc(phDate(now)));
  });

  it("windows abut exactly with no gap and no overlap", () => {
    const [current, previous] = phWeekWindows(now, 2);
    expect(previous.untilIso).toBe(current.sinceIso);
  });

  it("returns as many windows as asked for", () => {
    expect(phWeekWindows(now, 8)).toHaveLength(8);
  });

  it("defaults to two windows", () => {
    expect(phWeekWindows(now)).toHaveLength(2);
  });

  it("is stable across a UTC day boundary that PH has already crossed", () => {
    // 20:00Z on the 8th is 04:00 on the 9th in Manila. The current window must
    // end at PH midnight of the 9th, not the 8th.
    const [current] = phWeekWindows(new Date("2026-08-08T20:00:00.000Z"), 1);
    expect(current.untilIso).toBe("2026-08-08T16:00:00.000Z");
    expect(current.label).toBe("2026-08-02 → 2026-08-08");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/phWeek.test.ts`
Expected: FAIL — cannot resolve `./phWeek`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/phWeek.ts`:

```typescript
/**
 * Manila calendar windows for weekly department reports.
 *
 * Two decisions are load-bearing.
 *
 * First, the current window ends at the start of TODAY in Manila, not at
 * "now". A window that includes a partial day is compared against windows
 * that do not, so every week-over-week delta carries a fraction of a day of
 * noise in one direction. Whole PH days only.
 *
 * Second, boundaries are emitted as UTC instants. `events.created_at` and
 * `payments.paid_at` are timestamptz, and the comparison happens inside
 * Postgres — handing it a naive local date would compare against the
 * database's timezone, not the Philippines'.
 *
 * The Philippines is UTC+8 all year with no daylight saving, which is why a
 * fixed offset is correct and why PH_OFFSET_MS already exists in
 * lib/payments.ts. There is one definition of that offset; import it.
 */

import { PH_OFFSET_MS } from "../payments";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export interface PhWindow {
  /** "YYYY-MM-DD → YYYY-MM-DD", the inclusive first and last PH calendar day. */
  label: string;
  /** UTC instant of the first PH midnight inside the window. Inclusive. */
  sinceIso: string;
  /** UTC instant of the PH midnight that closes the window. Exclusive. */
  untilIso: string;
}

/** The Manila calendar date of an instant, as YYYY-MM-DD. */
export function phDate(now: Date): string {
  return new Date(now.getTime() + PH_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant at which a PH calendar date began. */
export function phDayStartUtc(phCalendarDate: string): string {
  const utcMidnight = Date.parse(`${phCalendarDate}T00:00:00.000Z`);
  return new Date(utcMidnight - PH_OFFSET_MS).toISOString();
}

/**
 * Trailing complete PH weeks, newest first. Index 0 is the seven whole days
 * ending at PH midnight this morning; index 1 is the seven before that.
 */
export function phWeekWindows(now: Date, weeks = 2): PhWindow[] {
  const todayStartMs = Date.parse(phDayStartUtc(phDate(now)));

  return Array.from({ length: weeks }, (_, i) => {
    const untilMs = todayStartMs - i * WEEK_MS;
    const sinceMs = untilMs - WEEK_MS;
    return {
      // The last day INSIDE the window is one day before its exclusive end.
      label: `${phDate(new Date(sinceMs))} → ${phDate(new Date(untilMs - DAY_MS))}`,
      sinceIso: new Date(sinceMs).toISOString(),
      untilIso: new Date(untilMs).toISOString(),
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/phWeek.test.ts`
Expected: PASS — 11 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/phWeek.ts lib/reports/phWeek.test.ts
git commit -m "feat(reports): add Manila complete-week windows"
```

---

### Task 2: Funnel shaping and leak detection

**Files:**
- Create: `lib/reports/funnel.ts`
- Test: `lib/reports/funnel.test.ts`

**Interfaces:**
- Consumes: `Metric` from `lib/reports/metrics.ts`.
- Produces: `FunnelStepDef`, `FUNNEL_STEPS`, `FunnelStep`, `Leak`, `FunnelCounts`, `pct(numerator: number, denominator: number): number | null`, `buildFunnel(counts: FunnelCounts): FunnelStep[]`, `largestLeak(steps: FunnelStep[]): Leak | null`, `funnelMetrics(steps: FunnelStep[], leak: Leak | null): Metric[]`.

This is where the live funnel is written down once, in tested code, so neither the collector nor the agent ever retypes it:

`enter → year_select → subject_open → module_open → paywall_teaser_view → paywall_teaser_click → subscribe_click → paid`

Three properties this module must have, each of which is a real behaviour of this product and not a hypothetical:

1. **The funnel is not guaranteed monotonic.** A device that arrives on a shared module URL emits `module_open` with no preceding `enter`. A later step can therefore exceed an earlier one. Never clamp that away — a `fromPrevious` above 1 is real information about deep links, and hiding it would be the exact vanity-metric behaviour VANTAGE exists to prevent.
2. **The largest leak is ranked by devices lost, not by rate.** At this traffic a 100% drop from two devices is noise while a 40% drop from several hundred is the actual problem. Ranking by absolute loss needs no arbitrary volume threshold, which is one less piece of judgment smuggled into the collector.
3. **A rate with a zero denominator is `null`, not `0`.** `0%` and "no data" are different claims and rendering them identically is how a report lies quietly. `null` reaches the table as `not read`.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/funnel.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  FUNNEL_STEPS,
  buildFunnel,
  largestLeak,
  funnelMetrics,
  pct,
  type FunnelCounts,
} from "./funnel";

// Synthetic fixtures. These are invented shapes for testing arithmetic and
// carry no relationship to production traffic.
const counts: FunnelCounts = {
  enter: 1000,
  year_select: 800,
  subject_open: 600,
  module_open: 500,
  paywall_teaser_view: 200,
  paywall_teaser_click: 40,
  subscribe_click: 20,
  paid: 2,
};

describe("FUNNEL_STEPS", () => {
  it("is the live path in order, ending at a ledger-sourced completion", () => {
    expect(FUNNEL_STEPS.map((s) => s.key)).toEqual([
      "enter",
      "year_select",
      "subject_open",
      "module_open",
      "paywall_teaser_view",
      "paywall_teaser_click",
      "subscribe_click",
      "paid",
    ]);
  });

  it("marks paid as coming from the ledger, not from an event", () => {
    expect(FUNNEL_STEPS.at(-1)).toMatchObject({ key: "paid", source: "ledger" });
    expect(FUNNEL_STEPS.slice(0, -1).every((s) => s.source === "events")).toBe(true);
  });

  it("contains no dead event type", () => {
    const keys = FUNNEL_STEPS.map((s) => s.key);
    expect(keys).not.toContain("unlock_click");
    expect(keys).not.toContain("unlock_submitted");
  });
});

describe("pct", () => {
  it("returns whole percentage points", () => {
    expect(pct(20, 200)).toBe(10);
  });

  it("rounds to the nearest point", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(2, 3)).toBe(67);
  });

  it("returns null rather than 0 when the denominator is zero", () => {
    expect(pct(0, 0)).toBeNull();
    expect(pct(5, 0)).toBeNull();
  });

  it("does not clamp above 100", () => {
    expect(pct(150, 100)).toBe(150);
  });
});

describe("buildFunnel", () => {
  it("returns one step per definition, in order", () => {
    expect(buildFunnel(counts).map((s) => s.key)).toEqual(
      FUNNEL_STEPS.map((s) => s.key)
    );
  });

  it("carries the device count for each step", () => {
    expect(buildFunnel(counts)[0].devices).toBe(1000);
    expect(buildFunnel(counts).at(-1)!.devices).toBe(2);
  });

  it("leaves the first step with no previous-step conversion", () => {
    expect(buildFunnel(counts)[0].fromPrevious).toBeNull();
    expect(buildFunnel(counts)[0].fromTop).toBe(100);
  });

  it("computes step-to-step and top-of-funnel conversion in percentage points", () => {
    const steps = buildFunnel(counts);
    const paywall = steps.find((s) => s.key === "paywall_teaser_view")!;
    expect(paywall.fromPrevious).toBe(40); // 200 of 500
    expect(paywall.fromTop).toBe(20); // 200 of 1000
  });

  it("treats a missing count as zero rather than throwing", () => {
    const steps = buildFunnel({ enter: 10 } as FunnelCounts);
    expect(steps.find((s) => s.key === "subscribe_click")!.devices).toBe(0);
  });

  it("reports conversion above 100% instead of clamping it", () => {
    // Deep links: a device can reach module_open without ever emitting enter.
    const steps = buildFunnel({ ...counts, module_open: 900 });
    const step = steps.find((s) => s.key === "module_open")!;
    expect(step.fromPrevious).toBe(150);
    expect(step.nonMonotonic).toBe(true);
  });

  it("flags only the steps that actually exceed their predecessor", () => {
    expect(buildFunnel(counts).some((s) => s.nonMonotonic)).toBe(false);
  });

  it("returns null conversion when the previous step had no devices", () => {
    const steps = buildFunnel({ ...counts, paywall_teaser_view: 0 });
    expect(steps.find((s) => s.key === "paywall_teaser_click")!.fromPrevious).toBeNull();
  });
});

describe("largestLeak", () => {
  it("names the transition that lost the most devices", () => {
    const leak = largestLeak(buildFunnel(counts))!;
    expect(leak.fromKey).toBe("module_open");
    expect(leak.toKey).toBe("paywall_teaser_view");
    expect(leak.lost).toBe(300);
    expect(leak.rate).toBe(60);
  });

  it("does not pick a high-rate drop over a high-volume one", () => {
    // paywall_teaser_view -> paywall_teaser_click loses 80% but only 160
    // devices; module_open -> paywall_teaser_view loses 60% and 300 devices.
    const leak = largestLeak(buildFunnel(counts))!;
    expect(leak.lost).toBeGreaterThan(160);
  });

  it("breaks a tie on devices lost by choosing the steeper rate", () => {
    const steps = buildFunnel({
      enter: 100,
      year_select: 90, // lost 10, rate 10%
      subject_open: 80, // lost 10, rate 11%
      module_open: 80,
      paywall_teaser_view: 80,
      paywall_teaser_click: 80,
      subscribe_click: 80,
      paid: 80,
    });
    const leak = largestLeak(steps)!;
    expect(leak.fromKey).toBe("year_select");
  });

  it("ignores transitions that gained devices", () => {
    const steps = buildFunnel({ ...counts, year_select: 1200 });
    expect(largestLeak(steps)!.fromKey).not.toBe("enter");
  });

  it("returns null when nothing was lost anywhere", () => {
    const flat = buildFunnel({
      enter: 5,
      year_select: 5,
      subject_open: 5,
      module_open: 5,
      paywall_teaser_view: 5,
      paywall_teaser_click: 5,
      subscribe_click: 5,
      paid: 5,
    });
    expect(largestLeak(flat)).toBeNull();
  });

  it("returns null on a completely empty funnel", () => {
    expect(largestLeak(buildFunnel({} as FunnelCounts))).toBeNull();
  });
});

describe("funnelMetrics", () => {
  it("emits one numbered row per step plus the leak", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    expect(rows).toHaveLength(FUNNEL_STEPS.length + 2);
    expect(rows[0].label).toBe("1 Opened app");
    expect(rows[0].value).toBe(1000);
  });

  it("labels the ledger step so its source is never mistaken", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    expect(rows[7].label).toBe("8 Paid (ledger)");
  });

  it("renders the leak as its lost-device count with a percentage row", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    const lost = rows.find((r) => r.label === "Largest leak (devices)")!;
    const rate = rows.find((r) => r.label === "Largest leak (%)")!;
    expect(lost.value).toBe(300);
    expect(rate.value).toBe(60);
    expect(rate.unit).toBe("%");
  });

  it("records a null leak as not-read rather than zero", () => {
    const rows = funnelMetrics(buildFunnel({} as FunnelCounts), null);
    expect(rows.find((r) => r.label === "Largest leak (devices)")!.value).toBeNull();
    expect(rows.find((r) => r.label === "Largest leak (%)")!.value).toBeNull();
  });

  it("keeps the row set identical whatever the data", () => {
    const a = funnelMetrics(buildFunnel(counts), largestLeak(buildFunnel(counts)));
    const b = funnelMetrics(buildFunnel({} as FunnelCounts), null);
    expect(a.map((r) => r.label)).toEqual(b.map((r) => r.label));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/funnel.test.ts`
Expected: FAIL — cannot resolve `./funnel`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/funnel.ts`:

```typescript
/**
 * The live acquisition-to-payment funnel, written down once.
 *
 * `unlock_click` and `unlock_submitted` are deliberately absent. They are
 * pre-pivot event types: still in the DB enum, the events API allowlist, and
 * lib/supabase/types.ts, but emitted by no code since the subscription pivot.
 * Anything that renders them shows a frozen count that will never move again.
 *
 * There is also no completion event on the live path. `unlock_submitted` was
 * the "they paid" step and the pivot never replaced it, so completion comes
 * from the payments ledger instead. That is the better source regardless: a
 * ledger row is written by a verified webhook, while a client beacon is simply
 * lost whenever a user bounces to GCash and never comes back.
 */

import type { Metric } from "./metrics";

export interface FunnelStepDef {
  key: string;
  label: string;
  /** Where the number comes from. `paid` is not an event and never will be. */
  source: "events" | "ledger";
}

export const FUNNEL_STEPS: readonly FunnelStepDef[] = [
  { key: "enter", label: "Opened app", source: "events" },
  { key: "year_select", label: "Selected year", source: "events" },
  { key: "subject_open", label: "Opened a subject", source: "events" },
  { key: "module_open", label: "Opened a module", source: "events" },
  { key: "paywall_teaser_view", label: "Saw the paywall", source: "events" },
  { key: "paywall_teaser_click", label: "Tapped the paywall", source: "events" },
  { key: "subscribe_click", label: "Started checkout", source: "events" },
  { key: "paid", label: "Paid (ledger)", source: "ledger" },
] as const;

export type FunnelCounts = Record<string, number>;

export interface FunnelStep {
  key: string;
  label: string;
  source: "events" | "ledger";
  devices: number;
  /** Percentage points from the previous step. null on step 1 or a zero base. */
  fromPrevious: number | null;
  /** Percentage points from the top of the funnel. null on a zero base. */
  fromTop: number | null;
  /** True when this step has MORE devices than the one before it. */
  nonMonotonic: boolean;
}

export interface Leak {
  fromKey: string;
  toKey: string;
  /** Devices that reached `fromKey` but not `toKey`. */
  lost: number;
  /** Those devices as a percentage of `fromKey`. */
  rate: number;
}

/**
 * Whole percentage points, or null when there is no base to divide by.
 *
 * Returning 0 for a zero denominator would state "nobody converted" when the
 * truth is "nobody arrived". Those are different findings and a report must
 * not merge them.
 */
export function pct(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export function buildFunnel(counts: FunnelCounts): FunnelStep[] {
  const top = counts[FUNNEL_STEPS[0].key] ?? 0;

  return FUNNEL_STEPS.map((def, i) => {
    const devices = counts[def.key] ?? 0;
    const previous = i === 0 ? null : counts[FUNNEL_STEPS[i - 1].key] ?? 0;

    return {
      key: def.key,
      label: def.label,
      source: def.source,
      devices,
      fromPrevious: previous === null ? null : pct(devices, previous),
      fromTop: pct(devices, top),
      // Not an error. A device that opens a shared module link emits
      // module_open with no preceding enter, so later steps can legitimately
      // exceed earlier ones. Surfacing it beats silently clamping it.
      nonMonotonic: previous !== null && devices > previous,
    };
  });
}

/**
 * The transition that lost the most devices.
 *
 * Ranked by absolute loss rather than by rate on purpose. At this traffic a
 * two-device step dropping to zero is a 100% "leak" and is noise; several
 * hundred devices lost at one transition is the thing worth a week of work.
 * Ranking by count also avoids inventing a minimum-volume threshold, which
 * would be judgment — and judgment belongs to the agent, not the collector.
 */
export function largestLeak(steps: FunnelStep[]): Leak | null {
  let worst: Leak | null = null;

  for (let i = 1; i < steps.length; i += 1) {
    const from = steps[i - 1];
    const to = steps[i];
    const lost = from.devices - to.devices;
    if (lost <= 0) continue;

    const rate = pct(lost, from.devices);
    if (rate === null) continue;

    const better =
      worst === null || lost > worst.lost || (lost === worst.lost && rate > worst.rate);
    if (better) worst = { fromKey: from.key, toKey: to.key, lost, rate };
  }

  return worst;
}

/**
 * The fixed metric row set for the FUNNEL table. The labels must never change
 * between runs — a changed label resets that row's delta history, which is a
 * deliberate decision and not something to do by accident while editing.
 */
export function funnelMetrics(steps: FunnelStep[], leak: Leak | null): Metric[] {
  return [
    ...steps.map((step, i) => ({
      label: `${i + 1} ${step.label}`,
      value: step.devices,
    })),
    { label: "Largest leak (devices)", value: leak?.lost ?? null },
    { label: "Largest leak (%)", value: leak?.rate ?? null, unit: "%" },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/funnel.test.ts`
Expected: PASS — 26 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/funnel.ts lib/reports/funnel.test.ts
git commit -m "feat(reports): add funnel shaping and leak detection"
```

---

### Task 3: Term-phase calendar for seasonality

**Files:**
- Create: `lib/reports/academicCalendar.ts`
- Test: `lib/reports/academicCalendar.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `TermPhase`, `TermWindow`, `TERM_CALENDAR`, `phaseFor(phCalendarDate: string, calendar?: readonly TermWindow[]): TermPhase`, `phaseForRange(startPhDate: string, endPhDate: string, calendar?: readonly TermWindow[]): { phase: TermPhase; mixed: boolean }`.

The charter requires the department to distinguish "engagement dropped" from "it is not exam week", because visits cluster hard around exam dates. That needs a calendar, and a calendar is a fact about Philippine universities that this codebase does not know.

So `TERM_CALENDAR` **ships empty** and `phaseFor` returns `"unknown"` for every date until the owner fills it in. That is the same rule the Active CPU row already follows: an unmeasured value is recorded as "not read", never estimated. A fabricated exam calendar would be worse than none, because VANTAGE would confidently attribute a real drop to a term break that was never happening.

The seasonality signal that *is* available from data — a trailing weekly active-device series — comes from `growth_cohort_agg` in Task 8. The calendar sharpens that once populated; it is not a prerequisite for the department to be useful.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/academicCalendar.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  TERM_CALENDAR,
  phaseFor,
  phaseForRange,
  type TermWindow,
} from "./academicCalendar";

// Synthetic calendar. The shipped TERM_CALENDAR is empty by design; these
// windows exist only to test the lookup.
const sample: readonly TermWindow[] = [
  { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
  { phase: "midterms", startPhDate: "2026-09-21", endPhDate: "2026-09-27" },
  { phase: "break", startPhDate: "2026-12-20", endPhDate: "2027-01-04" },
];

describe("TERM_CALENDAR", () => {
  it("ships empty so no exam date is ever invented", () => {
    expect(TERM_CALENDAR).toEqual([]);
  });
});

describe("phaseFor", () => {
  it("returns unknown for every date while the shipped calendar is empty", () => {
    expect(phaseFor("2026-08-08")).toBe("unknown");
  });

  it("finds the phase covering a date", () => {
    expect(phaseFor("2026-08-08", sample)).toBe("classes");
    expect(phaseFor("2026-09-24", sample)).toBe("midterms");
  });

  it("treats both window ends as inclusive", () => {
    expect(phaseFor("2026-08-01", sample)).toBe("classes");
    expect(phaseFor("2026-09-20", sample)).toBe("classes");
  });

  it("returns unknown for a date no window covers", () => {
    expect(phaseFor("2026-10-15", sample)).toBe("unknown");
  });

  it("handles a window that spans a year boundary", () => {
    expect(phaseFor("2026-12-31", sample)).toBe("break");
    expect(phaseFor("2027-01-02", sample)).toBe("break");
  });
});

describe("phaseForRange", () => {
  it("reports a single phase when the whole range sits inside one window", () => {
    expect(phaseForRange("2026-08-01", "2026-08-07", sample)).toEqual({
      phase: "classes",
      mixed: false,
    });
  });

  it("flags a range that straddles two phases", () => {
    expect(phaseForRange("2026-09-18", "2026-09-24", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("returns unknown and unmixed when nothing in the range is covered", () => {
    expect(phaseForRange("2026-10-01", "2026-10-07", sample)).toEqual({
      phase: "unknown",
      mixed: false,
    });
  });

  it("returns unknown for any range against the empty shipped calendar", () => {
    expect(phaseForRange("2026-08-01", "2026-08-07")).toEqual({
      phase: "unknown",
      mixed: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/academicCalendar.test.ts`
Expected: FAIL — cannot resolve `./academicCalendar`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/academicCalendar.ts`:

```typescript
/**
 * Term phases, so a traffic drop can be told apart from a term break.
 *
 * Visits to this product cluster around exam dates. Without a calendar, a
 * quiet week reads identically whether the audience left or the semester
 * ended — and those call for opposite responses.
 *
 * TERM_CALENDAR SHIPS EMPTY ON PURPOSE. Philippine academic dates are not a
 * fact this codebase knows, and an invented one is worse than none: VANTAGE
 * would confidently blame a real regression on a break that was never
 * happening. Same rule the Active CPU row follows — an unknown value is
 * recorded as unknown, never estimated.
 *
 * To populate it, add windows below with real dates from the universities the
 * audience actually attends, then re-run the report. Until then VANTAGE says
 * "term phase not recorded" and leans on the trailing weekly-active series
 * from growth_cohort_agg instead.
 */

export type TermPhase =
  | "classes"
  | "prelims"
  | "midterms"
  | "finals"
  | "break"
  | "unknown";

export interface TermWindow {
  phase: Exclude<TermPhase, "unknown">;
  /** PH calendar date, YYYY-MM-DD. Inclusive. */
  startPhDate: string;
  /** PH calendar date, YYYY-MM-DD. Inclusive. */
  endPhDate: string;
  /** Optional: which school or system this window came from. */
  note?: string;
}

/** Owner-maintained. Empty until real dates are supplied. */
export const TERM_CALENDAR: readonly TermWindow[] = [];

/** The phase covering a PH calendar date, or "unknown" if none does. */
export function phaseFor(
  phCalendarDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): TermPhase {
  // ISO dates compare correctly as strings, which keeps this free of any
  // timezone reasoning — the caller already resolved the PH calendar date.
  const hit = calendar.find(
    (w) => phCalendarDate >= w.startPhDate && phCalendarDate <= w.endPhDate
  );
  return hit?.phase ?? "unknown";
}

/**
 * Add one day to a YYYY-MM-DD date string. Handles month and year rollover.
 * Used to distinguish adjacent windows (contiguous coverage) from real gaps.
 */
function dayAfter(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dy = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dy}`;
}

/**
 * The phase covering a report window. `mixed` is true when the window spans
 * more than one phase, which is a caveat the agent must state rather than
 * pick a winner for.
 *
 * Scans the entire range for overlapping windows, not just endpoints, so that
 * a window fully enclosed by the range (touching neither endpoint) is detected.
 * If any date in [startPhDate, endPhDate] is not covered by an overlapping
 * window, "unknown" is included in the phase set.
 */
export function phaseForRange(
  startPhDate: string,
  endPhDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): { phase: TermPhase; mixed: boolean } {
  // Find all windows overlapping the range: w.start <= endPhDate && w.end >= startPhDate
  const overlapping = calendar.filter(
    (w) => w.startPhDate <= endPhDate && w.endPhDate >= startPhDate
  );

  if (overlapping.length === 0) {
    return { phase: "unknown", mixed: false };
  }

  // Collect all phases present in overlapping windows
  const phases = new Set<TermPhase>();
  for (const w of overlapping) {
    phases.add(w.phase);
  }

  // Check if the overlapping windows cover the entire range [startPhDate, endPhDate]
  // without gaps. If there are uncovered dates, include "unknown" in the phase set.
  const sorted = overlapping.sort((a, b) =>
    a.startPhDate.localeCompare(b.startPhDate)
  );

  let hasCoverageGap = false;

  // Check if the first window starts after startPhDate (gap at the beginning)
  if (sorted[0]!.startPhDate > startPhDate) {
    hasCoverageGap = true;
  } else {
    // Check for gaps between consecutive windows and at the end.
    // A gap exists if the next window starts AFTER the day after the current end.
    // Adjacent windows (one ends 2026-09-20, next starts 2026-09-21) are contiguous.
    let currentEnd = sorted[0]!.endPhDate;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startPhDate > dayAfter(currentEnd)) {
        // Gap between window i-1 and window i
        hasCoverageGap = true;
        break;
      }
      // Extend current end (ISO strings compare correctly)
      currentEnd =
        sorted[i]!.endPhDate > currentEnd
          ? sorted[i]!.endPhDate
          : currentEnd;
    }

    // Check if the range extends beyond all windows (gaps at the end)
    if (!hasCoverageGap && endPhDate > dayAfter(currentEnd)) {
      hasCoverageGap = true;
    }
  }

  if (hasCoverageGap) {
    phases.add("unknown");
  }

  const mixed = phases.size > 1;

  // Determine which phase to return
  let phase: TermPhase;
  if (!mixed) {
    // Only one phase present
    phase = Array.from(phases)[0]!;
  } else {
    // Multiple phases: prefer the phase at startPhDate
    const startPhase = phaseFor(startPhDate, calendar);
    if (startPhase !== "unknown") {
      phase = startPhase;
    } else {
      // If start is unknown, use the first known phase in chronological order.
      // All windows in sorted have non-unknown phases (by type), so use the first one.
      phase = sorted[0]?.phase ?? "unknown";
    }
  }

  return { phase, mixed };
}

/**
 * NOTE: This implementation (round 2 fix):
 * 1. Detects windows fully enclosed by the range (not touching endpoints).
 * 2. Uses dayAfter() to properly distinguish adjacent windows from real gaps.
 * 3. Returns the chronologically first known phase, not declaration order.
 * The owner has ruled this scanning version as governing.
 */
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/academicCalendar.test.ts`
Expected: PASS — 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/academicCalendar.ts lib/reports/academicCalendar.test.ts
git commit -m "feat(reports): add term-phase lookup for seasonality"
```

---

### Task 4: Report credentials and the collector's Supabase client

**Files:**
- Create: `lib/reports/reportsEnv.ts`
- Test: `lib/reports/reportsEnv.test.ts`
- Create: `scripts/reports/supabaseAdmin.ts`

**Interfaces:**
- Consumes: `createClient` from `@supabase/supabase-js`.
- Produces: `REPORTS_ENV_FILE`, `parseEnvFile(contents: string): Record<string, string>`, `ReportsCredentials`, `readReportsCredentials(vars: Record<string, string | undefined>): ReportsCredentials` from `lib/reports/reportsEnv.ts`; `createReportsClient(): SupabaseClient`, `callRpc<T>(client, name, args): Promise<RpcResult<T>>`, `RpcResult<T>` from `scripts/reports/supabaseAdmin.ts`.

**Why this parses the file instead of using `process.loadEnvFile`.** Node 24 does have `process.loadEnvFile`, and it needs no dependency — but it does **not** override variables already present in the environment. Verified on this machine:

```
FOO=fromshell node -e "process.loadEnvFile('./t.env'); console.log(process.env.FOO)"
→ fromshell
```

A `NEXT_PUBLIC_SUPABASE_URL` exported anywhere in the shell would therefore win over `.env.reports.local`, and the collector would read a different database while printing nothing unusual. Every figure in the report would be wrong and nothing would say so. Parsing the file into a plain object avoids the ambiguity entirely, is pure and testable, and still adds no dependency.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/reportsEnv.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  REPORTS_ENV_FILE,
  parseEnvFile,
  readReportsCredentials,
} from "./reportsEnv";

describe("REPORTS_ENV_FILE", () => {
  it("names the reports-only credentials file, never .env.local", () => {
    expect(REPORTS_ENV_FILE).toBe(".env.reports.local");
  });
});

describe("parseEnvFile", () => {
  it("reads simple KEY=VALUE lines", () => {
    expect(parseEnvFile("A=1\nB=two\n")).toEqual({ A: "1", B: "two" });
  });

  it("ignores blank lines and comments", () => {
    expect(parseEnvFile("# note\n\nA=1\n  # indented\n")).toEqual({ A: "1" });
  });

  it("strips matching single or double quotes", () => {
    expect(parseEnvFile(`A="one"\nB='two'\n`)).toEqual({ A: "one", B: "two" });
  });

  it("keeps equals signs inside a value", () => {
    expect(parseEnvFile("JWT=abc=def=\n")).toEqual({ JWT: "abc=def=" });
  });

  it("trims surrounding whitespace from key and value", () => {
    expect(parseEnvFile("  A = 1 \n")).toEqual({ A: "1" });
  });

  it("drops a line with no equals sign", () => {
    expect(parseEnvFile("NOTANASSIGNMENT\nA=1\n")).toEqual({ A: "1" });
  });

  it("handles CRLF line endings", () => {
    expect(parseEnvFile("A=1\r\nB=2\r\n")).toEqual({ A: "1", B: "2" });
  });

  it("returns an empty object for empty contents", () => {
    expect(parseEnvFile("")).toEqual({});
  });
});

describe("readReportsCredentials", () => {
  const valid = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  };

  it("returns both credentials", () => {
    expect(readReportsCredentials(valid)).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role-key",
    });
  });

  it("names the missing variable and the file it belongs in", () => {
    expect(() =>
      readReportsCredentials({ SUPABASE_SERVICE_ROLE_KEY: "k" })
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL.*\.env\.reports\.local/s);
  });

  it("rejects a missing service role key", () => {
    expect(() =>
      readReportsCredentials({ NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("rejects an empty value as firmly as an absent one", () => {
    expect(() => readReportsCredentials({ ...valid, SUPABASE_SERVICE_ROLE_KEY: "  " })).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  it("refuses a non-https URL so a local database cannot be reported on", () => {
    expect(() =>
      readReportsCredentials({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321" })
    ).toThrow(/https/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/reportsEnv.test.ts`
Expected: FAIL — cannot resolve `./reportsEnv`.

- [ ] **Step 3: Write the pure implementation**

Create `lib/reports/reportsEnv.ts`:

```typescript
/**
 * Credentials for report collectors.
 *
 * Collectors read production Supabase from `.env.reports.local` and nothing
 * else. `.env.local` deliberately carries no Supabase values, so that
 * `npm run dev` cannot write rows into `events`, `profiles`, or `user_feedback`
 * — that is the exact dataset Growth reports on, and local testing polluting it
 * would corrupt the department's own numbers.
 *
 * The file is parsed here rather than loaded through `process.loadEnvFile`
 * because that function does not override variables already present in the
 * environment. A stray exported NEXT_PUBLIC_SUPABASE_URL would silently win,
 * pointing the collector at a different database while the run looked normal
 * and every figure in the report was wrong.
 */

export const REPORTS_ENV_FILE = ".env.reports.local";

export interface ReportsCredentials {
  url: string;
  serviceRoleKey: string;
}

/** Minimal KEY=VALUE parser. No interpolation, no export keyword, no multiline. */
export function parseEnvFile(contents: string): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key) continue;

    // Only the FIRST equals separates key from value — service role keys and
    // JWTs routinely contain more.
    let value = line.slice(eq + 1).trim();
    const quoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);

    vars[key] = value;
  }

  return vars;
}

function require(vars: Record<string, string | undefined>, key: string): string {
  const value = vars[key]?.trim();
  if (!value) {
    throw new Error(
      `${key} is missing or empty. Report collectors read production Supabase ` +
        `credentials from ${REPORTS_ENV_FILE} at the repo root. Get them from the ` +
        `Supabase dashboard → Project Settings → API — \`vercel env pull\` cannot ` +
        `retrieve them, they are flagged Sensitive and come back as placeholders.`
    );
  }
  return value;
}

export function readReportsCredentials(
  vars: Record<string, string | undefined>
): ReportsCredentials {
  const url = require(vars, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = require(vars, "SUPABASE_SERVICE_ROLE_KEY");

  // A local Supabase has none of the production data. A report built against it
  // would be internally consistent and completely wrong, which is worse than a
  // report that refuses to run.
  if (!url.startsWith("https://")) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be an https production URL; got "${url}". ` +
        `Reports read production only.`
    );
  }

  return { url, serviceRoleKey };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/reportsEnv.test.ts`
Expected: PASS — 14 tests.

- [ ] **Step 5: Write the client factory**

Create `scripts/reports/supabaseAdmin.ts`:

```typescript
/**
 * Service-role Supabase client for report collectors.
 *
 * Read-only by convention: every RPC these collectors call is a `select`-only
 * Postgres function. The service role is needed because the aggregate
 * functions are `security definer` and granted to `service_role` alone.
 *
 * tsx transpiles to CommonJS, so __dirname is available and top-level await is
 * not. Everything here is synchronous except the RPC call itself.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  REPORTS_ENV_FILE,
  parseEnvFile,
  readReportsCredentials,
} from "../../lib/reports/reportsEnv";

const REPO_ROOT = join(__dirname, "..", "..");

export function createReportsClient(): SupabaseClient {
  const envPath = join(REPO_ROOT, REPORTS_ENV_FILE);

  let contents: string;
  try {
    contents = readFileSync(envPath, "utf8");
  } catch {
    throw new Error(
      `Could not read ${envPath}. Report collectors need production Supabase ` +
        `credentials there. See lib/reports/reportsEnv.ts for what it must contain.`
    );
  }

  const { url, serviceRoleKey } = readReportsCredentials(parseEnvFile(contents));

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface RpcResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Calls an aggregate RPC and normalises the outcome.
 *
 * Errors are returned rather than thrown so one broken aggregate cannot cost
 * the whole run. The collector decides which failures are fatal: the identity
 * and funnel aggregates are (a Growth report without a funnel is not a Growth
 * report), the rest degrade to a `not read` row plus an entry in the payload's
 * `errors` array, which VANTAGE writes up as a finding.
 */
export async function callRpc<T>(
  client: SupabaseClient,
  name: string,
  args: Record<string, unknown> = {}
): Promise<RpcResult<T>> {
  const { data, error } = await client.rpc(name, args);
  if (error) return { ok: false, data: null, error: `${name}: ${error.message}` };
  return { ok: true, data: data as T, error: null };
}
```

- [ ] **Step 6: Verify the client reaches production**

Run:

```bash
npx tsx -e "import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin'; createReportsClient().from('years').select('id', { count: 'exact', head: true }).then(r => console.log('years count:', r.count, 'error:', r.error?.message ?? 'none'))"
```

Expected: a non-null count and `error: none`. If it throws about a missing variable, `.env.reports.local` is incomplete — fix that before continuing, and do not copy values from `.env.local`.

- [ ] **Step 7: Commit**

```bash
git add lib/reports/reportsEnv.ts lib/reports/reportsEnv.test.ts scripts/reports/supabaseAdmin.ts
git commit -m "feat(reports): add production credentials loader for collectors"
```

---

### Task 5: Identity reconciliation RPC — the first-run priority

**Files:**
- Create: `supabase/migrations/20260808000000_growth_identity_agg.sql`
- Create: `supabase/migrations/20260808000000_growth_identity_agg.test.md`

**Interfaces:**
- Consumes: `auth.users`, `profiles`, `events`, `payments`, `subscriptions`, `waitlist`, `class_members`, `user_feedback`.
- Produces: RPC `growth_identity_agg()` returning a single JSON object with keys `accounts`, `accounts_confirmed`, `profiles`, `devices_entered`, `devices_any_event`, `devices_paid`, `devices_subscribed`, `subscriptions_active`, `payments_with_user_id`, `payments_total`, `waitlist_emails`, `class_member_devices`, `feedback_devices` — every value a `bigint`.

**This settles the user-count question, and it settles it by naming rather than by picking.** `docs/POST-MORTEM.md` records a "total signed-up users" figure roughly an order of magnitude above the row count of `auth.users`. The device-first identity model that predates accounts is the obvious explanation: `lib/device.ts` mints a `crypto.randomUUID()` into `localStorage` on first visit and every analytics event is keyed on it, so a "user" in the pre-accounts era was a browser.

The resolution is not to declare one of the two figures wrong. It is to make it impossible to say "users" without saying which population:

- **Devices reached** = `devices_entered`, distinct `events.device_id` with at least one `enter`. This is the canonical Growth reach number and the one the POST-MORTEM figure most likely was.
- **Accounts** = rows in `auth.users`.

Both rows appear in every report, always, under those labels. The word "users" is banned from VANTAGE's vocabulary (Task 10 enforces it). That is what "one metric, one source, one number" means here — the metric had two meanings, and the fix is to give each its own name and its own row.

`devices_any_event` is included because it will exceed `devices_entered`: a device landing on a shared module URL emits `module_open` without ever emitting `enter`. That gap is the evidence behind the non-monotonic funnel behaviour Task 2 handles, and it is worth watching.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260808000000_growth_identity_agg.sql`:

```sql
-- growth_identity_agg: every population that anyone might call a "user",
-- counted once, in one place, under names that cannot be confused.
--
-- Why this exists. docs/POST-MORTEM.md records a "total signed-up users"
-- figure about an order of magnitude larger than the number of rows in
-- auth.users. The most likely cause is that the earlier figure counted DEVICES
-- under the device-first identity model that predates accounts: lib/device.ts
-- mints a UUID into localStorage on first visit and every analytics event is
-- keyed on it. Rather than decide which figure was "right", this function
-- returns both under unambiguous names so no report can conflate them again.
--
-- Every count is computed in Postgres. None of these can be done from the
-- client: PostgREST caps a select at 1000 rows and `events` is far past that,
-- so a client-side count(distinct) would silently truncate.
create or replace function growth_identity_agg()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    -- ACCOUNTS. A row in auth.users. Never call this "users" in a report.
    'accounts',              (select count(*) from auth.users),
    'accounts_confirmed',    (select count(*) from auth.users
                                where email_confirmed_at is not null),
    'profiles',              (select count(*) from profiles),

    -- REACH. A device is one browser that stored a device_id in localStorage.
    -- devices_entered is the canonical Growth reach number.
    'devices_entered',       (select count(distinct device_id) from events
                                where event_type = 'enter'),
    -- Will exceed devices_entered: a device arriving on a shared module link
    -- emits module_open without ever emitting enter. The gap is the deep-link
    -- population, and it is why the funnel is not guaranteed monotonic.
    'devices_any_event',     (select count(distinct device_id) from events),

    -- MONEY. Distinct devices in the ledger and in the entitlement table.
    'devices_paid',          (select count(distinct device_id) from payments),
    'devices_subscribed',    (select count(distinct device_id) from subscriptions),
    'subscriptions_active',  (select count(*) from subscriptions
                                where status = 'active'
                                  and current_period_end > now()),

    -- THE BRIDGE between the two identity models. A low ratio here means the
    -- device-first population never became accounts, which is the fact that
    -- makes the two headline numbers differ.
    'payments_with_user_id', (select count(*) from payments where user_id is not null),
    'payments_total',        (select count(*) from payments),

    -- OTHER POPULATIONS that get loosely called "users" in conversation.
    'waitlist_emails',       (select count(distinct lower(email)) from waitlist),
    'class_member_devices',  (select count(distinct device_id) from class_members),
    'feedback_devices',      (select count(distinct device_id) from user_feedback)
  );
$$;

revoke execute on function growth_identity_agg() from public, anon, authenticated;
grant execute on function growth_identity_agg() to service_role;
```

- [ ] **Step 2: Apply the migration to the live project**

Apply through the Supabase dashboard SQL editor (this repo has no `supabase db push` workflow wired up — every existing `admin_*` aggregate was applied by hand, as the "Applied to live" comment in `20260706000001_admin_profiles_agg.sql` records).

- [ ] **Step 3: Verify it returns and that `auth.users` is reachable**

Run:

```bash
npx tsx -e "import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin'; callRpc(createReportsClient(), 'growth_identity_agg').then(r => console.log(JSON.stringify(r, null, 2)))"
```

Expected: `ok: true` and a JSON object with all thirteen keys, each a number.

**If this errors on `auth.users`,** the function owner cannot read the auth schema. `security definer` runs as the function's owner; a function created through the dashboard SQL editor is owned by `postgres`, which can. If it was created by another role, re-create it while connected as `postgres`. Record whichever was true in the verification doc — do not guess.

**Do not paste the returned figures anywhere tracked.** Read them, confirm the shape, and let them live only in `docs/reports/growth/.data/`.

- [ ] **Step 4: Write the verification doc**

Create `supabase/migrations/20260808000000_growth_identity_agg.test.md`, following the shape of `20260716000000_classes.test.md`. It must record:

- The date applied and the role that created the function.
- That `select growth_identity_agg()` returns a single row of JSON with all thirteen keys present and numeric.
- That `auth.users` was readable from inside the function, and which role owns it.
- That `revoke ... from anon, authenticated` took effect — verify by calling the RPC with the publishable key and confirming it is rejected:

```bash
npx tsx -e "
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parseEnvFile } from './lib/reports/reportsEnv';
const v = parseEnvFile(readFileSync('.env.reports.local','utf8'));
createClient(v.NEXT_PUBLIC_SUPABASE_URL, v.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  .rpc('growth_identity_agg')
  .then(r => console.log('anon call error:', r.error?.message ?? 'NONE — THIS IS A PROBLEM'));
"
```

Expected: an error. `NONE` means the revoke did not apply and the identity counts are readable by anyone holding the public key — fix before continuing.

- **Whether the two headline populations differ, and by roughly what factor** — described, never quoted. The actual figures belong in the report, not in a tracked migration doc.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260808000000_growth_identity_agg.sql \
        supabase/migrations/20260808000000_growth_identity_agg.test.md
git commit -m "feat(growth): add identity reconciliation aggregate"
```

---

### Task 6: Funnel and conversion RPC

**Files:**
- Create: `supabase/migrations/20260808000001_growth_funnel_agg.sql`
- Create: `supabase/migrations/20260808000001_growth_funnel_agg.test.md`

**Interfaces:**
- Consumes: `events`, `payments`, `subscriptions`.
- Produces: RPC `growth_funnel_agg(p_since timestamptz, p_until timestamptz)` returning JSON with `since`, `until`, `steps`, `ledger`, `entitlements`, `dead_events`. `steps` carries `enter`, `year_select`, `subject_open`, `subject_open_any`, `module_open`, `paywall_teaser_view`, `paywall_teaser_click`, `subscribe_click`, `any_event`. `ledger` carries `paid` and `paid_after_subscribe_click`. `dead_events` carries `unlock_click_rows`, `unlock_submitted_rows`, `dead_last_seen`.

Three things in this function are decisions, not details:

**`subject_open` is counted twice, deliberately.** The event fires on two different pages. `app/(main)/year/[yearId]/subjects/page.tsx:81` renders `<PageTracker event="subject_open" yearId={yearId} />` — the subject *list*, with no `subject_id`. `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx:70` renders it *with* `subjectId` — an actual subject being opened. The funnel step means the second, so `subject_open` filters on `subject_id is not null`; `subject_open_any` keeps the unfiltered count so the gap between them stays visible. That gap is a live defect in the admin dashboard, which counts all of them and therefore inflates the step.

**Completion is the ledger, joined on device.** There is no completion event on the live path — `unlock_submitted` was that step and the pivot never replaced it. `paid` is distinct devices with a `payments` row in the window. `paid_after_subscribe_click` narrows that to devices that also emitted `subscribe_click` in the same window, which is the honest step-to-step conversion. The difference between the two is its own signal: class-rep block sales, returning payers, and anyone whose `subscribe_click` beacon never landed.

**Dead-event counts are all-time, not windowed.** The claim being evidenced is "no code has emitted these since the pivot", and only an all-time count with a last-seen timestamp can support that. A windowed zero proves nothing.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260808000001_growth_funnel_agg.sql`:

```sql
-- Supports the windowed event scans below. The table already has
-- idx_events_created (created_at desc) and idx_events_device, but every query
-- in this file filters on event_type inside a time window, which wants both
-- columns in one index. At this table size the build is sub-second and the
-- write lock is not worth working around.
create index if not exists events_type_created_idx
  on public.events (event_type, created_at desc);

-- growth_funnel_agg: distinct-device counts for each step of the LIVE funnel
-- inside a window, plus completion from the payments ledger.
--
-- The live path is:
--   enter -> year_select -> subject_open -> module_open
--         -> paywall_teaser_view -> paywall_teaser_click -> subscribe_click
--         -> paid (ledger)
--
-- There is NO completion event. `unlock_submitted` was the "they paid" step
-- before the subscription pivot and nothing replaced it. The ledger is the
-- better source anyway: a payments row is written by a signature-verified
-- webhook, while a client beacon is lost whenever a user bounces to GCash and
-- never returns.
--
-- Windows are half-open [p_since, p_until) so consecutive weeks abut exactly
-- and no event is counted in two of them.
create or replace function growth_funnel_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select device_id, event_type, subject_id
    from events
    where created_at >= p_since
      and created_at <  p_until
  ),
  steps as (
    select
      count(distinct device_id) filter (where event_type = 'enter')                as enter,
      count(distinct device_id) filter (where event_type = 'year_select')          as year_select,
      -- subject_open fires on TWO pages. The subject LIST page emits it with
      -- year_id only (app/(main)/year/[yearId]/subjects/page.tsx); the modules
      -- page emits it WITH subject_id, which is the real "opened a subject".
      -- The funnel step means the latter.
      count(distinct device_id) filter (where event_type = 'subject_open'
                                          and subject_id is not null)              as subject_open,
      -- Unfiltered, so the inflation caused by the list page stays visible.
      count(distinct device_id) filter (where event_type = 'subject_open')         as subject_open_any,
      count(distinct device_id) filter (where event_type = 'module_open')          as module_open,
      count(distinct device_id) filter (where event_type = 'paywall_teaser_view')  as paywall_teaser_view,
      count(distinct device_id) filter (where event_type = 'paywall_teaser_click') as paywall_teaser_click,
      count(distinct device_id) filter (where event_type = 'subscribe_click')      as subscribe_click,
      -- Every device that did anything. Exceeds `enter` by the deep-link
      -- population, which is why the funnel is not guaranteed monotonic.
      count(distinct device_id)                                                    as any_event
    from windowed
  ),
  checkout_devices as (
    select distinct device_id
    from windowed
    where event_type = 'subscribe_click'
  ),
  ledger as (
    select
      count(distinct p.device_id)                                        as paid,
      count(distinct p.device_id) filter (where c.device_id is not null)  as paid_after_subscribe_click
    from payments p
    left join checkout_devices c on c.device_id = p.device_id
    where p.paid_at >= p_since
      and p.paid_at <  p_until
  ),
  entitlements as (
    -- Handed across to Finance: a subscription created in the window without a
    -- matching payment is either comped access or a webhook granting
    -- entitlement without recording money.
    select count(distinct device_id) as subscriptions_created
    from subscriptions
    where created_at >= p_since
      and created_at <  p_until
  ),
  dead as (
    -- DELIBERATELY NOT WINDOWED. The claim is "no code has emitted these since
    -- the pivot", and only an all-time count plus a last-seen timestamp can
    -- evidence that. A windowed zero proves nothing.
    select
      count(*) filter (where event_type = 'unlock_click')     as unlock_click_rows,
      count(*) filter (where event_type = 'unlock_submitted') as unlock_submitted_rows,
      max(created_at) filter (
        where event_type in ('unlock_click', 'unlock_submitted')
      ) as dead_last_seen
    from events
  )
  select json_build_object(
    'since',        p_since,
    'until',        p_until,
    'steps',        (select row_to_json(s) from steps s),
    'ledger',       (select row_to_json(l) from ledger l),
    'entitlements', (select row_to_json(e) from entitlements e),
    'dead_events',  (select row_to_json(d) from dead d)
  );
$$;

revoke execute on function growth_funnel_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_funnel_agg(timestamptz, timestamptz) to service_role;
```

- [ ] **Step 2: Apply the migration to the live project**

Apply through the Supabase dashboard SQL editor, as in Task 5.

- [ ] **Step 3: Verify against a real window**

Run:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [current] = phWeekWindows(new Date(), 1);
callRpc(createReportsClient(), 'growth_funnel_agg', { p_since: current.sinceIso, p_until: current.untilIso })
  .then(r => console.log(current.label, JSON.stringify(r, null, 2)));
"
```

Expected: `ok: true`, all four sub-objects present, every step a number.

Confirm three things by eye and record them in the verification doc, **describing rather than quoting**:

1. `steps.subject_open_any` is greater than `steps.subject_open`. If they are equal, the subject-list page is not emitting what the source says it emits — investigate before trusting the funnel.
2. `dead_events.unlock_click_rows` and `unlock_submitted_rows` are non-zero all-time but `dead_last_seen` predates the subscription pivot. That is the evidence that closes the dead-event finding.
3. `steps.any_event` is at least `steps.enter`.

- [ ] **Step 4: Verify the window is half-open**

Run the query for two consecutive weeks and confirm `previous.untilIso === current.sinceIso` (Task 1 already tests this) and that the two windows' `since`/`until` values echo back unchanged in the JSON. An event on the boundary instant must land in exactly one of them.

- [ ] **Step 5: Write the verification doc**

Create `supabase/migrations/20260808000001_growth_funnel_agg.test.md` recording: the date applied, the anon-call rejection check from Task 5 Step 4 repeated for this function, the three observations above (described, not quoted), and the `explain analyze` timing of one windowed call before and after `events_type_created_idx` exists.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260808000001_growth_funnel_agg.sql \
        supabase/migrations/20260808000001_growth_funnel_agg.test.md
git commit -m "feat(growth): add windowed funnel and ledger conversion aggregate"
```

---

### Task 7: Acquisition and segmentation RPC

**Files:**
- Create: `supabase/migrations/20260808000002_growth_audience_agg.sql`
- Create: `supabase/migrations/20260808000002_growth_audience_agg.test.md`

**Interfaces:**
- Consumes: `events`, `payments`, `years`, `subjects`.
- Produces: RPC `growth_acquisition_agg(p_since timestamptz, p_until timestamptz)` returning JSON with `enters`, `devices`, `no_referrer`, `by_referrer_host`, `by_utm_source`, `by_utm_campaign`; RPC `growth_segment_agg(p_since timestamptz, p_until timestamptz)` returning JSON with `by_year` and `by_subject`.

Attribution lives on `enter` events only — `lib/analytics.ts` calls `getAttribution()` for that event type and no other, capturing `document.referrer` plus any `utm_*` on the URL. The referrer is stored as a full URL, so the aggregate reduces it to a host: fifty distinct TikTok deep links are one source, not fifty.

The **no-referrer share** is the headline here. It is the dark-social signal: links moving through group chats rather than search, which is what the spec means when it says Marketing is out of scope until TikTok analytics can be fed in.

**Segmentation has a hard ceiling that must be stated rather than worked around.** Year and subject segmentation work, because `events` carries `year_id` and `subject_id`. University and device-type segmentation do not:

- `profiles.university` is per-**account**, and accounts are the small population. It cannot be crossed with a device-keyed funnel. The existing `admin_profiles_agg()` already reports university distribution across accounts, so this plan reuses it rather than building a second version.
- `lib/deviceType.ts` is called in exactly one place — `app/api/waitlist/route.ts:95` — and its output is stored only on `waitlist.device_type`. `events` has no device-type column. Device-type segmentation is therefore available for waitlist signups only, and is reported there (Task 8) rather than pretended at across the funnel.

Both limits are recorded in "Deferred from this plan".

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260808000002_growth_audience_agg.sql`:

```sql
-- growth_acquisition_agg: where visitors came from, in a window.
--
-- Attribution is captured on `enter` events only — see getAttribution() in
-- lib/analytics.ts, which runs for that event type and no other. Values are
-- sanitized and length-capped by app/api/events/route.ts before insert.
--
-- Referrers are stored as full URLs, so they are reduced to a host here.
-- Fifty distinct deep links from one platform are one source, not fifty.
create or replace function growth_acquisition_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with enters as (
    select device_id, referrer, utm_source, utm_medium, utm_campaign
    from events
    where event_type = 'enter'
      and created_at >= p_since
      and created_at <  p_until
  )
  select json_build_object(
    'enters',  (select count(*) from enters),
    'devices', (select count(distinct device_id) from enters),
    -- The dark-social signal: links arriving through group chats rather than
    -- search or a linked profile.
    'no_referrer', (select count(*) from enters
                      where referrer is null or referrer = ''),
    'by_referrer_host', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(
            nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''),
            '(none)'
          ) as host,
          count(*)::int as count
        from enters
        group by 1
        order by count desc
        limit 15
      ) t
    ),
    'by_utm_source', (
      select json_agg(row_to_json(t))
      from (
        select
          coalesce(utm_source, '(none)') as utm_source,
          coalesce(utm_medium, '(none)') as utm_medium,
          count(*)::int as count
        from enters
        group by 1, 2
        order by count desc
        limit 15
      ) t
    ),
    'by_utm_campaign', (
      select json_agg(row_to_json(t))
      from (
        select utm_campaign, count(*)::int as count
        from enters
        where utm_campaign is not null
        group by utm_campaign
        order by count desc
        limit 15
      ) t
    )
  );
$$;

-- growth_segment_agg: engagement and conversion split by year and by subject.
--
-- A blended average across a first-year-dominated audience hides everything
-- interesting, which is the whole reason this function exists.
--
-- University and device type are deliberately absent. profiles.university is
-- per-ACCOUNT, and accounts are a far smaller population than devices, so it
-- cannot be crossed with a device-keyed funnel — admin_profiles_agg() already
-- reports that distribution. lib/deviceType.ts is called only by
-- app/api/waitlist/route.ts and its output lands only on waitlist.device_type;
-- `events` has no device-type column at all.
create or replace function growth_segment_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select device_id, event_type, year_id, subject_id
    from events
    where created_at >= p_since
      and created_at <  p_until
  ),
  paid_devices as (
    select distinct device_id, year_id, subject_id
    from payments
    where paid_at >= p_since
      and paid_at <  p_until
  )
  select json_build_object(
    'by_year', (
      select json_agg(row_to_json(t))
      from (
        select
          y.label as year_label,
          count(distinct w.device_id) filter (
            where w.event_type = 'module_open')::int          as module_open_devices,
          count(distinct w.device_id) filter (
            where w.event_type = 'paywall_teaser_view')::int  as paywall_devices,
          (select count(distinct pd.device_id)
             from paid_devices pd where pd.year_id = y.id)::int as paid_devices
        from years y
        left join windowed w on w.year_id = y.id
        group by y.id, y.label, y.sort_order
        order by y.sort_order
      ) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (
        select
          s.title as subject_title,
          y.label as year_label,
          count(distinct w.device_id) filter (
            where w.event_type = 'module_open')::int          as module_open_devices,
          count(distinct w.device_id) filter (
            where w.event_type = 'paywall_teaser_view')::int  as paywall_devices,
          (select count(distinct pd.device_id)
             from paid_devices pd where pd.subject_id = s.id)::int as paid_devices
        from subjects s
        join years y on y.id = s.year_id
        left join windowed w on w.subject_id = s.id
        group by s.id, s.title, y.label
        having count(w.device_id) > 0
        order by module_open_devices desc
        limit 25
      ) t
    )
  );
$$;

revoke execute on function growth_acquisition_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_acquisition_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_segment_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_segment_agg(timestamptz, timestamptz) to service_role;
```

- [ ] **Step 2: Apply the migration to the live project**

Apply through the Supabase dashboard SQL editor.

- [ ] **Step 3: Verify both functions**

Run:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [w] = phWeekWindows(new Date(), 1);
const c = createReportsClient();
const args = { p_since: w.sinceIso, p_until: w.untilIso };
Promise.all([
  callRpc(c, 'growth_acquisition_agg', args),
  callRpc(c, 'growth_segment_agg', args),
]).then(([a, s]) => console.log('acq ok', a.ok, a.error, '| seg ok', s.ok, s.error));
"
```

Expected: `acq ok true null | seg ok true null`.

- [ ] **Step 4: Verify the referrer host extraction**

Run the acquisition RPC and inspect `by_referrer_host`. Every entry must be a bare hostname or `(none)` — no scheme, no path, no query string. A row still containing `https://` or a `/` means `split_part` did not match the stored format; fix the extraction before the agent starts reading it as a source name.

- [ ] **Step 5: Write the verification doc**

Create `supabase/migrations/20260808000002_growth_audience_agg.test.md` recording: the date applied, the anon-rejection check for both functions, the referrer-host format check above, and confirmation that `by_year` returns a row for every year including ones with no activity (a `left join` from `years`, so a quiet year shows zeroes rather than vanishing — a disappearing row would break the "identical row set every run" rule).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260808000002_growth_audience_agg.sql \
        supabase/migrations/20260808000002_growth_audience_agg.test.md
git commit -m "feat(growth): add acquisition and segmentation aggregates"
```

---

### Task 8: Retention, content fit, demand and voice RPC

**Files:**
- Create: `supabase/migrations/20260808000003_growth_retention_agg.sql`
- Create: `supabase/migrations/20260808000003_growth_retention_agg.test.md`

**Interfaces:**
- Consumes: `events`, `module_progress`, `modules`, `subjects`, `waitlist`, `user_feedback`.
- Produces: RPC `growth_cohort_agg(p_weeks int default 8)` returning JSON with `weekly_active` and `cohorts`; RPC `growth_content_agg(p_since, p_until, p_limit int default 20)` returning a JSON array of module rows; RPC `growth_demand_agg(p_since, p_until)` returning JSON with waitlist breakdowns; RPC `growth_feedback_agg(p_since, p_until, p_limit int default 40)` returning JSON with counts, averages and recent verbatim text.

Four sub-functions land together because they share one property: each is a *secondary* read whose failure should degrade a section of the report rather than kill the run.

**`weekly_active` is the seasonality substitute.** Until `TERM_CALENDAR` is populated (Task 3), an eight-week trailing series of active devices per PH week is the only honest way to tell "engagement dropped" from "this is a normal quiet week". It is data, not a guess.

**Two type mismatches must be handled, not discovered at runtime:**

- `module_progress.module_id` is `text`; `modules.id` and `events.module_id` are `uuid`. The join casts the **uuid side to text** (`m.id::text`). Casting the text side to uuid would throw on the first non-uuid row that ever got written, taking the whole report down for one bad record.
- `user_feedback.device_id` is `uuid`; `events.device_id` and `payments.device_id` are `text`. This function does not join them, but any future work that does must cast, and the comment says so.

**`growth_feedback_agg` returns users' own words.** That is the point — it is the only qualitative input any department gets. It is safe only because `docs/reports/` is gitignored in full. The function returns text, ratings, and module title, and never returns `coupon_code`, `device_id`, or `user_id`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260808000003_growth_retention_agg.sql`:

```sql
-- growth_cohort_agg: weekly device cohorts, return rates, and the trailing
-- weekly-active series.
--
-- Weeks are PH calendar weeks. `created_at at time zone 'Asia/Manila'`
-- converts the timestamptz to Manila wall-clock before truncation, so a week
-- boundary lands at Monday 00:00 in Manila rather than in UTC. Getting this
-- wrong shifts every bucket by eight hours and quietly moves activity between
-- weeks.
--
-- weekly_active exists because visits cluster around exam dates. Until the
-- term calendar in lib/reports/academicCalendar.ts is populated, this trailing
-- series is the only evidence-based way to tell a real engagement drop from a
-- normal quiet week.
create or replace function growth_cohort_agg(p_weeks int default 8)
returns json
language sql
security definer
set search_path = public
as $$
  with first_seen as (
    select
      device_id,
      date_trunc('week', min(created_at) at time zone 'Asia/Manila')::date as cohort_week
    from events
    group by device_id
  ),
  activity as (
    select distinct
      device_id,
      date_trunc('week', created_at at time zone 'Asia/Manila')::date as active_week
    from events
    where created_at >= now() - make_interval(weeks => p_weeks + 2)
  ),
  weekly as (
    select active_week, count(*)::int as active_devices
    from activity
    group by active_week
    order by active_week desc
  ),
  cohorts as (
    select
      f.cohort_week,
      count(distinct f.device_id)::int as size,
      -- Integer arithmetic on a date adds days in Postgres, so +7 is "the
      -- following week's bucket".
      count(distinct a.device_id) filter (
        where a.active_week = f.cohort_week + 7)::int  as returned_week_1,
      count(distinct a.device_id) filter (
        where a.active_week = f.cohort_week + 14)::int as returned_week_2
    from first_seen f
    left join activity a on a.device_id = f.device_id
    where f.cohort_week >=
      date_trunc('week', (now() at time zone 'Asia/Manila'))::date - (p_weeks * 7)
    group by f.cohort_week
    order by f.cohort_week desc
  )
  select json_build_object(
    'weekly_active', (select json_agg(row_to_json(w)) from weekly w),
    'cohorts',       (select json_agg(row_to_json(c)) from cohorts c)
  );
$$;

-- growth_content_agg: which modules get opened versus finished.
--
-- High opens with low completion is a content problem wearing an engagement
-- costume, and it is the input to "what should I build next".
create or replace function growth_content_agg(
  p_since timestamptz,
  p_until timestamptz,
  p_limit int default 20
)
returns json
language sql
security definer
set search_path = public
as $$
  with opens as (
    select module_id, count(distinct device_id)::int as open_devices
    from events
    where event_type = 'module_open'
      and module_id is not null
      and created_at >= p_since
      and created_at <  p_until
    group by module_id
  ),
  completions as (
    select module_id, count(distinct device_id)::int as completed_devices
    from module_progress
    where completed_at >= p_since
      and completed_at <  p_until
    group by module_id
  )
  select json_agg(row_to_json(t))
  from (
    select
      m.title as module_title,
      s.title as subject_title,
      o.open_devices,
      coalesce(c.completed_devices, 0) as completed_devices
    from opens o
    join modules  m on m.id = o.module_id
    join subjects s on s.id = m.subject_id
    -- module_progress.module_id is TEXT while modules.id is UUID. Cast the
    -- UUID side to text: casting the text side to uuid would raise on the
    -- first non-uuid row ever written and take the whole report down for one
    -- bad record.
    left join completions c on c.module_id = m.id::text
    order by o.open_devices desc
    limit p_limit
  ) t;
$$;

-- growth_demand_agg: what people ask for that does not exist yet.
--
-- The waitlist is the demand-sensing surface — ComingSoonModal and the paywall
-- both write into it (see the `source` check constraint). device_type is here
-- and nowhere else: lib/deviceType.ts is called only by
-- app/api/waitlist/route.ts, so this is the ONLY device-type segmentation the
-- product can produce.
create or replace function growth_demand_agg(
  p_since timestamptz,
  p_until timestamptz
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select * from waitlist
    where created_at >= p_since and created_at < p_until
  )
  select json_build_object(
    'signups_window',   (select count(*) from windowed),
    'signups_all_time', (select count(*) from waitlist),
    'by_source', (
      select json_agg(row_to_json(t))
      from (select source, count(*)::int as count
              from windowed group by source order by count desc) t
    ),
    'by_year', (
      select json_agg(row_to_json(t))
      from (select coalesce(year_label, 'Unknown') as year_label, count(*)::int as count
              from windowed group by 1 order by count desc) t
    ),
    'by_subject', (
      select json_agg(row_to_json(t))
      from (select subject_title, coalesce(year_label, '') as year_label, count(*)::int as count
              from windowed where subject_title is not null
              group by subject_title, year_label order by count desc limit 20) t
    ),
    'willing_to_pay', (
      select json_agg(row_to_json(t))
      from (select coalesce(willing_to_pay, 'unanswered') as answer, count(*)::int as count
              from windowed group by 1 order by count desc) t
    ),
    'by_device_type', (
      select json_agg(row_to_json(t))
      from (select device_type, count(*)::int as count
              from windowed group by device_type order by count desc) t
    )
  );
$$;

-- growth_feedback_agg: the only department input written in users' own words.
--
-- Returns verbatim text on purpose — themes, not counts, are what this is for.
-- Safe only because docs/reports/ is gitignored in full and the repo is public.
-- Deliberately returns NO device_id, user_id, or coupon_code: the report needs
-- what was said, never who said it.
--
-- Note for future work: user_feedback.device_id is UUID while events.device_id
-- and payments.device_id are TEXT. Any join across them needs an explicit cast.
create or replace function growth_feedback_agg(
  p_since timestamptz,
  p_until timestamptz,
  p_limit int default 40
)
returns json
language sql
security definer
set search_path = public
as $$
  with windowed as (
    select * from user_feedback
    where created_at >= p_since and created_at < p_until
  )
  select json_build_object(
    'rows_window',       (select count(*) from windowed),
    'rows_all_time',     (select count(*) from user_feedback),
    'avg_app_rating',    (select round(avg(app_rating), 2) from windowed),
    'avg_module_rating', (select round(avg(module_rating), 2) from windowed),
    'recent', (
      select json_agg(row_to_json(t))
      from (
        select
          w.created_at,
          w.app_rating,
          w.module_rating,
          w.feedback_text,
          m.title as module_title
        from windowed w
        left join modules m on m.id = w.module_id
        where coalesce(w.feedback_text, '') <> ''
        order by w.created_at desc
        limit p_limit
      ) t
    )
  );
$$;

revoke execute on function growth_cohort_agg(int) from public, anon, authenticated;
grant execute on function growth_cohort_agg(int) to service_role;

revoke execute on function growth_content_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_content_agg(timestamptz, timestamptz, int) to service_role;

revoke execute on function growth_demand_agg(timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function growth_demand_agg(timestamptz, timestamptz) to service_role;

revoke execute on function growth_feedback_agg(timestamptz, timestamptz, int)
  from public, anon, authenticated;
grant execute on function growth_feedback_agg(timestamptz, timestamptz, int) to service_role;
```

- [ ] **Step 2: Apply the migration to the live project**

Apply through the Supabase dashboard SQL editor.

**If `growth_demand_agg` fails on `year_label` or `subject_title`,** stop and read the note in "What could not be verified" below — those columns exist in the live `waitlist` table and are written by `app/api/waitlist/route.ts:111-112`, but **no migration in this repo adds them**. Confirm they exist live before assuming the function is wrong.

- [ ] **Step 3: Verify all four functions**

Run:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
import { phWeekWindows } from './lib/reports/phWeek';
const [w] = phWeekWindows(new Date(), 1);
const c = createReportsClient();
const args = { p_since: w.sinceIso, p_until: w.untilIso };
Promise.all([
  callRpc(c, 'growth_cohort_agg', { p_weeks: 8 }),
  callRpc(c, 'growth_content_agg', args),
  callRpc(c, 'growth_demand_agg', args),
  callRpc(c, 'growth_feedback_agg', args),
]).then(rs => rs.forEach((r, i) => console.log(i, r.ok, r.error ?? '')));
"
```

Expected: four lines, each `true` with no error.

- [ ] **Step 4: Verify the PH week boundary**

In `growth_cohort_agg`'s `weekly_active`, confirm every `active_week` is a Monday. Run:

```sql
select date_trunc('week', now() at time zone 'Asia/Manila')::date as ph_week_start,
       extract(isodow from date_trunc('week', now() at time zone 'Asia/Manila')) as dow;
```

Expected: `dow` = 1. If the buckets look shifted by a day, the `at time zone` conversion is missing somewhere.

- [ ] **Step 5: Write the verification doc**

Create `supabase/migrations/20260808000003_growth_retention_agg.test.md` recording: the date applied, the anon-rejection check for all four functions, the Monday-boundary check, confirmation that `growth_content_agg` returns rows (proving the `m.id::text` join actually matches), and confirmation that `growth_feedback_agg`'s `recent` array contains no `device_id`, `user_id`, or `coupon_code` key.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260808000003_growth_retention_agg.sql \
        supabase/migrations/20260808000003_growth_retention_agg.test.md
git commit -m "feat(growth): add retention, content, demand and feedback aggregates"
```

---

### Task 9: The Growth collector

**Files:**
- Create: `scripts/reports/growth.ts`
- Modify: `package.json` — add the `report:growth` script

**Interfaces:**
- Consumes: `phWeekWindows`, `phDate` from `lib/reports/phWeek.ts`; `buildFunnel`, `largestLeak`, `funnelMetrics`, `pct` from `lib/reports/funnel.ts`; `phaseForRange` from `lib/reports/academicCalendar.ts`; `diffMetrics`, `renderMetricsTable`, `Metric` from `lib/reports/metrics.ts`; `archiveExistingRun` from `lib/reports/runArchive.ts`; `createReportsClient`, `callRpc` from `scripts/reports/supabaseAdmin.ts`.
- Produces: `docs/reports/growth/.data/<YYYY-MM-DD>.json` shaped as `{ collectedAt, collectMs, window: { current, previous }, termPhase, metrics, previousDate, tables: { funnel, audience }, funnel, leak, raw, errors }`.

The collector mirrors `scripts/reports/ops.ts` exactly where it can, so anyone who has read one has read both: same previous-run lookup, same `archiveExistingRun` call, same Manila-dated filename, same "collector renders the table so the agent never touches a number" contract.

Two departures, both forced by the subject matter:

**Two tables, not one.** `FUNNEL` carries the step rows and the leak; `AUDIENCE` carries identity, acquisition, demand and feedback. Both are rendered with the same tested `renderMetricsTable`, and `metrics` stores their concatenation so the next run's diff works across the whole set from one array.

**Fatal versus degradable failures.** `growth_identity_agg` and `growth_funnel_agg` are fatal — a Growth report without an identity reconciliation or a funnel is not a Growth report, and writing a file full of `not read` would be worse than writing nothing. Everything else records its error in `errors[]`, leaves its rows `null`, and lets the run continue. VANTAGE reports the `errors[]` entries as findings.

- [ ] **Step 1: Write the collector**

Create `scripts/reports/growth.ts`:

```typescript
/**
 * Growth collector.
 *
 * Deterministic. Calls Postgres aggregate functions over RPC and writes JSON
 * for VANTAGE to interpret. No model involved, so running this costs nothing
 * and it can be re-run freely while debugging.
 *
 * Everything is aggregated in Postgres, never here. Supabase caps a select at
 * 1000 rows and `events` is far past that, so a client-side count(distinct)
 * would silently truncate and report a confidently wrong funnel.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not —
 * hence main().then().
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  diffMetrics,
  renderMetricsTable,
  type Metric,
} from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { phDate, phWeekWindows, type PhWindow } from "../../lib/reports/phWeek";
import {
  buildFunnel,
  funnelMetrics,
  largestLeak,
  pct,
  type FunnelCounts,
} from "../../lib/reports/funnel";
import { phaseForRange } from "../../lib/reports/academicCalendar";
import { callRpc, createReportsClient } from "./supabaseAdmin";

const REPO_ROOT = join(__dirname, "..", "..");
const COHORT_WEEKS = 8;

interface IdentityAgg {
  accounts: number;
  accounts_confirmed: number;
  profiles: number;
  devices_entered: number;
  devices_any_event: number;
  devices_paid: number;
  devices_subscribed: number;
  subscriptions_active: number;
  payments_with_user_id: number;
  payments_total: number;
  waitlist_emails: number;
  class_member_devices: number;
  feedback_devices: number;
}

interface FunnelAgg {
  since: string;
  until: string;
  steps: FunnelCounts & { subject_open_any: number; any_event: number };
  ledger: { paid: number; paid_after_subscribe_click: number };
  entitlements: { subscriptions_created: number };
  dead_events: {
    unlock_click_rows: number;
    unlock_submitted_rows: number;
    dead_last_seen: string | null;
  };
}

interface AcquisitionAgg {
  enters: number;
  devices: number;
  no_referrer: number;
  by_referrer_host: { host: string; count: number }[] | null;
  by_utm_source: { utm_source: string; utm_medium: string; count: number }[] | null;
  by_utm_campaign: { utm_campaign: string; count: number }[] | null;
}

interface DemandAgg {
  signups_window: number;
  signups_all_time: number;
  [key: string]: unknown;
}

interface FeedbackAgg {
  rows_window: number;
  rows_all_time: number;
  avg_app_rating: number | null;
  avg_module_rating: number | null;
  recent: unknown[] | null;
}

interface CollectorError {
  rpc: string;
  message: string;
}

/**
 * Finds the most recent prior run and its metrics. Identical in behaviour to
 * the Ops collector's version: any failure degrades to a baseline run rather
 * than crashing. A previous run is a nice-to-have, never a hard dependency.
 */
function readPreviousRun(
  outDir: string,
  todayFilename: string
): { date: string; metrics: Metric[] } | null {
  let files: string[];
  try {
    files = readdirSync(outDir).filter((name) => name.endsWith(".json"));
  } catch {
    return null;
  }

  const previousFile = files.filter((name) => name < todayFilename).sort().at(-1);
  if (!previousFile) return null;

  try {
    const parsed = JSON.parse(
      readFileSync(join(outDir, previousFile), "utf8")
    ) as { metrics?: unknown };
    if (!Array.isArray(parsed.metrics)) return null;
    return {
      date: previousFile.replace(/\.json$/, ""),
      metrics: parsed.metrics as Metric[],
    };
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const started = Date.now();
  const client = createReportsClient();
  const errors: CollectorError[] = [];

  const [current, previous] = phWeekWindows(new Date(), 2) as [PhWindow, PhWindow];
  const windowArgs = { p_since: current.sinceIso, p_until: current.untilIso };

  // --- Fatal reads. A Growth report without these is not a Growth report. ---
  const identityResult = await callRpc<IdentityAgg>(client, "growth_identity_agg");
  if (!identityResult.ok || !identityResult.data) {
    throw new Error(
      `growth_identity_agg failed: ${identityResult.error}. The identity ` +
        `reconciliation is the first-run priority; every other Growth number is ` +
        `untrustworthy without it. Refusing to write a report.`
    );
  }
  const identity = identityResult.data;

  const funnelResult = await callRpc<FunnelAgg>(client, "growth_funnel_agg", windowArgs);
  if (!funnelResult.ok || !funnelResult.data) {
    throw new Error(`growth_funnel_agg failed: ${funnelResult.error}. Refusing to write a report.`);
  }
  const funnelAgg = funnelResult.data;

  // --- Degradable reads. A failure here costs a section, not the run. ---
  async function optional<T>(name: string, args: Record<string, unknown> = {}): Promise<T | null> {
    const result = await callRpc<T>(client, name, args);
    if (!result.ok) {
      errors.push({ rpc: name, message: result.error ?? "unknown error" });
      return null;
    }
    return result.data;
  }

  const acquisition = await optional<AcquisitionAgg>("growth_acquisition_agg", windowArgs);
  const segments = await optional<unknown>("growth_segment_agg", windowArgs);
  const cohorts = await optional<unknown>("growth_cohort_agg", { p_weeks: COHORT_WEEKS });
  const content = await optional<unknown>("growth_content_agg", windowArgs);
  const demand = await optional<DemandAgg>("growth_demand_agg", windowArgs);
  const feedback = await optional<FeedbackAgg>("growth_feedback_agg", windowArgs);

  // --- Shape the funnel ---
  const steps = buildFunnel({
    ...funnelAgg.steps,
    paid: funnelAgg.ledger.paid,
  });
  const leak = largestLeak(steps);

  const funnelRows: Metric[] = [
    ...funnelMetrics(steps, leak),
    {
      label: "Paid without checkout click",
      value: funnelAgg.ledger.paid - funnelAgg.ledger.paid_after_subscribe_click,
    },
    { label: "Subscriptions created", value: funnelAgg.entitlements.subscriptions_created },
    // Not the funnel step: this counts every subject_open including the ones
    // the subject LIST page emits without a subject_id. The gap against row 3
    // is the inflation the admin dashboard currently shows.
    { label: "subject_open (unfiltered)", value: funnelAgg.steps.subject_open_any },
  ];

  const audienceRows: Metric[] = [
    // Identity. Two populations, two names, never merged into "users".
    { label: "Devices reached (all-time)", value: identity.devices_entered },
    { label: "Devices any event (all-time)", value: identity.devices_any_event },
    { label: "Accounts (auth)", value: identity.accounts },
    { label: "Accounts confirmed", value: identity.accounts_confirmed },
    { label: "Profiles", value: identity.profiles },
    { label: "Devices paid (all-time)", value: identity.devices_paid },
    { label: "Subscriptions active", value: identity.subscriptions_active },
    // Acquisition.
    { label: "Enters this week", value: acquisition?.enters ?? null },
    {
      label: "No-referrer share",
      value: acquisition ? pct(acquisition.no_referrer, acquisition.enters) : null,
      unit: "%",
    },
    {
      label: "Top referrer host",
      value: acquisition?.by_referrer_host?.[0]?.host ?? null,
    },
    // Demand and voice.
    { label: "Waitlist signups this week", value: demand?.signups_window ?? null },
    { label: "Feedback rows this week", value: feedback?.rows_window ?? null },
    { label: "Avg app rating this week", value: feedback?.avg_app_rating ?? null },
    // Health of the run itself.
    { label: "Collector RPC errors", value: errors.length },
  ];

  const metrics = [...funnelRows, ...audienceRows];

  const collectMs = Date.now() - started;

  // Manila calendar date, matching the Ops collector. VANTAGE reads this
  // filename back with `TZ=Asia/Manila date +%F`. Between midnight and 8am
  // Manila, UTC is on a different calendar day, so using UTC here would make
  // the agent look for a file this script never wrote.
  const date = phDate(new Date());
  const outDir = join(REPO_ROOT, "docs", "reports", "growth", ".data");
  mkdirSync(outDir, { recursive: true });

  const outFilename = `${date}.json`;
  const previousRun = readPreviousRun(outDir, outFilename);

  // The collector renders both finished tables so VANTAGE pastes them verbatim
  // and never touches a number — every figure in the report traces back to
  // tested code, not to the agent's arithmetic.
  const tables = {
    funnel: renderMetricsTable(
      diffMetrics(funnelRows, previousRun?.metrics ?? null),
      "FUNNEL",
      { now: "THIS WEEK", previous: "LAST WEEK" }
    ),
    audience: renderMetricsTable(
      diffMetrics(audienceRows, previousRun?.metrics ?? null),
      "AUDIENCE",
      { now: "THIS WEEK", previous: "LAST WEEK" }
    ),
  };

  const [startPhDate, endPhDate] = current.label.split(" → ");

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    window: { current, previous },
    termPhase: phaseForRange(startPhDate, endPhDate),
    metrics,
    previousDate: previousRun?.date ?? null,
    tables,
    funnel: steps,
    leak,
    raw: {
      identity,
      funnel: funnelAgg,
      acquisition,
      segments,
      cohorts,
      content,
      demand,
      feedback,
    },
    errors,
  };

  // A second run today would land on the same filename. Displace the earlier
  // run rather than overwriting it, so a report already published from it can
  // still be checked against the numbers it actually cited.
  const superseded = archiveExistingRun(outDir, outFilename);

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
  if (superseded) console.log(`superseded earlier run today -> ${superseded}`);
  if (errors.length > 0) {
    console.log(`${errors.length} RPC error(s) recorded in the payload's errors array`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `scripts` immediately after the `report:ops` line:

```json
    "report:growth": "tsx scripts/reports/growth.ts",
```

- [ ] **Step 3: Run the collector**

Run: `npm run report:growth`
Expected: prints a path ending `docs/reports/growth/.data/<today>.json`, where `<today>` is the Manila calendar date. Should take a few seconds — these are aggregate queries, not row pulls.

- [ ] **Step 4: Verify the output shape**

Run:

```bash
node -e "
const p = require('./docs/reports/growth/.data/' + new Date(Date.now()+8*3600e3).toISOString().slice(0,10) + '.json');
console.log('metrics:', p.metrics.length);
console.log('window :', p.window.current.label);
console.log('phase  :', p.termPhase.phase);
console.log('errors :', p.errors.length);
console.log('funnel steps:', p.funnel.length);
console.log(p.tables.funnel);
"
```

Expected: at least 25 metrics, a window label spanning seven days, `phase: unknown` (the calendar ships empty), `errors: 0`, `funnel steps: 8`, and an aligned FUNNEL table whose LAST WEEK column reads `—` on the first run.

- [ ] **Step 5: Verify the same-day archive**

Run `npm run report:growth` a second time.
Expected: a second line reading `superseded earlier run today -> .../superseded/<date>.1.json`.

Run: `ls docs/reports/growth/.data/superseded/`
Expected: `<date>.1.json`.

- [ ] **Step 6: Verify nothing became trackable**

Run: `git status --porcelain docs/reports/`
Expected: no output.

Run: `git check-ignore -v docs/reports/growth/.data/`
Expected: a match on the `docs/reports/` rule. If either check fails, stop — this data carries traffic and conversion figures and the repo is public.

- [ ] **Step 7: Commit**

```bash
git add scripts/reports/growth.ts package.json
git commit -m "feat(growth): add the growth collector"
```

---

### Task 10: VANTAGE agent definition

**Files:**
- Create: `.claude/agents/vantage.md`

**Interfaces:**
- Consumes: the collector JSON from Task 9, and `docs/reports/growth/<previous>.md`.
- Produces: `docs/reports/growth/<YYYY-MM-DD>.md` and one appended line in `docs/reports/cost-ledger.jsonl`.

VANTAGE gets no MCP tools. Its data comes entirely from the collector JSON, because an agent in this system never writes ad-hoc SQL against production.

**Note the trap from `docs/HANDOFF-2026-08-05.md` §6:** editing an agent definition does not affect the agent in the session it was edited in. Definitions load at session start. **Restart the session before dispatching VANTAGE for the first time**, or the dispatch runs against a definition that does not exist yet.

- [ ] **Step 1: Create the agent**

Create `.claude/agents/vantage.md`:

````markdown
---
name: vantage
description: Growth department agent. Use when running the weekly growth report — acquisition, activation, funnel and conversion, retention and cohorts, segmentation, content-market fit, demand sensing, voice of customer, experiment design, forecasting.
tools: Bash, Read, Write, Edit, Glob, Grep
---

# VANTAGE · Growth

You are VANTAGE, the Growth department. Skeptical of averages. You never report a
blended number without the segments underneath it.

**What you guard against:** vanity metrics, and a first-year-dominated average that
hides everything interesting. A number that went up is not a finding. A number that
went up *because one segment moved* is.

## The word "users" is banned

There are two populations and they differ by roughly an order of magnitude. Say which
one you mean, every time:

- **Devices** — browsers that stored a `device_id`. This is the reach number and it is
  what every event, payment, and subscription is keyed on.
- **Accounts** — rows in `auth.users`.

`docs/POST-MORTEM.md` records a "signed-up users" figure far above the account count,
almost certainly because it counted devices under the device-first identity model that
predates accounts. The collector reports both under separate labels so they can never
be merged again. If you catch yourself writing "users", replace it with "devices" or
"accounts" and check that you picked the right one.

## Core principle

**A scan is a diff, not a snapshot.** The value is what changed since last week. A
report that does not reference the previous one has thrown away the reason this log
exists.

## Step 1 — Read the previous report FIRST

Before any tool call:

```sh
find docs/reports/growth -maxdepth 2 -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' \
  | awk -F/ '{print $NF"\t"$0}' | sort | tail -1 | cut -f2
```

Read whatever it prints. You need its findings so each can be marked NEW, ONGOING, or
CLOSED. If it prints nothing, there is no earlier report — say so, this is a baseline
scan.

**Record the path it printed.** Step 5 names it in the report. A diff nobody can trace
to its baseline is not auditable.

Four things in that command are load-bearing. Do not simplify it:

- **It searches two levels deep**, so a report filed in a subdirectory is still found.
- **The date-shaped `-name` pattern is a filter, not decoration.** A plain `*.md` glob
  would pick up a `README.md` or `TEMPLATE.md`, and `TEMPLATE.md` sorts last — you
  would diff this week against a blank template and not notice.
- **Sorting is on the filename, not the path**, so the newest date wins wherever it
  lives.
- **Today's date is deliberately not excluded.** You read this before you write, so an
  existing `<today>.md` is an earlier run's report and is the closest prior there is.
  Skipping it strands every finding it opened. Reports displaced by a re-run are
  archived under `superseded/` with a `.<n>` suffix the pattern will not match, so they
  never come back as a baseline.

You do **not** need its metrics tables. The collector reads the previous run's data file
itself, computes both diffs, and hands you finished tables in Step 2.

## Step 2 — Read the collector output

```sh
cat "docs/reports/growth/.data/$(TZ=Asia/Manila date +%F).json"
```

If it is missing, run `npm run report:growth` first. It costs nothing, and re-running
is safe: the collector moves the day's earlier run into `.data/superseded/` rather than
overwriting it.

**Always pass `TZ=Asia/Manila`.** The collector names its file with the Manila calendar
date. A bare `date +%F` agrees only as long as the machine happens to be set to PH
time — pin it explicitly so the two cannot drift apart.

**The JSON's `tables.funnel` and `tables.audience` are finished tables.** The collector
already read the previous run's data file (see `previousDate`, `null` on a baseline
run), diffed it, and rendered aligned columns. Paste both into the report verbatim in
Step 5. **Never compute or edit a delta yourself, and never retype a number out of a
table.** If a value looks wrong, that is a finding — write it up like any other defect —
not something to quietly correct on the way to the report. Every number in the report
must trace back to tested code, never to your own arithmetic.

Fields you will use beyond the tables:

| Field | What it is for |
|---|---|
| `window.current` / `window.previous` | The two complete PH weeks being compared. Name the current one in the header. |
| `termPhase` | Seasonality. `unknown` until the term calendar is populated — see Step 4. |
| `funnel` | Per-step devices, `fromPrevious`, `fromTop`, `nonMonotonic`. |
| `leak` | The transition that lost the most devices, with its rate. |
| `raw.identity` | The account-versus-device reconciliation. |
| `raw.segments` | Conversion by year and by subject — your defence against a blended average. |
| `raw.cohorts` | Weekly cohorts and the 8-week active series. |
| `raw.content` | Module opens versus completions. |
| `raw.demand` | Waitlist — what people ask for that does not exist yet. |
| `raw.feedback` | Verbatim user text. Read for themes, not counts. |
| `errors` | RPCs that failed. Each one is a finding. |

## Step 3 — Interpret, segment first

Ten lenses. You do not write a section for each — you check each and report only what
moved or what is wrong.

1. **Acquisition.** `raw.acquisition`. Where enters came from, and the no-referrer
   share — the dark-social signal that links are moving through group chats rather than
   search. A large no-referrer share is normal here and is not a finding on its own.
2. **Activation.** How far a device gets in a first session: `funnel` steps 1–4, and
   how many reach the paywall at all. A device that never sees the paywall is a
   different problem from one that sees it and leaves — say which.
3. **Funnel and conversion.** `leak` is the single largest leak by devices lost. Report
   it and whether it moved. Note any step with `nonMonotonic: true` — that means more
   devices reached it than the step before, which is real (deep links into a module
   URL), not an error.
4. **Retention and cohorts.** `raw.cohorts`. See Step 4 before calling any decline a
   problem.
5. **Segmentation.** `raw.segments`. **Never report a blended conversion rate without
   the by-year and by-subject split underneath it.** This is the department's whole
   reason for existing in this product.
6. **Content–market fit.** `raw.content`. High opens with low completion is a content
   problem wearing an engagement costume.
7. **Demand sensing.** `raw.demand`. Upper-year demand has historically run far ahead
   of first-year demand per capita — check whether that still holds.
8. **Voice of customer.** `raw.feedback.recent`. Themes, not counts. This is the only
   department input written in users' own words. Quote sparingly and never attribute.
9. **Experiment design.** Propose what to test next **and state the sample size needed
   for the result to mean anything at the current weekly volume.** If the traffic is too
   thin for a test to conclude, say so plainly — that is a real constraint at this
   scale and pretending otherwise wastes a week.
10. **Forecasting.** Project the current trajectory and **state the assumptions.**
    Never present a projection without them.

## Step 4 — Seasonality before alarm

Visits cluster around exam dates. A quiet week during a term break and a quiet week
during midterms mean opposite things.

- If `termPhase.phase` is anything other than `unknown`, use it, and note
  `termPhase.mixed` when the window straddles two phases.
- If it is `unknown` — which it will be until someone populates `TERM_CALENDAR` in
  `lib/reports/academicCalendar.ts` — **say "term phase not recorded"** and fall back to
  `raw.cohorts.weekly_active`, the trailing 8-week series. Compare this week against
  that shape rather than against a single prior week.

**Never assert it is or is not exam week from memory.** That calendar ships empty
precisely so nobody invents dates. An invented break would let you excuse a real
regression.

## Step 5 — Write the report

Write `docs/reports/growth/<YYYY-MM-DD>.md`, where the date is the **Manila** calendar
date (`TZ=Asia/Manila date +%F`) so the report file and the collector's data file always
carry the same date.

**If that file already exists, move it aside before you write** — it is an earlier
report from today and the only record of the findings it opened:

```sh
d=$(TZ=Asia/Manila date +%F); f=docs/reports/growth/$d.md
if [ -e "$f" ]; then
  mkdir -p docs/reports/growth/superseded
  n=1; while [ -e "docs/reports/growth/superseded/$d.$n.md" ]; do n=$((n+1)); done
  mv "$f" "docs/reports/growth/superseded/$d.$n.md"
  echo "superseded -> docs/reports/growth/superseded/$d.$n.md"
fi
```

Never overwrite a published report. It is the only place some findings are written
down, and destroying it to publish a newer one loses exactly the history this log
exists to keep.

Use exactly this layout:

```
VANTAGE · GROWTH                                  <YYYY-MM-DD> · weekly
═══════════════════════════════════════════════════════════════════
WINDOW    <window.current.label>  ·  vs <window.previous.label>
SEASON    <termPhase.phase, or "term phase not recorded">
VERDICT   One line. Is anything on fire, and the single thing that moved.

<the collector JSON's `tables.funnel`, pasted verbatim>

<the collector JSON's `tables.audience`, pasted verbatim>

FINDINGS · vs <the Step 1 path, or "baseline · no earlier report">
 [P1] NEW      <title>
 [P2] ONGOING  <title>                                   (week <n>)
 [ok] CLOSED   <title>

ACCEPTED (<n>)  not re-litigated · reopens on trigger
 · <finding>                          → reopens if <trigger>

───────────────────────────────────────────────────────────────────
DETAIL · <severity> · <title>

  What      <the defect or signal>
  Evidence  <file:line, a metric with its delta, or an aggregate result>
  Impact    <who or what is affected, quantified where possible>
  Why <sev> <what makes this the current severity, not higher or lower>

  A  <accept>          <cost of inaction>
  B  <minimal>         <effort>
  C  <full fix>        <effort, trade>

  → <choice, with the reasoning in a sentence>

───────────────────────────────────────────────────────────────────
SEGMENTS     <the by-year and by-subject split behind any rate quoted above>
EXPERIMENT   <what to test next, and the sample size it needs to conclude>
───────────────────────────────────────────────────────────────────
SOURCE       collector run <the collector JSON's `collectedAt`>
RUN          collect <n>s · interpret not read · turns not read
COST         <not read>
CUMULATIVE   <paste from npm run report:cost>
```

`SOURCE` is the collector JSON's `collectedAt`, copied verbatim. The data file's name
carries only the Manila date, so it cannot identify *which* run today produced these
numbers — `collectedAt` can. That is what separates "this report is wrong" from "this
report was superseded by a re-run".

`collect <n>s` is the collector JSON's `collectMs` **divided by 1000 and rounded**.
`collectMs` is milliseconds. Writing it literally turns a real `collectMs: 4820` into
`collect 4820s`, about eighty minutes.

Interpret time, turn count, and cost are things you cannot measure about yourself from
inside a session. They are always **`not read`**, full stop — the same convention the
Ops report uses. Never estimate them.

`CUMULATIVE` comes from a script, never your own arithmetic:

```sh
npm run report:cost
```

Paste its output verbatim. Never hand-sum `cost-ledger.jsonl`.

Rules:

- **Detail is written for the top finding only, plus every P0 and P1.** P2 and below
  stay one-liners. A report nobody finishes reading has failed.
- **Paste both tables verbatim.** Never compute or edit a delta.
- **Every finding from the previous report appears**, even if only to be CLOSED.
- **ACCEPTED items list their reopen trigger** and are never re-argued until it fires.
  An ACCEPTED finding must never reappear as NEW.
- **Option A is always "do nothing", argued honestly** with the cost of inaction. For a
  solo founder, not acting is usually correct.
- **Never quote a blended rate without its segments.** The `SEGMENTS` block is not
  optional.

## Step 6 — Record the cost

Append one line to `docs/reports/cost-ledger.jsonl`:

```json
{"timestamp":"<ISO>","department":"growth","costUsd":null,"inputTokens":null,"outputTokens":null,"cacheReadTokens":null,"cacheCreationTokens":null,"collectMs":<from the collector JSON>,"interpretMs":null,"turns":null,"findingCount":<n>}
```

Use `null` for anything you cannot measure. Never estimate a cost.

## Step 7 — Report in chat

The file is the archive. The chat summary is the deliverable:

1. **Verdict** — is anything on fire, yes or no. First line, not buried.
2. **What moved** — the largest leak and its direction, plus any finding opened or
   closed. If nothing moved, say "no change since <date>" plainly.
3. **The segment underneath it** — one line naming which year or subject drove the
   change. A blended number alone is not an answer.
4. **Anything urgent**, or an explicit "nothing needs action this week".

## Escalation — what is actually P0

Only these justify interrupting other work:

1. **Conversion to paid falls to zero across a full reporting period while traffic
   holds.** Both halves matter: zero paid with zero traffic is a quiet week, not an
   incident.
2. **A funnel step's volume drops by more than half week-over-week with no release to
   explain it.** Check `git log --since` for a deploy before calling this.
3. **The paywall fails to render for a segment** — devices cannot pay even if they want
   to. Evidence: `paywall_teaser_view` collapsing for one year or subject in
   `raw.segments` while `module_open` holds.

Everything else is planned work. Label it as such.

## Disclosure

`docs/reports/` is gitignored. The repo is **public** and these reports carry traffic
and conversion figures — the same class of data that keeps `docs/POST-MORTEM.md`
private. **Never copy a figure from a report into a tracked file**, including into a
commit message, a migration comment, or a plan.

`raw.feedback.recent` contains users' own words. Quote sparingly, never attribute, and
never move a quote outside `docs/reports/`.

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing "users" | Say devices or accounts. They differ by about an order of magnitude. |
| Reporting a blended conversion rate alone | Split it by year and subject. That is the charter. |
| Writing the report without reading the previous one | Step 1. The diff is the product. |
| Leaving the FINDINGS line's diff basis unnamed | Name the Step 1 path. |
| Computing or retyping a delta by hand | Paste `tables.funnel` and `tables.audience` verbatim. |
| Calling a quiet week a regression | Step 4. Check the phase, or say it is not recorded. |
| Asserting it is exam week from memory | The calendar ships empty on purpose. Say "not recorded". |
| Treating `nonMonotonic` as a bug | Deep links into module URLs are real. Report it, do not clamp it. |
| Reporting `unlock_click` / `unlock_submitted` movement | They are dead types. `raw.funnel.dead_events.dead_last_seen` is the evidence. |
| Ignoring `errors[]` | A failed RPC means a section of this report is blank. That is a finding. |
| Proposing a test without a sample size | State the n needed to conclude, or say traffic is too thin. |
| Hand-summing `cost-ledger.jsonl` | Run `npm run report:cost` and paste it. |
| Writing `collectMs` straight into the RUN row | It is milliseconds. Divide by 1000. |
| `grep --include=*.ts` unquoted | zsh expands the glob. Quote it: `--include="*.ts"`. |
````

- [ ] **Step 2: Verify the agent is registered**

Run: `ls -1 .claude/agents/`
Expected: `pulse.md` and `vantage.md`.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/vantage.md
git commit -m "feat(growth): add the VANTAGE growth agent"
```

---

### Task 11: Repair the admin dashboard's dead funnel steps

**Files:**
- Create: `lib/adminFunnel.ts`
- Test: `lib/adminFunnel.test.ts`
- Modify: `app/admin/page.tsx:23-31` — import the step list instead of defining it
- Modify: `components/AdminDashboard.tsx:867-868` and `:963-983` — drop the frozen counters

**Interfaces:**
- Consumes: `EventType` from `lib/supabase/types.ts`.
- Produces: `AdminFunnelStep`, `ADMIN_FUNNEL_STEPS: readonly AdminFunnelStep[]`, `DEAD_EVENT_TYPES: readonly string[]`.

**Line numbers verified 2026-08-08 against the working tree:**

- `app/admin/page.tsx:29` — `{ type: "unlock_click", label: "Tapped Unlock", hint: "Showed payment intent" },`
- `app/admin/page.tsx:30` — `{ type: "unlock_submitted", label: "Submitted Payment", hint: "Completed GCash payment flow" },`
- `components/AdminDashboard.tsx:867` — `const unlockClicks    = funnel.find(s => s.type === "unlock_click")?.unique ?? 0;`
- `components/AdminDashboard.tsx:868` — `const unlockSubmitted = funnel.find(s => s.type === "unlock_submitted")?.unique ?? 0;`

Both hold. There is a third site the handoff does not mention: those two variables are rendered in an "Unlock Funnel" block at `components/AdminDashboard.tsx:963-983`, which also computes a conversion ratio from them. Removing only lines 867-868 leaves that block referencing undefined variables and will not typecheck.

`approvedUnlocks` is **not** dead — it comes from the `unlocks` table and holds real pre-pivot data. It is already rendered as a `Stat` at `components/AdminDashboard.tsx:924`, so removing the block loses nothing.

The dashboard is also **missing three live steps**: `paywall_teaser_view`, `paywall_teaser_click`, and `subscribe_click` are all emitted today (`components/PaywallTeaser.tsx:57,65` and `components/SubscribeGate.tsx:129`) and appear nowhere in the admin funnel. Adding them is the other half of this repair — the dashboard currently shows a funnel that stops before the paywall.

**The test is the point of this task.** A list of event types that no code emits is exactly the bug being fixed, so the regression test scans the repo and asserts every step type is actually emitted somewhere. That test would have caught this originally.

- [ ] **Step 1: Write the failing test**

Create `lib/adminFunnel.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ADMIN_FUNNEL_STEPS, DEAD_EVENT_TYPES } from "./adminFunnel";

const REPO_ROOT = join(__dirname, "..");
const SCAN_DIRS = ["app", "components"];

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(name) && !name.includes(".test.")) {
      out.push(full);
    }
  }
  return out;
}

const allSource = SCAN_DIRS.flatMap((d) => sourceFiles(join(REPO_ROOT, d)))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

/**
 * An event type is "emitted" if some component either calls logEvent with it
 * or hands it to <PageTracker event="..." />. Those are the only two ways an
 * event reaches app/api/events/route.ts.
 */
function isEmitted(type: string): boolean {
  return (
    allSource.includes(`logEvent("${type}"`) ||
    allSource.includes(`event="${type}"`)
  );
}

describe("ADMIN_FUNNEL_STEPS", () => {
  it("contains no dead event type", () => {
    for (const dead of DEAD_EVENT_TYPES) {
      expect(ADMIN_FUNNEL_STEPS.map((s) => s.type)).not.toContain(dead);
    }
  });

  it("has every step actually emitted by application code", () => {
    // This is the regression test for the bug being fixed: unlock_click and
    // unlock_submitted sat in this list for months, emitted by nothing, showing
    // two counts that could never move.
    const notEmitted = ADMIN_FUNNEL_STEPS.map((s) => s.type).filter((t) => !isEmitted(t));
    expect(notEmitted).toEqual([]);
  });

  it("includes the live paywall steps the dashboard used to stop short of", () => {
    const types = ADMIN_FUNNEL_STEPS.map((s) => s.type);
    expect(types).toContain("paywall_teaser_view");
    expect(types).toContain("paywall_teaser_click");
    expect(types).toContain("subscribe_click");
  });

  it("starts at enter and ends at subscribe_click", () => {
    expect(ADMIN_FUNNEL_STEPS[0].type).toBe("enter");
    expect(ADMIN_FUNNEL_STEPS.at(-1)!.type).toBe("subscribe_click");
  });

  it("gives every step a label and a hint", () => {
    for (const step of ADMIN_FUNNEL_STEPS) {
      expect(step.label.trim().length).toBeGreaterThan(0);
      expect(step.hint.trim().length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate step types", () => {
    const types = ADMIN_FUNNEL_STEPS.map((s) => s.type);
    expect(new Set(types).size).toBe(types.length);
  });
});

describe("DEAD_EVENT_TYPES", () => {
  it("names the two pre-pivot types", () => {
    expect([...DEAD_EVENT_TYPES].sort()).toEqual(["unlock_click", "unlock_submitted"]);
  });

  it("confirms nothing emits them, so the list stays honest", () => {
    for (const dead of DEAD_EVENT_TYPES) {
      expect(isEmitted(dead)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/adminFunnel.test.ts`
Expected: FAIL — cannot resolve `./adminFunnel`.

- [ ] **Step 3: Write the step list**

Create `lib/adminFunnel.ts`:

```typescript
/**
 * The admin dashboard's funnel step list.
 *
 * Extracted from app/admin/page.tsx so it can be tested. The bug that forced
 * this: `unlock_click` and `unlock_submitted` sat in this list long after the
 * subscription pivot, emitted by no code, rendering two counts that could never
 * increment. They remain in the DB enum, the events API allowlist, and
 * lib/supabase/types.ts — removing them from those is a separate, riskier change
 * — but nothing may display them as live steps.
 *
 * The colocated test scans app/ and components/ and asserts every type here is
 * actually emitted, so this cannot rot the same way twice.
 */

import type { EventType } from "./supabase/types";

export interface AdminFunnelStep {
  type: EventType;
  label: string;
  hint: string;
}

/**
 * Pre-pivot event types. Present in the schema and the API allowlist, emitted
 * by nothing since the subscription pivot replaced the one-time unlock.
 */
export const DEAD_EVENT_TYPES: readonly string[] = [
  "unlock_click",
  "unlock_submitted",
] as const;

export const ADMIN_FUNNEL_STEPS: readonly AdminFunnelStep[] = [
  { type: "enter",                label: "Opened App",       hint: "Unique devices that launched the app" },
  { type: "year_select",          label: "Selected Year",    hint: "Completed first onboarding step" },
  { type: "subject_open",         label: "Opened Subject",   hint: "Navigated to a subject" },
  { type: "module_open",          label: "Opened Module",    hint: "Went into a module" },
  { type: "section_view",         label: "Read a Section",   hint: "Scrolled and read content" },
  { type: "paywall_teaser_view",  label: "Saw Paywall",      hint: "The subscribe teaser rendered" },
  { type: "paywall_teaser_click", label: "Tapped Paywall",   hint: "Showed payment intent" },
  { type: "subscribe_click",      label: "Started Checkout", hint: "Left for the PayMongo link" },
] as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/adminFunnel.test.ts`
Expected: PASS — 8 tests.

- [ ] **Step 5: Use the list in the admin page**

In `app/admin/page.tsx`, replace lines 23-31:

```typescript
const FUNNEL_STEPS: { type: EventType; label: string; hint: string }[] = [
  { type: "enter",            label: "Opened App",        hint: "Unique devices that launched the app" },
  { type: "year_select",      label: "Selected Year",      hint: "Completed first onboarding step" },
  { type: "subject_open",     label: "Opened Subject",     hint: "Navigated to a subject" },
  { type: "module_open",      label: "Opened Module",      hint: "Went into a module" },
  { type: "section_view",     label: "Read a Section",     hint: "Scrolled and read content" },
  { type: "unlock_click",     label: "Tapped Unlock",      hint: "Showed payment intent" },
  { type: "unlock_submitted", label: "Submitted Payment",  hint: "Completed GCash payment flow" },
];
```

with:

```typescript
const FUNNEL_STEPS = ADMIN_FUNNEL_STEPS;
```

and add the import beside the existing ones near the top of the file:

```typescript
import { ADMIN_FUNNEL_STEPS } from "@/lib/adminFunnel";
```

The `EventType` import at line 5 may now be unused — run `npm run lint` at Step 8 and remove it only if lint says so.

- [ ] **Step 6: Remove the frozen counters**

In `components/AdminDashboard.tsx`, delete lines 867-868:

```typescript
  const unlockClicks    = funnel.find(s => s.type === "unlock_click")?.unique ?? 0;
  const unlockSubmitted = funnel.find(s => s.type === "unlock_submitted")?.unique ?? 0;
```

Then delete the block that renders them, lines 963-983 — everything from `<div className="mb-12">` containing `<p className="label mb-6">Unlock Funnel</p>` through its closing `</div>` immediately before `<p className="label mb-6">Transactions</p>`:

```tsx
        <div className="mb-12">
          <p className="label mb-6">Unlock Funnel</p>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {[
              { label: "Tapped Unlock", value: unlockClicks },
              { label: "Submitted Payment", value: unlockSubmitted },
              { label: "Approved", value: approvedUnlocks },
            ].map(item => (
              <div key={item.label} className="border border-ink-faint/30 p-5 text-center hover:border-ink/40 transition-colors">
                <p className="font-serif text-3xl text-ink mb-1">{item.value}</p>
                <p className="label-sm text-ink-muted">{item.label}</p>
              </div>
            ))}
          </div>
          {unlockClicks > 0 && (
            <p className="font-sans text-xs text-ink-faint mt-3">
              Conversion: {unlockSubmitted}/{unlockClicks} who tapped submitted
              {approvedUnlocks > 0 && ` · ${approvedUnlocks}/${unlockSubmitted} approved`}
            </p>
          )}
        </div>
```

`approvedUnlocks` stays in `Props` and stays rendered as a `Stat` at line 924 — it holds real pre-pivot data from the `unlocks` table and is not dead.

- [ ] **Step 7: Verify the dead types are gone from every display path**

Run: `grep -rn "unlock_click\|unlock_submitted\|unlockClicks\|unlockSubmitted" app/ components/ lib/ --include="*.ts" --include="*.tsx"`

Expected exactly three remaining matches, all of which are correct and must not be removed:

- `app/api/events/route.ts:13` — the API allowlist. Removing it would start rejecting inserts, and no client sends these anyway; leaving it costs nothing.
- `lib/supabase/types.ts:15-16` — the `EventType` union. It must keep matching the DB check constraint, which still permits them.
- `lib/adminFunnel.ts` — `DEAD_EVENT_TYPES`, which exists to name them.

- [ ] **Step 8: Run the full checks**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all pass. If typecheck reports an unused `EventType` import in `app/admin/page.tsx`, remove it.

- [ ] **Step 9: Verify the admin funnel RPC returns the new steps**

`app/admin/page.tsx:78` calls `supabase.rpc("admin_funnel_counts")`. **That function has no migration file in this repo** — it exists only in the live database. Before trusting the three newly-added paywall steps to render, confirm the RPC returns rows for them:

```bash
npx tsx -e "
import { createReportsClient, callRpc } from './scripts/reports/supabaseAdmin';
callRpc(createReportsClient(), 'admin_funnel_counts').then(r => console.log(JSON.stringify(r.data)));
"
```

Expected: rows including `paywall_teaser_view`, `paywall_teaser_click`, and `subscribe_click`. If those types are absent, the RPC filters to a hardcoded list and needs updating — dump its definition with
`select prosrc from pg_proc where proname = 'admin_funnel_counts';`
and commit it as a migration before changing it. See "What could not be verified" below.

- [ ] **Step 10: Commit**

```bash
git add lib/adminFunnel.ts lib/adminFunnel.test.ts app/admin/page.tsx components/AdminDashboard.tsx
git commit -m "fix(admin): drop dead unlock funnel steps, add the live paywall steps"
```

---

### Task 12: Wire `/report growth` and verify end to end

**Files:**
- Modify: `.claude/skills/report/SKILL.md` — add the `growth` route and enable the council

**Interfaces:**
- Consumes: `.claude/agents/vantage.md`, `scripts/reports/growth.ts`.
- Produces: `/report growth`, and `/report all` covering two departments — which turns the council on for the first time.

- [ ] **Step 1: Add growth to the routing table**

In `.claude/skills/report/SKILL.md`, replace this block:

```markdown
| Argument | Collector | Agent | Cadence |
|---|---|---|---|
| `ops` | `npm run report:ops` | `pulse` | daily |

Growth, finance, and security are not built yet. If asked for one, say so plainly
rather than improvising a report — an invented report is worse than no report.
```

with:

```markdown
| Argument | Collector | Agent | Cadence |
|---|---|---|---|
| `ops` | `npm run report:ops` | `pulse` | daily |
| `growth` | `npm run report:growth` | `vantage` | weekly |

Finance and security are not built yet. If asked for one, say so plainly rather than
improvising a report — an invented report is worse than no report.

The growth collector needs production Supabase credentials in `.env.reports.local`.
If it fails on a missing variable, that file is incomplete — get the values from the
Supabase dashboard, never from `.env.local`, which deliberately holds none.
```

- [ ] **Step 2: Update the "running one department" steps**

Replace:

```markdown
1. Run the collector: `npm run report:ops`
2. Dispatch the matching agent with the Agent tool, `subagent_type: "pulse"`.
3. Relay the agent's chat summary — verdict first.
```

with:

```markdown
1. Run the department's collector from the table above. It costs nothing.
2. Dispatch the matching agent with the Agent tool — `subagent_type: "pulse"` or
   `subagent_type: "vantage"`.
3. Relay the agent's chat summary — verdict first.

**If you have just edited an agent definition, restart the session before dispatching
it.** Definitions load at session start, so a subagent dispatched after a mid-session
edit runs the old instructions. This has already cost one whole verification run.
```

- [ ] **Step 3: Turn the council on**

Replace:

```markdown
**Only runs when two or more departments have reported in the same invocation.** With
one department built, there is no council — say so rather than faking one.
```

with:

```markdown
**Only runs when two or more departments have reported in the same invocation.**
Operations and Growth both exist, so `/report all` now produces a council. A single
`/report ops` or `/report growth` still does not — a council of one is just a report.

The two departments overlap in a specific, useful way: PULSE sees route health and
caching, VANTAGE knows which routes conversion depends on. A cache regression on a
route nobody converts through and one on the paywall path are different severities,
and only the combination reveals which is which.
```

- [ ] **Step 4: Run the collector fresh**

Run: `npm run report:growth`
Expected: writes `docs/reports/growth/.data/<today>.json` with `errors: []`.

- [ ] **Step 5: Restart the session, then run the department**

Start a new Claude Code session — `.claude/agents/vantage.md` was created in Task 10 and the current session cannot see it.

Then run: `/report growth`

Expected: a report at `docs/reports/growth/<today>.md` containing a `VANTAGE · GROWTH` header, a `WINDOW` line naming two week ranges, a `SEASON` line reading `term phase not recorded`, both metrics tables with `LAST WEEK` columns of `—`, a `FINDINGS` line naming its diff basis as `baseline · no earlier report`, and a `SEGMENTS` block.

- [ ] **Step 6: Verify the disclosure boundary held**

Run: `git status --porcelain docs/reports/`
Expected: no output.

Run: `git diff --stat HEAD`
Expected: no changed file under `docs/reports/`. If any figure from the run has landed in a tracked file, remove it before committing — the repo is public.

- [ ] **Step 7: Run the full suite**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all pass, with 70 more tests than before this plan — 11 from `phWeek`, 25 from `funnel`, 11 from `academicCalendar`, 15 from `reportsEnv`, 8 from `adminFunnel`. The suite was at **624 tests across 72 files** before this plan (verified 2026-08-08), so expect **694**.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/report/SKILL.md
git commit -m "feat(growth): route /report growth and enable the council"
```

---

## What could not be verified

Flagged rather than guessed, as required.

**1. `admin_funnel_counts` has no migration file.** `app/admin/page.tsx:78` calls it and `lib/supabase/types.ts:301` declares its return shape, but `grep -rn "function admin_funnel_counts" supabase/migrations/` finds nothing. Its body could not be read, so whether it groups all event types or filters to a hardcoded list is unknown. Task 11 Step 9 checks this empirically before relying on it. **Four other live RPCs have the same problem** — `admin_dau_30d`, `admin_active_since`, `admin_user_totals`, and `check_login_lockout` / `record_login_attempt` / `clear_login_attempts` are all called from application code and none has a migration.

**2. `waitlist.year_label`, `subject_title`, and `module_title` have no migration.** `app/api/waitlist/route.ts:111-112` writes them and `20260629000001_admin_waitlist_agg.sql` reads them, but `20260620000000_create_waitlist.sql` does not create them and no `alter table waitlist` exists anywhere. They are presumed live; `growth_demand_agg` in Task 8 depends on them, and Step 2 of that task says what to do if the assumption is wrong.

Both items are migration drift and belong to Operations' data-ops sub-function, not to Growth. They are recorded here because Growth trips over them.

**3. `auth.users.email_confirmed_at` is assumed to exist.** It is the standard Supabase GoTrue column, but the schema was not read directly — `auth` is not in `supabase/migrations/`. Task 5 Step 3 catches it if wrong.

**4. Whether `security definer` grants this function access to `auth.users`** depends on which role owns it, which depends on how the migration is applied. Task 5 Step 3 verifies it and Step 4 records the answer rather than assuming.

**5. The POST-MORTEM figure's derivation is inferred, not proven.** That devices were counted as "signed-up users" is the most likely explanation for the order-of-magnitude gap and matches the device-first model in `lib/device.ts`, but nothing in the repo states it. The first VANTAGE run should compare `raw.identity.devices_entered` against the POST-MORTEM figure and record whether they match. If they do not, the reconciliation is not finished and the finding stays open.

## Deferred from this plan

The spec gives Growth ten sub-functions. This plan implements all ten, but three land partially and one supporting decision is deliberately postponed.

**Segmentation by university (partial).** `profiles.university` is per-**account**, and accounts are a far smaller population than devices. Since the funnel is device-keyed, university cannot be crossed with conversion at all — any such split would be computed over a small, unrepresentative slice and presented as if it described the audience. The existing `admin_profiles_agg()` already reports university distribution across accounts and is the honest ceiling. Revisit if account adoption ever approaches device reach.

**Segmentation by device type (partial).** `lib/deviceType.ts` is called in exactly one place, `app/api/waitlist/route.ts:95`, and its output is stored only on `waitlist.device_type`. The `events` table has no device-type column, so device-type segmentation exists for waitlist signups and nowhere else. `growth_demand_agg` reports it there. Extending it across the funnel means adding a column to `events` and populating it in the events API — a schema change to the largest table in the database, which is a decision to make on its own rather than smuggle in here.

**Seasonality (partial).** `TERM_CALENDAR` ships empty, so `termPhase` is `unknown` until the owner supplies real Philippine academic dates. The trailing 8-week active series from `growth_cohort_agg` carries the load until then, and VANTAGE is instructed to say "term phase not recorded" rather than invent a phase. Populating the calendar is a five-minute edit to `lib/reports/academicCalendar.ts` and needs no code change.

**Real cost accounting.** Every department currently writes `costUsd: null` because an agent running as a subagent cannot measure its own token use — that needs headless `claude -p --output-format json`. Growth inherits the limitation rather than solving it, and the fix belongs with Operations, which owns the ledger.

**Migration drift for the undocumented RPCs.** Dumping `admin_funnel_counts` and its four siblings out of the live database and committing them as migrations is real work with real value, but it is Operations' data-ops sub-function and doing it here would make this plan about something else.

None of these block the department. Acquisition, activation, funnel and conversion, retention, year and subject segmentation, content fit, demand, voice of customer, experiment sizing, and forecasting are all live on the first run.

## Verification

After all tasks, confirm the department works end to end:

- [ ] `npm run report:growth` writes JSON to `docs/reports/growth/.data/<today>.json`, where `<today>` is the **Manila** calendar date
- [ ] The payload's `errors` array is empty
- [ ] `window.current` and `window.previous` abut exactly, and neither includes today
- [ ] `raw.identity` carries both `accounts` and `devices_entered`, and they differ — the reconciliation has a real answer to report
- [ ] `raw.funnel.steps.subject_open_any` exceeds `raw.funnel.steps.subject_open`, confirming the subject-list double-emission is being separated
- [ ] `raw.funnel.dead_events.dead_last_seen` predates the subscription pivot
- [ ] Running the collector twice the same day archives the first run to `.data/superseded/<date>.1.json`
- [ ] `/report growth` produces a report at `docs/reports/growth/<today>.md`
- [ ] The report contains both metrics tables, a `SEGMENTS` block, and an `EXPERIMENT` line with a sample size
- [ ] The report's `SEASON` line reads `term phase not recorded`, not an invented phase
- [ ] The report never uses the bare word "users"
- [ ] A second run the following week populates the `LAST WEEK` columns with real deltas
- [ ] `docs/reports/cost-ledger.jsonl` has one `"department":"growth"` line per run
- [ ] `/report all` produces a council section, since two departments now exist
- [ ] The admin dashboard at `/admin` shows the paywall steps and no "Unlock Funnel" block
- [ ] `git status --porcelain docs/reports/` is empty
- [ ] `git diff HEAD` contains no traffic or conversion figure in any tracked file
- [ ] `npm test && npm run typecheck && npm run lint` all pass, at 694 tests
