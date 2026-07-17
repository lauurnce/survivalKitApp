import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

// Deliberately NOT rate-limited, unlike the POST routes that look up codes:
// this route is not a brute-force oracle — it returns { status: "none" }
// uniformly for nonexistent classes AND for valid classes where this device
// has no request, so an attacker learns nothing per guess (the real oracle,
// POST, is throttled at 10/min). A limiter here would also break the target
// scenario: classmates poll every ~3s (20 req/min each) and campus WiFi puts
// many students behind one NAT'd IP, so even two simultaneous pollers would
// collide with any modest per-IP limit.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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
    .select("id, subject_id, year_id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ status: "none" });

  const { data: reqRow } = await supabase
    .from("class_join_requests")
    .select("status")
    .eq("class_id", cls.id)
    .eq("device_id", deviceId)
    .maybeSingle();

  const status = reqRow?.status ?? "none";

  // Only leak the class's scope once approved — the classmate needs it to
  // redirect into the right subject/year, but there's no reason to expose it
  // earlier (matches this route's existing "leak nothing per guess" stance).
  if (status === "approved") {
    return NextResponse.json({
      status,
      subjectId: cls.subject_id,
      yearId: cls.year_id,
    });
  }

  return NextResponse.json({ status });
}
