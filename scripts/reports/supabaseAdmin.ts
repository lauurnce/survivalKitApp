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
