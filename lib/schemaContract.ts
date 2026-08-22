// The schema this code requires, and a pure checker for it (no IO).
//
// Exists because deploying ahead of a migration is not a theoretical risk
// here: signup writes profiles.school_type, and a write cannot degrade the
// way a read can — you cannot upsert into a column that does not exist. The
// tolerant read in profileRow.ts keeps a lagging schema from blanking the
// account page; this contract is what stops the deploy happening at all.
//
// Scope is deliberately columns only. A missing aggregate key degrades to
// "not read" on the admin dashboard by design, which is a reporting gap the
// operator can see — not a silent data loss a student pays for.

import { REQUIRED_PROFILE_COLUMNS } from "./profileRow";

export interface TableContract {
  table: string;
  columns: readonly string[];
}

export const SCHEMA_CONTRACT: readonly TableContract[] = [
  { table: "profiles", columns: REQUIRED_PROFILE_COLUMNS },
];

export type ColumnProbe = (table: string, column: string) => Promise<"present" | "missing">;

export interface SchemaFinding {
  table: string;
  column: string;
}

export interface SchemaReport {
  ok: boolean;
  checked: number;
  missing: SchemaFinding[];
}

/**
 * Checks every column in the contract.
 *
 * Deliberately does not catch: if a probe cannot reach the database, the
 * caller must fail loudly. A gate that reports "healthy" when it could not
 * look would green-light exactly the deploy it exists to stop.
 */
export async function checkSchema(
  contract: readonly TableContract[],
  probe: ColumnProbe,
): Promise<SchemaReport> {
  const missing: SchemaFinding[] = [];
  let checked = 0;

  for (const { table, columns } of contract) {
    for (const column of columns) {
      checked += 1;
      if ((await probe(table, column)) === "missing") {
        missing.push({ table, column });
      }
    }
  }

  return { ok: missing.length === 0, checked, missing };
}

export function formatSchemaReport(report: SchemaReport): string {
  if (report.ok) {
    return `Schema OK — ${report.checked} columns present.`;
  }
  const lines = report.missing.map((m) => `  missing: ${m.table}.${m.column}`);
  return [
    `Schema BEHIND — ${report.missing.length} of ${report.checked} columns absent.`,
    ...lines,
    "",
    "Apply the pending migrations in supabase/migrations/ before deploying.",
  ].join("\n");
}
