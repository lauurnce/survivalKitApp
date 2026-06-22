import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";

// Brute-force protection backed by Supabase so state is shared across all
// Vercel function instances (the old in-process Map reset on every cold start).
// 5 failed attempts per IP locks out for 15 minutes.

async function isLockedOut(ip: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase.rpc("check_login_lockout", { p_ip: ip });
  return !!data;
}

async function recordFailure(ip: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("record_login_attempt", { p_ip: ip });
}

async function clearAttempts(ip: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("clear_login_attempts", { p_ip: ip });
}

export async function POST(req: NextRequest) {
  // x-real-ip is set by Vercel to the verified client IP and is not attacker-controllable.
  // Fallback to the last x-forwarded-for entry (also Vercel-appended) rather than the first,
  // which an attacker can spoof to bypass the lockout.
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";

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
  return res;
}
