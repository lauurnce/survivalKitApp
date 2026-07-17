import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { randomUUID } from "crypto";
import { generateClassCode } from "@/lib/classCode";

export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    name?: string;
    subjectId?: string;
    yearId?: string;
    repDeviceId?: string;
    seatCap?: number;
    amount?: number;
    periodEnd?: string;
  };
  const { name, subjectId, yearId, repDeviceId, amount, periodEnd } = body;
  const seatCap = body.seatCap ?? 50;

  if (
    !name ||
    !isUuid(subjectId) ||
    !isUuid(yearId) ||
    !isUuid(repDeviceId) ||
    typeof amount !== "number" ||
    amount <= 0 ||
    !periodEnd
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServerClient();
  const linkId = `block-${randomUUID()}`;

  // Ledger row first — same invariant as recordPayment in lib/payments.ts:
  // never grant access without a recorded payment.
  const { error: paymentError } = await supabase.from("payments").insert({
    paymongo_link_id: linkId,
    device_id: repDeviceId,
    year_id: yearId,
    subject_id: subjectId,
    amount,
    currency: "PHP",
    paid_at: new Date().toISOString(),
  });
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Retry on code collision — 6-char alphabet space is large, but don't loop
  // forever on a bug; 5 attempts is generous.
  let code = generateClassCode();
  let classId: string | null = null;
  for (let attempt = 0; attempt < 5 && !classId; attempt++) {
    const { data, error } = await supabase
      .from("classes")
      .insert({
        code,
        name,
        subject_id: subjectId,
        year_id: yearId,
        rep_device_id: repDeviceId,
        seat_cap: seatCap,
        status: "active",
        current_period_end: periodEnd,
        paymongo_link_id: linkId,
      })
      .select("id")
      .single();
    if (error?.code === "23505") {
      code = generateClassCode();
      continue;
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    classId = data.id;
  }
  if (!classId) {
    return NextResponse.json({ error: "Could not generate a unique class code" }, { status: 500 });
  }

  return NextResponse.json({ code, classId });
}
