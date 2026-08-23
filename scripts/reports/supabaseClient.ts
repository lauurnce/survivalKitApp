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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply: (query: any) => any = (q) => q
): Promise<number | null> {
  const base = client.from(table).select("*", { count: "exact", head: true });
  const { count, error } = await apply(base);
  if (error) {
    console.error(`Counting ${table} failed: ${error.message}`);
    return null;
  }
  return typeof count === "number" ? count : null;
}
