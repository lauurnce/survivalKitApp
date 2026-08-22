/**
 * Schema preflight.
 *
 * Asserts the live database actually has the columns this code requires,
 * and exits non-zero if it does not. Run it before promoting a deploy.
 *
 * The failure it exists to prevent: signup writes profiles.school_type, and
 * a write cannot degrade gracefully — deploy ahead of the migration and every
 * new account silently loses its school. Reads are made tolerant separately
 * (see lib/profileRow.ts) so a schema gap never blanks the account page, but
 * tolerance is a safety net, not permission to skip the migration.
 *
 * Credentials come from .env.reports.local, the same production-credentials
 * file the report collectors use. tsx transpiles to CommonJS, so no
 * top-level await.
 */

import {
  SCHEMA_CONTRACT,
  checkSchema,
  formatSchemaReport,
  type ColumnProbe,
} from "../../lib/schemaContract";
import { createReportsClient } from "../reports/supabaseAdmin";

// Postgres: "column ... does not exist". Anything else is a real failure and
// must not be mistaken for an absent column.
const UNDEFINED_COLUMN = "42703";

function makeProbe(): ColumnProbe {
  const client = createReportsClient();
  return async (table, column) => {
    // limit(0) so this never pulls student data — we only want the parse to
    // succeed or fail.
    const { error } = await client.from(table).select(column).limit(0);
    if (!error) return "present";
    if (error.code === UNDEFINED_COLUMN) return "missing";
    throw new Error(`probing ${table}.${column}: ${error.code} ${error.message}`);
  };
}

async function main(): Promise<void> {
  const report = await checkSchema(SCHEMA_CONTRACT, makeProbe());
  console.log(formatSchemaReport(report));
  if (!report.ok) process.exitCode = 1;
}

main().catch((e: unknown) => {
  // An unreachable database is a failed check, never a passed one.
  console.error("Schema check could not run:", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
