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
