import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Distributed fixed-window rate limiter backed by the check_rate_limit RPC.
// Unlike the in-memory maps in lib/rateLimit.ts, state is shared across all
// serverless instances and survives cold starts. Keys are namespaced by the
// caller, e.g. "feedback:ip:203.0.113.9".
//
// Fails closed when the limiter cannot make a decision: the protected
// database routes cannot complete during that outage anyway, while allowing
// requests would remove abuse protection from public endpoints. Revenue-
// critical routes opt out per call with onFailure: "allow" so a limiter
// outage never blocks paying customers.

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
