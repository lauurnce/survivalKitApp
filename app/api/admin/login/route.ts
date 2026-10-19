import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  createSessionToken,
  legacySessionCookieClearHeader,
  SESSION_COOKIE,
} from "@/lib/auth/adminSession";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";
import { createServerClient } from "@/lib/supabase/server";

// Brute-force protection backed by Supabase so state is shared across all
// Vercel function instances (the old in-process Map reset on every cold start).
// 5 failed attempts per IP locks out for 15 minutes.
//
// The lockout must fail closed: if check_login_lockout errors, treating the
// IP as not locked would allow unlimited password guesses for the length of
// the outage. Instead we fall back to the generic distributed limiter at the
// same budget (5 attempts / 15 min per IP), which itself fails closed — so
// when both are down, login answers 429 rather than opening brute force.

const LOCKOUT_FALLBACK = { max: 5, windowSeconds: 15 * 60 } as const;

async function isLockedOut(ip: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("check_login_lockout", { p_ip: ip });
    if (!error) return !!data;
    console.error("check_login_lockout RPC error:", error);
  } catch (err) {
    console.error("check_login_lockout threw:", err instanceof Error ? err.message : err);
  }
  return isServerRateLimited(`admin-login:ip:${ip}`, LOCKOUT_FALLBACK);
}

async function recordFailure(ip: string): Promise<void> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.rpc("record_login_attempt", { p_ip: ip });
    if (error) console.error("record_login_attempt RPC error:", error);
  } catch (err) {
    console.error("record_login_attempt threw:", err instanceof Error ? err.message : err);
  }
}

async function clearAttempts(ip: string): Promise<void> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.rpc("clear_login_attempts", { p_ip: ip });
    if (error) console.error("clear_login_attempts RPC error:", error);
  } catch (err) {
    console.error("clear_login_attempts threw:", err instanceof Error ? err.message : err);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (await isLockedOut(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!checkAdminPassword(password)) {
    await recordFailure(ip);
    // Uniform delay to resist timing analysis at the network level
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await clearAttempts(ip);
  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);
  // Drop any pre-path-change Path=/admin cookie so a single session cookie
  // remains. Appended after cookies.set, which rewrites Set-Cookie headers.
  res.headers.append("Set-Cookie", legacySessionCookieClearHeader());
  return res;
}
