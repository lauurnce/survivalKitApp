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
  const rawCode = (typeof body?.code === "string" ? body.code : "").trim();
  // Exact alphabet match (same set grant-class generates from) rejects any
  // input containing SQL wildcard characters (%, _) before it ever reaches
  // the query, so switching ilike -> eq below can't be bypassed by a code
  // that "looks" 6 chars but smuggles wildcards.
  if (!/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/i.test(rawCode)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  const code = rawCode.toUpperCase();

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, subject_id, year_id, seat_cap, status, current_period_end")
    .eq("code", code)
    .maybeSingle();

  if (!cls || cls.status !== "active" || new Date(cls.current_period_end) < new Date()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // This count check is a fast-path convenience, NOT the enforcement — it
  // returns a clean 409 in the common case, but two concurrent requests can
  // both read a count below seat_cap and both pass it (classic check-then-act
  // race). The actual backstop is the `class_members_seat_cap_trigger`
  // Postgres trigger (see supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql),
  // which locks the parent classes row and re-checks the count inside the
  // insert's transaction, so it cannot be raced. If the trigger fires (race
  // lost against this pre-check), the insert below throws a Postgres error
  // with SQLSTATE P0001, which we map to the same 409 response below.
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
    // P0001 here means the class_members_seat_cap_trigger fired: this
    // request lost a race against another join that filled the last seat
    // after our count check above passed. Report it the same way as the
    // pre-check "full" case rather than a generic 500.
    if ((joinError as { code?: string }).code === "P0001") {
      return NextResponse.json({ error: "full" }, { status: 409 });
    }
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, subjectId: cls.subject_id, yearId: cls.year_id });
}
