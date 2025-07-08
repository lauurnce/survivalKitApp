import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Liveness + database reachability for uptime monitors and the ops report.
//
// Public and unauthenticated by design, so it returns nothing but two fields:
// no error text, no hostnames, no versions. Failures are logged server-side.
// `db` is one of:
//   "ok"           — a one-row read through the service-role client succeeded
//   "error"        — the read returned an error
//   "timeout"      — no answer within DB_TIMEOUT_MS
//   "unconfigured" — Supabase env is missing on this deployment
// HTTP 200 when ok, 503 otherwise, so a monitor can alert on status alone.

export const dynamic = "force-dynamic";

type DbState = "ok" | "error" | "timeout" | "unconfigured";

const DB_TIMEOUT_MS = 2000;

// Anyone can call this, so each warm instance answers from a short-lived
// cached reading instead of sending every hit to the database. No rate
// limiter: the shared one is itself a database round trip.
const CACHE_MS = 10_000;
let cached: { state: DbState; at: number } | null = null;

async function checkDb(): Promise<DbState> {
  let supabase: ReturnType<typeof createServerClient>;
  try {
    supabase = createServerClient();
  } catch {
    return "unconfigured";
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, DB_TIMEOUT_MS);

  try {
    // `years` is a tiny public-reference table; head: true returns no rows.
    const { error } = await supabase
      .from("years")
      .select("id", { head: true })
      .limit(1)
      .abortSignal(controller.signal);
    if (timedOut) return "timeout";
    if (error) {
      console.error("[health] db check failed:", error.message);
      return "error";
    }
    return "ok";
  } catch (e) {
    if (timedOut) return "timeout";
    console.error("[health] db check threw:", e instanceof Error ? e.message : e);
    return "error";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const now = Date.now();
  if (!cached || now - cached.at >= CACHE_MS) {
    cached = { state: await checkDb(), at: now };
  }
  const db = cached.state;
  const ok = db === "ok";

  return NextResponse.json(
    { ok, db },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } }
  );
}
