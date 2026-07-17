import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { isValidClassCodeShape } from "@/lib/classCode";

// Mirrors app/api/class/join/route.ts's rate-limit reasoning: this is the
// only throttle standing between a 6-char code (887M-combination space,
// Math.random-generated) and brute-force guessing. Do not remove or weaken.
const limiter = createRateLimiter(10);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, status, current_period_end")
    .eq("code", code)
    .maybeSingle();

  if (!cls || cls.status !== "active" || new Date(cls.current_period_end) < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Check for an existing request first so an already-approved device skips
  // straight to 'approved' without creating a duplicate pending row.
  const { data: existing } = await supabase
    .from("class_join_requests")
    .select("status")
    .eq("class_id", cls.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing?.status === "approved") {
    return NextResponse.json({ status: "approved" });
  }

  const { error } = await supabase
    .from("class_join_requests")
    .upsert(
      { class_id: cls.id, device_id: deviceId, status: "pending", decided_at: null },
      { onConflict: "class_id,device_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "pending" });
}
