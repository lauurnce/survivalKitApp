import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";

// Class-code brute-forcing is defended against ONLY by this rate limit — the
// code generator (app/api/admin/grant-class/route.ts) uses Math.random over a
// 31^6 ≈ 887M space, which is acceptable specifically because lookups here
// are throttled. Do not remove or weaken this.
const limiter = createRateLimiter(10);

export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) {
    return NextResponse.json({ error: "no_device" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code;
  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, subject_id, year_id, seat_cap, status, current_period_end")
    .ilike("code", code)
    .maybeSingle();

  if (!cls || cls.status !== "active" || new Date(cls.current_period_end) < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("class_members")
    .select("id", { count: "exact", head: true })
    .eq("class_id", cls.id);

  if ((count ?? 0) >= cls.seat_cap) {
    return NextResponse.json({ error: "full" }, { status: 409 });
  }

  // Trust only the signed device cookie for the write — never a client-
  // supplied deviceId — mirroring app/api/subscribe/route.ts's invariant.
  const { error: joinError } = await supabase
    .from("class_members")
    .upsert({ class_id: cls.id, device_id: deviceId }, { onConflict: "class_id,device_id" });

  if (joinError) {
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subjectId: cls.subject_id, yearId: cls.year_id });
}
