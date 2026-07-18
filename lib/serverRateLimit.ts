import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Distributed fixed-window rate limiter backed by the check_rate_limit RPC.
// Unlike the in-memory maps in lib/rateLimit.ts, state is shared across all
// serverless instances and survives cold starts. Keys are namespaced by the
// caller, e.g. "feedback:ip:203.0.113.9".
//
// Fails open: a limiter outage must never take down the endpoint it protects.

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return client;
}

export interface ServerRateLimitOptions {
  max: number;
  windowSeconds: number;
}

export async function isServerRateLimited(
  key: string,
  { max, windowSeconds }: ServerRateLimitOptions
): Promise<boolean> {
  const { data, error } = await getClient().rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("check_rate_limit RPC error:", error);
    return false;
  }
  return data === true;
}
