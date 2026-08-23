/**
 * PII inventory and erasure completeness.
 *
 * Two questions from the charter's privacy sub-function: what personal data
 * exists and where, and whether account deletion actually reaches all of it.
 * Both are answerable from the schema model plus the source of
 * lib/deleteAccount.ts, so neither needs a database connection.
 *
 * RETENTION_REGISTER is ACCEPTED pushed down into the collector. Some data is
 * kept deliberately — the privacy policy commits to retaining payment records
 * for dispute resolution — and a registered table is excluded from the residue
 * rather than re-argued every week. Requiring both a reason and the policy
 * section that authorises it stops "we keep this" from becoming a shrug.
 *
 * The summary line names counts, never tables. Which specific table holds
 * un-erased identity is exactly the kind of detail that belongs in the private
 * report and nowhere else.
 */

import type { TableRecord } from "./migrationSchema";

/**
 * Columns that carry identity. `email` and the ip-shaped names are direct
 * personal data; user_id and device_id are the two identity keys this product
 * uses, and device_id matters because the entitlement model is device-first.
 */
export const IDENTITY_COLUMN_PATTERN = /^(.*_)?(user_id|device_id|email|ip)$|^(client_|remote_)?ip(_address)?$/i;

export interface IdentityTable {
  table: string;
  identityColumns: string[];
}

export interface RetentionEntry {
  /** Why the data is kept despite an erasure request. */
  reason: string;
  /** The privacy policy section that authorises keeping it. */
  policySection: string;
}

/**
 * Tables whose identity data is retained on purpose. An entry here is a
 * standing decision, not an oversight, and keeps the table out of the residue.
 */
export const RETENTION_REGISTER: Record<string, RetentionEntry> = {
  payments: {
    reason:
      "Ledger rows survive erasure so disputes and accounting obligations can be met; the user_id link is severed so no personal data remains attached.",
    policySection: "Privacy policy Section 7 — retention",
  },
};

export function inventoryIdentityTables(tables: TableRecord[]): IdentityTable[] {
  return tables
    .map((table) => ({
      table: table.name,
      identityColumns: table.columns.filter((column) => IDENTITY_COLUMN_PATTERN.test(column)),
    }))
    .filter((row) => row.identityColumns.length > 0)
    .sort((a, b) => a.table.localeCompare(b.table));
}

const TABLE_NAME = /^[a-z][a-z0-9_]*$/;

/**
 * Table names that lib/deleteAccount.ts touches, read out of its source.
 *
 * Deliberately literal: it matches `from("x")` and any single-string helper
 * call such as `unlink("x")`. That over-matches slightly — a helper taking a
 * non-table string could appear — which is why the result is filtered to
 * plausible table names and then intersected with the real schema by the
 * caller. Over-matching produces a missed residue rather than a false one, and
 * the standing assertion in Task 12 catches the case that matters.
 */
export function extractDeletionTargets(source: string): string[] {
  const found = new Set<string>();
  for (const match of source.matchAll(/(?:from|unlink|purge|erase)\(\s*["']([^"']+)["']\s*\)/g)) {
    const name = match[1].trim().toLowerCase();
    if (TABLE_NAME.test(name)) found.add(name);
  }
  return [...found].sort();
}

export function erasureResidue(
  inventory: IdentityTable[],
  deletionTargets: string[],
  retention: Record<string, RetentionEntry> = RETENTION_REGISTER
): IdentityTable[] {
  const covered = new Set(deletionTargets);
  return inventory.filter((row) => !covered.has(row.table) && !(row.table in retention));
}

const TABLE_WIDTH = 24;
const IDENTITY_WIDTH = 34;
const ERASURE_WIDTH = 10;
const RULE_WIDTH = TABLE_WIDTH + IDENTITY_WIDTH + ERASURE_WIDTH;

export function renderPrivacyTable(
  inventory: IdentityTable[],
  deletionTargets: string[],
  retention: Record<string, RetentionEntry> = RETENTION_REGISTER
): string {
  const covered = new Set(deletionTargets);

  const header =
    "TABLE".padEnd(TABLE_WIDTH) +
    "IDENTITY".padEnd(IDENTITY_WIDTH) +
    "ERASURE".padEnd(ERASURE_WIDTH);

  const body = inventory.map((row) => {
    const state = covered.has(row.table)
      ? "deleted"
      : row.table in retention
        ? "retained"
        : "RESIDUE";
    return (
      row.table.padEnd(TABLE_WIDTH) +
      row.identityColumns.join(", ").padEnd(IDENTITY_WIDTH) +
      state.padEnd(ERASURE_WIDTH)
    );
  });

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function privacySummaryLine(inventory: IdentityTable[], residue: IdentityTable[]): string {
  const noun = inventory.length === 1 ? "identity table" : "identity tables";
  if (residue.length === 0) {
    return `PRIVACY       ${inventory.length} ${noun} · erasure complete`;
  }
  return `PRIVACY       ${inventory.length} ${noun} · ${residue.length} not reached by erasure`;
}
