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
