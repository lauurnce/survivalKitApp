import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { isValidClassCodeShape } from "@/lib/classCode";

// This route also does a code lookup (`.eq("code", code)`), so it shares the
// same class-code brute-force surface as app/api/class/join/route.ts and
// app/api/class/[code]/request/route.ts (887M-combination Math.random-
// generated space, defended only by rate limiting). A modest limit here
// closes that gap without breaking the waiting-room's ~3s poll cadence
// (a legitimate poller hits ~20 requests/min; 30/min leaves headroom).
const limiter = createRateLimiter(30);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  // Rate-limited requests still get the same { status: "none" } shape as
  // every other "nothing to see here" case below, so this endpoint never
  // leaks information (existence of a code, rate-limit state, etc.) via a
  // differently-shaped response.
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ status: "none" }, { status: 429 });
  }

  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) {
    return NextResponse.json({ status: "none" });
  }

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ status: "none" });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ status: "none" });

  const { data: reqRow } = await supabase
    .from("class_join_requests")
    .select("status")
    .eq("class_id", cls.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  return NextResponse.json({ status: reqRow?.status ?? "none" });
}
