import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as
    | { requestId?: string; decision?: string }
    | null;
  const { requestId, decision } = body ?? {};
  if (!requestId || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, rep_device_id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cls.rep_device_id !== deviceId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: reqRow } = await supabase
    .from("class_join_requests")
    .select("id, device_id, status")
    .eq("id", requestId)
    .eq("class_id", cls.id)
    .maybeSingle();

  if (!reqRow) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (decision === "reject") {
    const { error } = await supabase
      .from("class_join_requests")
      .update({ status: "rejected", decided_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Approve: create the class_members row. The class_members_seat_cap_trigger
  // (supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql)
  // enforces the cap here — map its P0001 error to a clear 409, not a generic
  // 500. Only flip the request to 'approved' after this insert succeeds.
  const { error: memberError } = await supabase
    .from("class_members")
    .upsert({ class_id: cls.id, device_id: reqRow.device_id }, { onConflict: "class_id,device_id" });

  if (memberError) {
    if ((memberError as { code?: string }).code === "P0001") {
      return NextResponse.json({ error: "full" }, { status: 409 });
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const { error: statusError } = await supabase
    .from("class_join_requests")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", requestId);
  if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
