/**
 * Cost ledger reporter.
 *
 * Deterministic. Reads docs/reports/cost-ledger.jsonl, summarizes the
 * current Asia/Manila month with the same tested `readCostLedger` /
 * `summarizeMonth` / `formatCumulative` helpers from costLedger.ts, and
 * prints a single ready-to-paste CUMULATIVE line. PULSE pastes this output
 * verbatim into the report footer — it never hand-sums the ledger itself.
 * That is exactly the arithmetic this architecture exists to keep off the
 * agent.
 */

import { join } from "node:path";
import { formatCumulative, readCostLedger, summarizeMonth } from "../../lib/reports/costLedger";

const REPO_ROOT = join(__dirname, "..", "..");

function main(): void {
  const ledgerPath = join(REPO_ROOT, "docs", "reports", "cost-ledger.jsonl");

  // Manila calendar month, not UTC — consistent with how ops.ts derives its
  // Manila date. Between midnight and 8am Manila, UTC and PH disagree on the
  // calendar day, which can flip the month near a month boundary.
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const month = date.slice(0, 7);

  const entries = readCostLedger(ledgerPath);
  const summary = summarizeMonth(entries, month);

  console.log(formatCumulative(summary));
}

main();
