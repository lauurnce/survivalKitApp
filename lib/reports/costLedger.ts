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
  /** How many of `runs` had a measured (non-null) cost. */
  measured: number;
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
    measured: measured.length,
    totalUsd,
    avgUsd: measured.length > 0 ? totalUsd / measured.length : 0,
    findings: inMonth.reduce((sum, e) => sum + e.findingCount, 0),
  };
}

/**
 * Renders the report's `CUMULATIVE` line, ready to paste verbatim.
 *
 * PULSE cannot measure its own run — the step that records cost always
 * appends `costUsd: null` for the run currently writing the report — so an
 * unguarded summary would print "$0.00 this month" and read as "this was
 * free" when the truth is "nobody measured it". Render `not read` whenever
 * nothing in the month has a measured cost, the same convention the Active
 * CPU and COST rows use, rather than let a silent zero pass for a real
 * number.
 */
export function formatCumulative(summary: MonthSummary): string {
  if (summary.measured === 0) return "CUMULATIVE   not read";

  const total = `$${summary.totalUsd.toFixed(2)}`;
  const avg = `$${summary.avgUsd.toFixed(2)}`;
  return `CUMULATIVE   ${total} this month · ${summary.runs} runs · ${avg} avg`;
}
