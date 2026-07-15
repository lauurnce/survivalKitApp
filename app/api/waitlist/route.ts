import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getDeviceType } from "@/lib/deviceType";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacyPolicy";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";

// IP-based rate limiter — bounded map to prevent unbounded memory growth
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const MAX_MAP_SIZE = 10_000;

// Field length caps — columns are unbounded `text`, so guard server-side
const MAX_EMAIL = 254;
const MAX_NAME = 120;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();

  // Prune map if it gets too large to prevent memory leak
  if (rateLimitMap.size >= MAX_MAP_SIZE) {
    for (const [k, timestamps] of rateLimitMap) {
      if (timestamps.every((t) => now - t >= WINDOW_MS)) rateLimitMap.delete(k);
      if (rateLimitMap.size < MAX_MAP_SIZE * 0.8) break;
    }
  }

  const timestamps = (rateLimitMap.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_PER_WINDOW) return true;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, source, willing_to_pay, needs_capstone, year_label, subject_title, module_title, screen_width, max_touch_points } = body;

  // Prefer the signed device cookie over the client-supplied device_id in the
  // body, so a signup can't be attributed to a device_id the caller doesn't
  // own. Falls back to the body value only when there's no cookie yet
  // (first-time visitor) — same pattern as /api/events and /api/progress.
  const cookieStore = await cookies();
  const cookieDeviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const bodyDeviceId = (body as { device_id?: unknown })?.device_id;
  const device_id = cookieDeviceId ?? bodyDeviceId;

  if (!email || !name || !device_id || !source) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (source !== "coming_soon" && source !== "paywall") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof device_id !== "string" ||
    email.length > MAX_EMAIL ||
    name.length > MAX_NAME ||
    device_id.length > 100 ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  if (willing_to_pay != null && !["yes", "no", "maybe"].includes(willing_to_pay)) {
    return NextResponse.json({ error: "Invalid willing_to_pay" }, { status: 400 });
  }

  if (needs_capstone != null && typeof needs_capstone !== "boolean") {
    return NextResponse.json({ error: "Invalid needs_capstone" }, { status: 400 });
  }

  if (isRateLimited(getRateLimitKey(req))) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device_type = getDeviceType(ua, {
    screenWidth: typeof screen_width === "number" ? screen_width : null,
    maxTouchPoints: typeof max_touch_points === "number" ? max_touch_points : null,
  });

  const supabase = createServerClient();

  const { error } = await supabase.from("waitlist").upsert(
    {
      email,
      name,
      device_id,
      source,
      willing_to_pay: willing_to_pay ?? null,
      needs_capstone: needs_capstone ?? null,
      device_type,
      year_label: typeof year_label === "string" ? year_label.slice(0, 100) : null,
      subject_title: typeof subject_title === "string" ? subject_title.slice(0, 200) : null,
      module_title: typeof module_title === "string" ? module_title.slice(0, 200) : null,
      // RA 10173 audit trail: which policy version was live when this
      // voluntary submission (our lawful basis) happened.
      privacy_policy_version: PRIVACY_POLICY_VERSION,
    },
    { onConflict: "email,source,subject_title", ignoreDuplicates: true }
  );

  if (error) console.error("[waitlist] upsert error:", error.message);

  return NextResponse.json({ success: true });
}
