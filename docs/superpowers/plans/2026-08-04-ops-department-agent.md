# Operations Department Agent (PULSE) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Operations department agent (PULSE) and, with it, the shared machinery every later department inherits — severity taxonomy, metrics diffing, cost ledger, report layout, and the `/report` command.

**Architecture:** Two layers. A deterministic collector (`scripts/reports/ops.ts`) runs local commands and HTTP checks, then emits JSON — no LLM, no tokens. An interpreter agent (`.claude/agents/pulse.md`) reads that JSON plus the previous report, gathers Vercel data via MCP tools the collector cannot reach, and writes the report. Shared pure logic lives in `lib/reports/` and is unit-tested like the rest of `lib/`.

**Tech Stack:** TypeScript, Node 24, tsx, Vitest, Vercel MCP tools, Claude Code subagents and skills. No new npm dependencies.

## Global Constraints

- **Node 24.x** — matches `engines` in `package.json`.
- **No new npm dependencies.** Everything uses Node built-ins or packages already present.
- **Collectors are read-only.** They never write to Supabase, Vercel, or any production system.
- **Never write an estimate into a metric row.** An unmeasured value is recorded as `null` and renders as `not read`. An estimate that hardens into a baseline poisons every future delta.
- **`docs/reports/` is gitignored in full.** Reports carry traffic, revenue, conversion, and security data. The repo is public. Nothing from `docs/reports/` may be copied into a tracked file.
- **Tests colocate with source** as `<name>.test.ts`, matching the existing `lib/` convention.
- **Commit messages use conventional-commit prefixes** (`feat:`, `fix:`, `docs:`, `chore:`) and carry **no trailer block** — no `Co-Authored-By` of any kind.
- **Severity labels are exactly** `P0`, `P1`, `P2`, `P3`, `ACCEPTED`. Finding states are exactly `NEW`, `ONGOING`, `CLOSED`.

## File Structure

| Path | Responsibility |
|---|---|
| `lib/reports/severity.ts` | Severity and finding-state types, ordering, validation. Pure. |
| `lib/reports/severity.test.ts` | Tests for the above. |
| `lib/reports/metrics.ts` | Metric types, diffing current against previous, rendering the fixed-width table. Pure. |
| `lib/reports/metrics.test.ts` | Tests for the above. |
| `lib/reports/costLedger.ts` | Append and read `cost-ledger.jsonl`, summarize a month. |
| `lib/reports/costLedger.test.ts` | Tests for the above. |
| `scripts/reports/ops.ts` | The Ops collector. Runs local commands and HTTP checks, writes JSON. |
| `.claude/agents/pulse.md` | The PULSE interpreter agent definition. |
| `.claude/skills/report/SKILL.md` | The `/report` command. |
| `package.json` | Adds the `report:ops` script. |

`lib/reports/` holds only pure, testable logic. Anything touching the filesystem or the network lives in `scripts/reports/`, except the cost ledger, whose file I/O is simple enough to test directly with a temp directory.

---

### Task 1: Severity taxonomy

**Files:**
- Create: `lib/reports/severity.ts`
- Test: `lib/reports/severity.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Severity`, `FindingState`, `Finding`, `SEVERITY_ORDER`, `compareSeverity(a: Severity, b: Severity): number`, `isEscalation(s: Severity): boolean`, `validateFinding(f: Finding): string[]`.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/severity.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  compareSeverity,
  isEscalation,
  validateFinding,
  SEVERITY_ORDER,
  type Finding,
} from "./severity";

describe("SEVERITY_ORDER", () => {
  it("ranks most urgent first and ACCEPTED last", () => {
    expect(SEVERITY_ORDER).toEqual(["P0", "P1", "P2", "P3", "ACCEPTED"]);
  });
});

describe("compareSeverity", () => {
  it("sorts P0 ahead of everything", () => {
    expect(compareSeverity("P0", "P1")).toBeLessThan(0);
    expect(compareSeverity("P0", "ACCEPTED")).toBeLessThan(0);
  });

  it("sorts ACCEPTED behind everything", () => {
    expect(compareSeverity("ACCEPTED", "P3")).toBeGreaterThan(0);
  });

  it("returns 0 for equal severities", () => {
    expect(compareSeverity("P2", "P2")).toBe(0);
  });

  it("sorts a findings array most-severe-first", () => {
    const order = (["P3", "P0", "ACCEPTED", "P1"] as const)
      .slice()
      .sort(compareSeverity);
    expect(order).toEqual(["P0", "P1", "P3", "ACCEPTED"]);
  });
});

describe("isEscalation", () => {
  it("is true only for P0 and P1", () => {
    expect(isEscalation("P0")).toBe(true);
    expect(isEscalation("P1")).toBe(true);
    expect(isEscalation("P2")).toBe(false);
    expect(isEscalation("P3")).toBe(false);
    expect(isEscalation("ACCEPTED")).toBe(false);
  });
});

describe("validateFinding", () => {
  const base: Finding = {
    id: "cache-miss-for-blocks",
    title: "/for-blocks cache flipped HIT to MISS",
    severity: "P1",
    state: "NEW",
  };

  it("accepts a well-formed finding", () => {
    expect(validateFinding(base)).toEqual([]);
  });

  it("rejects an empty id", () => {
    expect(validateFinding({ ...base, id: "" })).toContain("id is required");
  });

  it("rejects an id that is not a stable slug", () => {
    expect(validateFinding({ ...base, id: "Cache Miss!" })).toContain(
      "id must be a lowercase slug: a-z, 0-9 and hyphens only"
    );
  });

  it("rejects an empty title", () => {
    expect(validateFinding({ ...base, title: "  " })).toContain("title is required");
  });

  it("requires a reason and a reopen trigger on ACCEPTED findings", () => {
    const errors = validateFinding({ ...base, severity: "ACCEPTED" });
    expect(errors).toContain("ACCEPTED findings require acceptedReason");
    expect(errors).toContain("ACCEPTED findings require reopenTrigger");
  });

  it("accepts an ACCEPTED finding that carries both fields", () => {
    const errors = validateFinding({
      ...base,
      severity: "ACCEPTED",
      acceptedReason: "Single region is fine at current traffic",
      reopenTrigger: "PH latency exceeds 800ms",
    });
    expect(errors).toEqual([]);
  });

  it("rejects acceptance fields on a non-ACCEPTED finding", () => {
    const errors = validateFinding({ ...base, reopenTrigger: "never" });
    expect(errors).toContain("reopenTrigger is only valid on ACCEPTED findings");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/severity.test.ts`
Expected: FAIL — cannot resolve `./severity`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/severity.ts`:

```typescript
/**
 * Severity taxonomy shared by every department report.
 *
 * The bottom two labels carry the weight. P3 exists so a trend stays visible
 * without demanding action, and ACCEPTED makes "we are deliberately not fixing
 * this" a durable decision rather than something that quietly resurfaces every
 * week. An ACCEPTED finding is never re-argued until its trigger fires, which
 * is why the trigger is required rather than optional.
 */

export type Severity = "P0" | "P1" | "P2" | "P3" | "ACCEPTED";

export type FindingState = "NEW" | "ONGOING" | "CLOSED";

export interface Finding {
  /** Stable slug. Findings are matched across runs by this, not by title. */
  id: string;
  title: string;
  severity: Severity;
  state: FindingState;
  /** ISO date the finding first appeared. Set on the run that opens it. */
  sinceRun?: string;
  /** Required when severity is ACCEPTED: why we are not fixing it. */
  acceptedReason?: string;
  /** Required when severity is ACCEPTED: what would promote it back. */
  reopenTrigger?: string;
}

export const SEVERITY_ORDER: readonly Severity[] = [
  "P0",
  "P1",
  "P2",
  "P3",
  "ACCEPTED",
] as const;

/** Sort comparator: most severe first, ACCEPTED always last. */
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}

/** Only P0 and P1 justify interrupting other work. */
export function isEscalation(severity: Severity): boolean {
  return severity === "P0" || severity === "P1";
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns a list of problems. An empty array means the finding is valid. */
export function validateFinding(finding: Finding): string[] {
  const errors: string[] = [];

  if (!finding.id) {
    errors.push("id is required");
  } else if (!SLUG.test(finding.id)) {
    errors.push("id must be a lowercase slug: a-z, 0-9 and hyphens only");
  }

  if (!finding.title.trim()) errors.push("title is required");

  if (finding.severity === "ACCEPTED") {
    if (!finding.acceptedReason?.trim()) {
      errors.push("ACCEPTED findings require acceptedReason");
    }
    if (!finding.reopenTrigger?.trim()) {
      errors.push("ACCEPTED findings require reopenTrigger");
    }
  } else {
    if (finding.acceptedReason !== undefined) {
      errors.push("acceptedReason is only valid on ACCEPTED findings");
    }
    if (finding.reopenTrigger !== undefined) {
      errors.push("reopenTrigger is only valid on ACCEPTED findings");
    }
  }

  return errors;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/severity.test.ts`
Expected: PASS — 13 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/severity.ts lib/reports/severity.test.ts
git commit -m "feat(reports): add severity taxonomy for department findings"
```

---

### Task 2: Metric diffing and table rendering

**Files:**
- Create: `lib/reports/metrics.ts`
- Test: `lib/reports/metrics.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Metric`, `MetricDelta`, `diffMetrics(current: Metric[], previous: Metric[] | null): MetricDelta[]`, `renderMetricsTable(rows: MetricDelta[], heading: string): string`.

A metric with `value: null` means "not read" and must never be given a computed delta.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/metrics.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { diffMetrics, renderMetricsTable, type Metric } from "./metrics";

describe("diffMetrics", () => {
  it("marks every row as baseline when there is no previous run", () => {
    const current: Metric[] = [{ label: "Live URL /", value: 200 }];
    const rows = diffMetrics(current, null);
    expect(rows).toEqual([
      {
        label: "Live URL /",
        now: "200",
        previous: "—",
        delta: "—",
        direction: "unknown",
      },
    ]);
  });

  it("computes a numeric delta with an absolute change", () => {
    const rows = diffMetrics(
      [{ label: "Error clusters", value: 2 }],
      [{ label: "Error clusters", value: 1 }]
    );
    expect(rows[0].delta).toBe("+1");
    expect(rows[0].direction).toBe("up");
  });

  it("reports a decrease with direction down", () => {
    const rows = diffMetrics(
      [{ label: "5xx", value: 0 }],
      [{ label: "5xx", value: 4 }]
    );
    expect(rows[0].delta).toBe("-4");
    expect(rows[0].direction).toBe("down");
  });

  it("reports no change as flat with an em dash", () => {
    const rows = diffMetrics(
      [{ label: "5xx", value: 0 }],
      [{ label: "5xx", value: 0 }]
    );
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("flat");
  });

  it("renders a null value as 'not read' and never computes a delta for it", () => {
    const rows = diffMetrics(
      [{ label: "Active CPU", value: null }],
      [{ label: "Active CPU", value: 72 }]
    );
    expect(rows[0].now).toBe("not read");
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("unknown");
  });

  it("does not compute a delta when the previous value was not read", () => {
    const rows = diffMetrics(
      [{ label: "Active CPU", value: 72 }],
      [{ label: "Active CPU", value: null }]
    );
    expect(rows[0].previous).toBe("not read");
    expect(rows[0].delta).toBe("—");
    expect(rows[0].direction).toBe("unknown");
  });

  it("compares string values for equality without arithmetic", () => {
    const changed = diffMetrics(
      [{ label: "Page cache", value: "MISS" }],
      [{ label: "Page cache", value: "HIT" }]
    );
    expect(changed[0].delta).toBe("changed");
    expect(changed[0].direction).toBe("up");

    const same = diffMetrics(
      [{ label: "Page cache", value: "HIT" }],
      [{ label: "Page cache", value: "HIT" }]
    );
    expect(same[0].delta).toBe("—");
    expect(same[0].direction).toBe("flat");
  });

  it("appends a unit to the rendered value", () => {
    const rows = diffMetrics([{ label: "Build", value: 42, unit: "s" }], null);
    expect(rows[0].now).toBe("42s");
  });

  it("keeps a current row whose label is absent from the previous run", () => {
    const rows = diffMetrics(
      [{ label: "Tests", value: 579 }],
      [{ label: "5xx", value: 0 }]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe("Tests");
    expect(rows[0].previous).toBe("—");
  });

  it("preserves the order of the current metrics", () => {
    const rows = diffMetrics(
      [
        { label: "B", value: 1 },
        { label: "A", value: 2 },
      ],
      null
    );
    expect(rows.map((r) => r.label)).toEqual(["B", "A"]);
  });
});

describe("renderMetricsTable", () => {
  it("renders aligned columns under the heading", () => {
    const table = renderMetricsTable(
      diffMetrics(
        [
          { label: "Live URL /", value: 200 },
          { label: "5xx", value: 0 },
        ],
        [
          { label: "Live URL /", value: 200 },
          { label: "5xx", value: 3 },
        ]
      ),
      "HEALTH"
    );
    const lines = table.split("\n");
    expect(lines[0]).toContain("HEALTH");
    expect(lines[0]).toContain("NOW");
    expect(lines[0]).toContain("LAST RUN");
    expect(lines[1]).toMatch(/^─+$/);
    expect(table).toContain("Live URL /");
    expect(table).toContain("-3");
  });

  it("returns a heading and rule even with no rows", () => {
    const table = renderMetricsTable([], "HEALTH");
    expect(table).toContain("HEALTH");
    expect(table.split("\n")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/metrics.test.ts`
Expected: FAIL — cannot resolve `./metrics`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/metrics.ts`:

```typescript
/**
 * Metric diffing for department reports.
 *
 * A scan is a diff, not a snapshot: the value is in what changed since last
 * time. The row set must stay identical between runs, so a row present in the
 * current run always appears even when the previous run had no equivalent.
 *
 * A null value means "not read". It renders as such and is never given a
 * computed delta — an estimate that hardens into a baseline poisons every
 * future comparison.
 */

export interface Metric {
  label: string;
  value: string | number | null;
  unit?: string;
}

export interface MetricDelta {
  label: string;
  now: string;
  previous: string;
  delta: string;
  direction: "up" | "down" | "flat" | "unknown";
}

const NOT_READ = "not read";
const NONE = "—";

function render(metric: Metric | undefined): string {
  if (!metric) return NONE;
  if (metric.value === null) return NOT_READ;
  return `${metric.value}${metric.unit ?? ""}`;
}

function compare(current: Metric, previous: Metric | undefined): Pick<MetricDelta, "delta" | "direction"> {
  if (!previous || current.value === null || previous.value === null) {
    return { delta: NONE, direction: "unknown" };
  }

  if (typeof current.value === "number" && typeof previous.value === "number") {
    const change = current.value - previous.value;
    if (change === 0) return { delta: NONE, direction: "flat" };
    return {
      delta: `${change > 0 ? "+" : ""}${change}`,
      direction: change > 0 ? "up" : "down",
    };
  }

  // Non-numeric values are compared for equality only. "changed" is honest
  // where arithmetic would be meaningless — HIT to MISS has no magnitude.
  if (String(current.value) === String(previous.value)) {
    return { delta: NONE, direction: "flat" };
  }
  return { delta: "changed", direction: "up" };
}

export function diffMetrics(current: Metric[], previous: Metric[] | null): MetricDelta[] {
  const lookup = new Map((previous ?? []).map((m) => [m.label, m]));

  return current.map((metric) => {
    const before = lookup.get(metric.label);
    return {
      label: metric.label,
      now: render(metric),
      previous: render(before),
      ...compare(metric, before),
    };
  });
}

const LABEL_WIDTH = 30;
const COL_WIDTH = 11;
const RULE_WIDTH = 69;

export function renderMetricsTable(rows: MetricDelta[], heading: string): string {
  const header =
    heading.padEnd(LABEL_WIDTH) +
    "NOW".padStart(COL_WIDTH) +
    "LAST RUN".padStart(COL_WIDTH + 4) +
    "Δ".padStart(COL_WIDTH);

  const rule = "─".repeat(RULE_WIDTH);

  const body = rows.map(
    (row) =>
      row.label.padEnd(LABEL_WIDTH) +
      row.now.padStart(COL_WIDTH) +
      row.previous.padStart(COL_WIDTH + 4) +
      row.delta.padStart(COL_WIDTH)
  );

  return [header, rule, ...body].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/metrics.test.ts`
Expected: PASS — 12 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/metrics.ts lib/reports/metrics.test.ts
git commit -m "feat(reports): diff metrics against the previous run"
```

---

### Task 3: Cost ledger

**Files:**
- Create: `lib/reports/costLedger.ts`
- Test: `lib/reports/costLedger.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `CostEntry`, `appendCostEntry(ledgerPath: string, entry: CostEntry): void`, `readCostLedger(ledgerPath: string): CostEntry[]`, `summarizeMonth(entries: CostEntry[], month: string): MonthSummary`, `MonthSummary`.

`month` is a `YYYY-MM` string. Entries whose `costUsd` is `null` count as runs but contribute nothing to the total.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/costLedger.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  appendCostEntry,
  readCostLedger,
  summarizeMonth,
  type CostEntry,
} from "./costLedger";

let dir: string;
let ledger: string;

const entry = (overrides: Partial<CostEntry> = {}): CostEntry => ({
  timestamp: "2026-08-11T02:14:00.000Z",
  department: "ops",
  costUsd: 0.11,
  inputTokens: 1602,
  outputTokens: 2878,
  cacheReadTokens: 22104,
  cacheCreationTokens: 0,
  collectMs: 11300,
  interpretMs: 26400,
  turns: 2,
  findingCount: 4,
  ...overrides,
});

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "cost-ledger-"));
  ledger = join(dir, "cost-ledger.jsonl");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("appendCostEntry", () => {
  it("creates the file and writes one JSON line", () => {
    appendCostEntry(ledger, entry());
    const lines = readFileSync(ledger, "utf8").trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]).department).toBe("ops");
  });

  it("creates missing parent directories", () => {
    const nested = join(dir, "reports", "ops", "cost-ledger.jsonl");
    appendCostEntry(nested, entry());
    expect(readCostLedger(nested)).toHaveLength(1);
  });

  it("appends without rewriting earlier lines", () => {
    appendCostEntry(ledger, entry({ department: "ops" }));
    appendCostEntry(ledger, entry({ department: "growth" }));
    const entries = readCostLedger(ledger);
    expect(entries.map((e) => e.department)).toEqual(["ops", "growth"]);
  });
});

describe("readCostLedger", () => {
  it("returns an empty array when the file does not exist", () => {
    expect(readCostLedger(join(dir, "absent.jsonl"))).toEqual([]);
  });

  it("skips malformed lines rather than throwing", () => {
    writeFileSync(ledger, `${JSON.stringify(entry())}\nnot json\n`);
    expect(readCostLedger(ledger)).toHaveLength(1);
  });
});

describe("summarizeMonth", () => {
  it("totals only entries inside the requested month", () => {
    const entries = [
      entry({ timestamp: "2026-08-01T00:00:00.000Z", costUsd: 0.1 }),
      entry({ timestamp: "2026-08-31T23:59:59.000Z", costUsd: 0.2 }),
      entry({ timestamp: "2026-07-31T23:59:59.000Z", costUsd: 9.0 }),
    ];
    const summary = summarizeMonth(entries, "2026-08");
    expect(summary.runs).toBe(2);
    expect(summary.totalUsd).toBeCloseTo(0.3, 5);
    expect(summary.avgUsd).toBeCloseTo(0.15, 5);
  });

  it("counts a null-cost run without adding to the total", () => {
    const summary = summarizeMonth(
      [entry({ costUsd: null }), entry({ costUsd: 0.2 })],
      "2026-08"
    );
    expect(summary.runs).toBe(2);
    expect(summary.totalUsd).toBeCloseTo(0.2, 5);
    expect(summary.avgUsd).toBeCloseTo(0.2, 5);
  });

  it("returns zeroes for a month with no runs", () => {
    expect(summarizeMonth([entry()], "2026-01")).toEqual({
      runs: 0,
      totalUsd: 0,
      avgUsd: 0,
      findings: 0,
    });
  });

  it("sums the findings produced in the month", () => {
    const summary = summarizeMonth(
      [entry({ findingCount: 4 }), entry({ findingCount: 3 })],
      "2026-08"
    );
    expect(summary.findings).toBe(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/costLedger.test.ts`
Expected: FAIL — cannot resolve `./costLedger`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/costLedger.ts`:

```typescript
/**
 * Append-only ledger of what each department run consumed.
 *
 * Written as JSONL so a run only ever appends — no read-modify-write, and a
 * crashed run cannot corrupt earlier entries. The question this exists to
 * answer is whether a department earns its cost: an expensive department
 * producing findings nobody acts on should have its cadence cut.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export interface CostEntry {
  /** ISO timestamp of the run. */
  timestamp: string;
  department: string;
  /** null when the run was not measured — never estimated. */
  costUsd: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheCreationTokens: number | null;
  collectMs: number;
  interpretMs: number | null;
  turns: number | null;
  findingCount: number;
}

export interface MonthSummary {
  runs: number;
  totalUsd: number;
  avgUsd: number;
  findings: number;
}

export function appendCostEntry(ledgerPath: string, entry: CostEntry): void {
  mkdirSync(dirname(ledgerPath), { recursive: true });
  appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function readCostLedger(ledgerPath: string): CostEntry[] {
  if (!existsSync(ledgerPath)) return [];

  const entries: CostEntry[] = [];
  for (const line of readFileSync(ledgerPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line) as CostEntry);
    } catch {
      // A malformed line is a damaged record, not a reason to lose the rest
      // of the ledger. Skip it.
    }
  }
  return entries;
}

/** `month` is a YYYY-MM string. Average is over runs that reported a cost. */
export function summarizeMonth(entries: CostEntry[], month: string): MonthSummary {
  const inMonth = entries.filter((e) => e.timestamp.startsWith(`${month}-`));
  const measured = inMonth.filter((e) => e.costUsd !== null);

  const totalUsd = measured.reduce((sum, e) => sum + (e.costUsd ?? 0), 0);

  return {
    runs: inMonth.length,
    totalUsd,
    avgUsd: measured.length > 0 ? totalUsd / measured.length : 0,
    findings: inMonth.reduce((sum, e) => sum + e.findingCount, 0),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/costLedger.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/costLedger.ts lib/reports/costLedger.test.ts
git commit -m "feat(reports): record per-run cost in an append-only ledger"
```

---

### Task 4: Ops collector script

**Files:**
- Create: `scripts/reports/ops.ts`
- Modify: `package.json` — add the `report:ops` script

**Interfaces:**
- Consumes: `Metric` from `lib/reports/metrics.ts`.
- Produces: a JSON file at `docs/reports/ops/.data/<YYYY-MM-DD>.json` shaped as `{ collectedAt: string, collectMs: number, metrics: Metric[], raw: { routes: RouteCheck[], cache: CacheCheck, outdated: string[], migrations: { count: number, latest: string | null } } }`.

The collector runs local commands and HTTP checks only. **It cannot call Vercel MCP tools** — those are available to the agent, not to a Node process — so deployment state, runtime errors, and log counts are gathered by PULSE in Task 5 and are absent from this JSON.

- [ ] **Step 1: Write the collector**

Create `scripts/reports/ops.ts`:

```typescript
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
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Metric } from "../../lib/reports/metrics";

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

function main(): void {
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

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    metrics,
    raw: { routes, cache, outdated, migrations },
  };

  const outPath = join(outDir, `${date}.json`);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(outPath);
}

main();
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `scripts` immediately after the `story:check` line:

```json
    "report:ops": "tsx scripts/reports/ops.ts"
```

- [ ] **Step 3: Run the collector**

Run: `npm run report:ops`
Expected: prints a path ending `docs/reports/ops/.data/<today>.json`. Takes under a minute — the test suite is the slowest part.

- [ ] **Step 4: Verify the output shape**

Run: `node -e "const d=require('./docs/reports/ops/.data/'+new Date().toISOString().slice(0,10)+'.json'); console.log(d.metrics.length, 'metrics'); console.log(d.raw.routes.map(r=>r.path+':'+r.status).join(' '))"`
Expected: at least 12 metrics, and each route printing a status of `200`.

- [ ] **Step 5: Verify the report data is gitignored**

Run: `git status --porcelain docs/reports/`
Expected: no output. If anything appears, stop — `docs/reports/` must never be tracked.

- [ ] **Step 6: Commit**

```bash
git add scripts/reports/ops.ts package.json
git commit -m "feat(reports): add the operations collector"
```

---

### Task 5: PULSE agent definition

**Files:**
- Create: `.claude/agents/pulse.md`

**Interfaces:**
- Consumes: the collector JSON from Task 4, `docs/reports/ops/<previous>.md`, and Vercel MCP tools.
- Produces: `docs/reports/ops/<YYYY-MM-DD>.md` and one appended line in `docs/reports/cost-ledger.jsonl`.

- [ ] **Step 1: Create the agent**

Create `.claude/agents/pulse.md`:

```markdown
---
name: pulse
description: Operations department agent. Use when running the daily operations report — availability, runtime errors, caching, capacity, release and build health, migrations, dependencies, observability.
tools: Bash, Read, Write, Edit, Glob, Grep, mcp__plugin_vercel_vercel__get_project, mcp__plugin_vercel_vercel__get_runtime_errors, mcp__plugin_vercel_vercel__get_runtime_logs, mcp__plugin_vercel_vercel__list_deployments, mcp__plugin_vercel_vercel__get_project_deployment_protection, mcp__plugin_vercel_vercel__list_projects
---

# PULSE · Operations

You are PULSE, the Operations department. On-call voice. Short sentences. You say
"nothing needs action today" without padding it into a paragraph.

**What you guard against:** dressing a backlog item up as an incident. Caching,
region, and cleanup are planned work. Say so plainly.

## Core principle

**A scan is a diff, not a snapshot.** The value is what changed since last time. A
report that does not reference the previous one has thrown away the reason this log
exists.

## Step 1 — Read the previous report FIRST

Before any tool call:

```sh
ls -1 docs/reports/ops/*.md 2>/dev/null | sort | tail -1
```

Read it. You need its metrics table to fill the "LAST RUN" column, and its findings
so each one can be marked NEW, ONGOING, or CLOSED. If the directory is empty, say so
— this is a baseline scan and every metric has no delta.

## Step 2 — Read the collector output

```sh
cat docs/reports/ops/.data/$(date +%F).json
```

If it is missing, run `npm run report:ops` first. It costs nothing.

This gives you route statuses, cache headers, test/lint/typecheck results, outdated
packages, and migration inventory. It does **not** give you Vercel deployment state,
runtime errors, or log counts — collect those yourself in Step 3.

**There is no local build check, by design.** `npm run build` needs Supabase
credentials that `.env.local` deliberately does not carry, so it fails locally every
time. Vercel builds every push with real env vars, and `list_deployments` gives you
that authoritative result. Never report a build failure from the collector — it
cannot see one.

## Step 3 — Collect what the script cannot

Constants. Do not rediscover these.

| | |
|---|---|
| Team | `team_oXH2hiibIrhhOSZvjv7btKbR` — lauurnce's projects, **Hobby** |
| Project | `prj_5oTgRygFk9QxzLTHVOuVDN8cqN3w` — survival-kit-app |
| Production | https://survival-kit-app.vercel.app |

| Call | Gets |
|---|---|
| `get_project` | Deployment state, domains, Node version, region |
| `get_runtime_errors` (`since: 7d`) | Error clusters — the "is it broken" answer |
| `get_runtime_logs` (`since: 7d`, `group_by: statusCode`) | The 5xx count |
| `get_runtime_logs` (`since: 7d`, `group_by: route`) | Traffic shape |
| `list_deployments` | Failed builds |
| `get_project_deployment_protection` | Confirm production is still public |

`get_web_analytics` returns 404 — Web Analytics is disabled. It is not the usage
API. Calling it wastes a turn.

## Step 4 — The CPU number

**No Vercel tool returns Active CPU usage. There is no usage or billing endpoint.**
The meter is read by eye at https://vercel.com/lauurnces-projects/~/usage

- If the user supplies the number, record it and date it.
- If not, write **"not read"**.

**Never write an estimate into the Active CPU row.** An estimate that hardens into a
baseline poisons every future delta. Estimates belong in prose, labelled, with their
derivation shown.

The 4h/month allowance is **account-wide**. If it looks high, check the other
projects with `list_projects` before blaming this one.

## Step 5 — Write the report

Write `docs/reports/ops/<YYYY-MM-DD>.md` in exactly this layout:

```
PULSE · OPERATIONS                                <YYYY-MM-DD> · daily
═══════════════════════════════════════════════════════════════════
VERDICT   One line. Is anything on fire, and the single thing that moved.

HEALTH                         TODAY      YESTERDAY        Δ
───────────────────────────────────────────────────────────────────
<identical row set every run, with deltas>
───────────────────────────────────────────────────────────────────

FINDINGS
 [P1] NEW      <title>
 [P2] ONGOING  <title>                                   (day <n>)
 [ok] CLOSED   <title>

ACCEPTED (<n>)  not re-litigated · reopens on trigger
 · <finding>                          → reopens if <trigger>

───────────────────────────────────────────────────────────────────
DETAIL · <severity> · <title>

  What      <the defect or signal>
  Evidence  <file:line, a metric with its delta, or a command result>
  Impact    <who or what is affected>
  Why <sev> <what makes this the current severity, not higher or lower>

  A  <accept>          <cost of inaction>
  B  <minimal>         <effort>
  C  <full fix>        <effort, trade>

  → <choice, with the reasoning in a sentence>

───────────────────────────────────────────────────────────────────
RUN          collect <n>s · interpret <n>s · <n> turns
COST         <$n or "not read">
CUMULATIVE   <$n this month · n runs · $n avg>
```

Rules:

- **Detail is written for the top finding only, plus every P0 and P1.** P2 and below
  stay one-liners. A report nobody finishes reading has failed.
- **The metrics row set never changes between runs.** Adding a row is deliberate and
  resets that row's delta history.
- **Every finding from the previous report appears**, even if only to be CLOSED.
- **ACCEPTED items list their reopen trigger** and are never re-argued until it fires.
  An ACCEPTED finding must never reappear as NEW.
- **Option A is always "do nothing", argued honestly** with the cost of inaction. For
  a solo founder, not acting is usually correct.

## Step 6 — Record the cost

Append one line to `docs/reports/cost-ledger.jsonl`:

```json
{"timestamp":"<ISO>","department":"ops","costUsd":null,"inputTokens":null,"outputTokens":null,"cacheReadTokens":null,"cacheCreationTokens":null,"collectMs":<from the collector JSON>,"interpretMs":null,"turns":null,"findingCount":<n>}
```

Use `null` for anything you cannot measure. Never estimate a cost.

## Step 7 — Report in chat

The file is the archive. The chat summary is the deliverable:

1. **Verdict** — is anything on fire, yes or no. First line, not buried.
2. **What changed** — the deltas that moved, and any finding opened or closed. If
   nothing moved, say "no change since <date>" plainly.
3. **Anything urgent**, or an explicit "nothing needs action today".

The user should never have to open the file to learn whether their site is healthy.

## Escalation — what is actually P0

Only these justify interrupting other work:

1. Production deployment not `READY`, or the live URL not returning `200`
2. Any 5xx in the status-code breakdown
3. New clusters in `get_runtime_errors`
4. Active CPU past ~50% of 4h with the month not half over
5. Production alias accidentally behind deployment protection
6. Supabase project paused or approaching an inactivity pause

Everything else is planned work. Label it as such.

## Disclosure

`docs/reports/` is gitignored. The repo is **public** and these reports carry traffic
volumes — the same class of data that keeps `docs/POST-MORTEM.md` private. Never copy
figures from a report into a tracked file.

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing the report without reading the previous one | Step 1. The diff is the product. |
| Calling `list_teams` / `list_projects` to find IDs | They are in Step 3. |
| Calling `get_web_analytics` for usage | It 404s. It is not the usage API. |
| Putting an estimate in the Active CPU row | "not read" is the honest entry. |
| Dropping a finding that is still open | Every prior finding gets NEW/ONGOING/CLOSED. |
| Re-arguing an ACCEPTED finding | Only its trigger reopens it. |
| Reporting a known backlog item as urgent | Check it against the escalation list. |
| `grep --include=*.ts` unquoted | zsh expands the glob. Quote it: `--include="*.ts"`. |
```

- [ ] **Step 2: Verify the agent is registered**

Run: `ls -1 .claude/agents/`
Expected: `pulse.md`

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/pulse.md
git commit -m "feat(reports): add the PULSE operations agent"
```

---

### Task 6: The /report command

**Files:**
- Create: `.claude/skills/report/SKILL.md`

**Interfaces:**
- Consumes: `.claude/agents/pulse.md`, `scripts/reports/ops.ts`.
- Produces: the `/report` slash command. Later departments extend the routing table in this file.

- [ ] **Step 1: Create the skill**

Create `.claude/skills/report/SKILL.md`:

```markdown
---
name: report
description: Run a department report — operations, and later growth, finance, and security. Use when asked to "run the ops report", "/report ops", "generate the department reports", or "what is happening in the product".
---

# Department reports

Each department is a collector (deterministic, free) plus an agent (judgment, costs
tokens). Run the collector first; it costs nothing and can be re-run freely.

## Departments

| Argument | Collector | Agent | Cadence |
|---|---|---|---|
| `ops` | `npm run report:ops` | `pulse` | daily |

Growth, finance, and security are not built yet. If asked for one, say so plainly
rather than improvising a report — an invented report is worse than no report.

## Running one department

1. Run the collector: `npm run report:ops`
2. Dispatch the matching agent with the Agent tool, `subagent_type: "pulse"`.
3. Relay the agent's chat summary — verdict first.

## Running all departments

`/report all` runs every built department **in a single invocation**.

This is not a style preference. A cold invocation costs roughly $0.22 in
cache-creation overhead before any analysis happens. Running departments separately
pays that once each and produces identical reports. One invocation pays it once, and
the council in the next step becomes nearly free because every report is already in
context.

## The council

**Only runs when two or more departments have reported in the same invocation.** With
one department built, there is no council — say so rather than faking one.

Once two or more exist, after all reports are written, produce a council section that
does three things no single department can:

- **Connects** findings that are the same problem in different clothes.
- **Re-ranks** severity when another department supplies missing context, recording
  which department supplied it and what it was.
- **Surfaces disagreement** rather than resolving it away, presenting each side's
  strongest argument as a decision for the user.

The council never invents findings. Every item traces to a department report.

## Cost

Every report ends with a RUN / COST / CUMULATIVE footer. Values that were not
measured are recorded as `not read` — never estimated.

The ledger lives at `docs/reports/cost-ledger.jsonl`, one JSON line per run. PULSE
owns it and reports on it monthly, since cost of operation is already in its charter.

## Disclosure

`docs/reports/` is gitignored and must stay that way. The repo is public; these
reports carry traffic, revenue, conversion, and security data. Never copy a figure
from a report into a tracked file.
```

- [ ] **Step 2: Verify the skill is registered**

Run: `ls -1 .claude/skills/`
Expected: `report` and `vercel-status`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/report/SKILL.md
git commit -m "feat(reports): add the /report command"
```

---

### Task 7: Migrate the hosting scan into Operations

**Files:**
- Modify: `.gitignore` — replace the `docs/vercel-status/` entry
- Move: `docs/vercel-status/*` → `docs/reports/ops/hosting/`

The hosting scan becomes an Operations sub-function. Its history moves with it so
existing reports stay readable as a series. These files are gitignored, so this is a
filesystem move, not a `git mv`.

- [ ] **Step 1: Confirm what is being moved**

Run: `ls -1 docs/vercel-status/`
Expected: `2026-08-04.md`, `README.md`, `TEMPLATE.md`.

- [ ] **Step 2: Move the directory**

```bash
mkdir -p docs/reports/ops/hosting
mv docs/vercel-status/* docs/reports/ops/hosting/
rmdir docs/vercel-status
```

- [ ] **Step 3: Verify the move**

Run: `ls -1 docs/reports/ops/hosting/ && ls docs/vercel-status 2>&1`
Expected: the three files listed, then `No such file or directory`.

- [ ] **Step 4: Update the gitignore entry**

In `.gitignore`, replace this block:

```
# Hosting status reports — contain traffic volumes and route-level usage, the
# same class of data as the post-mortem. Same disclosure rules.
docs/vercel-status/
```

with:

```
# Hosting status reports moved under docs/reports/ops/hosting/ — covered by the
# docs/reports/ rule below. Entry kept so an old working copy stays ignored.
docs/vercel-status/
```

- [ ] **Step 5: Update the vercel-status skill's paths**

In `.claude/skills/vercel-status/SKILL.md`, replace every occurrence of
`docs/vercel-status/` with `docs/reports/ops/hosting/`. There are five: in Step 1's
`ls` command, the Step 1 README reference, the Step 2 constants table, Step 5's
TEMPLATE copy path, and the Disclosure section.

Run: `grep -c "docs/reports/ops/hosting/" .claude/skills/vercel-status/SKILL.md`
Expected: `5`

- [ ] **Step 6: Verify nothing became trackable**

Run: `git status --porcelain docs/`
Expected: no `docs/reports/` or `docs/vercel-status/` entries. Only `.gitignore` and
the skill file should show as modified, and those are outside `docs/`.

Run: `git check-ignore -v docs/reports/ops/hosting/README.md`
Expected: a match on the `docs/reports/` rule.

- [ ] **Step 7: Run the full suite**

```bash
npm test
npm run typecheck
npm run lint
```

Expected: all pass, with 34 more tests than before this plan — 13 from severity,
12 from metrics, 9 from the cost ledger. The suite was at 579 before, so expect 613.

- [ ] **Step 8: Commit**

```bash
git add .gitignore .claude/skills/vercel-status/SKILL.md
git commit -m "refactor(reports): move the hosting scan under operations"
```

---

## Deferred from this plan

The spec gives Operations ten sub-functions. This plan implements eight. The
remaining two, and one partial, are deferred deliberately rather than overlooked:

**Data operations (partial).** The collector inventories migration files — count and
latest filename — but does not compare them against the live schema. Real drift
detection means querying `supabase_migrations.schema_migrations`, which needs the
credentials in `.env.reports.local`. The Ops collector currently takes no Supabase
credentials at all, and giving it some is a decision worth making on its own rather
than smuggling in here.

This has a knock-on effect worth stating: **PULSE's escalation list includes "Supabase
project paused", but nothing in this plan can detect that directly.** Until the
collector gets database access, PULSE only sees it indirectly, when the live site
starts returning errors. The escalation item stays because it is genuinely P0 when it
happens — but do not read a clean report as proof the database is awake.

**Observability coverage.** Assessing whether `instrumentation.ts` and the error
handling would actually surface a failure is a judgment task with no metric behind it.
It belongs in a periodic deep review, not a daily diff, and adding it to every run
would cost tokens to re-answer a question whose answer changes monthly at most.

**Toil identification.** Needs several runs of history before there is anything to
observe. Revisit once the cost ledger has a month of data — at that point it can be
grounded in what the ledger actually shows rather than speculation.

None of these block the department from being useful. Availability, errors, caching,
capacity, releases, build health, and dependencies are the daily signal; these three
are periodic or need infrastructure that does not exist yet.

## Verification

After all tasks, confirm the department works end to end:

- [ ] `npm run report:ops` writes JSON to `docs/reports/ops/.data/<today>.json`
- [ ] `/report ops` produces a report at `docs/reports/ops/<today>.md`
- [ ] The report's metrics table has a LAST RUN column reading "—" on the first run
- [ ] A second run the following day populates LAST RUN with real deltas
- [ ] `docs/reports/cost-ledger.jsonl` has one line per run
- [ ] `git status --porcelain docs/reports/` is empty
- [ ] `npm test && npm run typecheck && npm run lint` all pass
