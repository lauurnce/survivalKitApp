import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Distributed fixed-window rate limiter backed by the check_rate_limit RPC.
// Unlike the in-memory maps in lib/rateLimit.ts, state is shared across all
// serverless instances and survives cold starts. Keys are namespaced by the
// caller, e.g. "feedback:ip:203.0.113.9".
//
// Fails closed by default: allowing requests through would remove abuse
// protection from the route for the duration of the outage. Callers opt
// out per call with onFailure: "allow" when that trade-off is wrong for
// them — either because blocking is worse than the abuse risk (checkout,
// in /api/subscribe) or because a silent block would permanently lose data
// with no retry (the reads/readers counters in /api/events, "mark done" in
// /api/progress, device-cookie issuance in /api/device — see the 34h outage
// documented in docs/reports/ops/2026-09-19.md).

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
  // Behavior when the limiter backend itself errors: "reject" (the default,
  // fail closed) or "allow" (fail open) for revenue-critical routes.
  onFailure?: "allow" | "reject";
}

export async function isServerRateLimited(
  key: string,
  { max, windowSeconds, onFailure = "reject" }: ServerRateLimitOptions
): Promise<boolean> {
  const { data, error } = await getClient().rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("check_rate_limit RPC error:", error);
    return onFailure !== "allow";
  }
  return data === true;
}
