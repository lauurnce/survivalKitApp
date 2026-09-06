import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import {
  getLinkByReference,
  getPaymentById,
  parseLinkRemarks,
  resolvePlan,
  periodEndFor,
  PLANS,
} from "@/lib/paymongo";
import { recordPayment } from "@/lib/payments";
import { isUuid } from "@/lib/validation";

// Manually grant access for a paid PayMongo purchase that never reflected.
// The admin supplies only an identifier — either a legacy Link
// reference_number (pre-2026-09-03, Links API) or a Payment id ("pay_xxx",
// Checkout Sessions, PayMongo's replacement) — and we resolve it straight
// from PayMongo (the only supported lookup for either), so the grant is
// driven by PayMongo's truth (status=paid, real amount/remarks), never by
// client-supplied amounts. recordPayment is idempotent, so re-granting an
// already-recorded purchase is a safe no-op.
export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { identifier?: string } | null;
  const identifier = body?.identifier;
  if (!identifier || typeof identifier !== "string") {
    return NextResponse.json({ error: "identifier required" }, { status: 400 });
  }

  let resolved: { linkId: string; remarks: string; amount: number; status: string } | null;
  try {
    if (identifier.startsWith("pay_")) {
      const payment = await getPaymentById(identifier);
      resolved = payment && { linkId: identifier, ...payment };
    } else {
      resolved = await getLinkByReference(identifier);
    }
  } catch (err) {
    console.error("reconcile lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not reach PayMongo" }, { status: 502 });
  }
  if (!resolved) {
    return NextResponse.json({ error: "Payment not found at PayMongo" }, { status: 404 });
  }
  if (resolved.status !== "paid") {
    return NextResponse.json({ error: "Payment is not paid" }, { status: 400 });
  }

  const { yearId, subjectId, deviceId, userId, plan: planToken } = parseLinkRemarks(resolved.remarks);
  if (!yearId || !deviceId || !isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Remarks are malformed; cannot grant" }, { status: 422 });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ error: "Remarks are malformed; cannot grant" }, { status: 422 });
  }

  const paidAmount = resolved.amount;
  const plan = resolvePlan(planToken, subjectId);
  const expected = PLANS[plan].amount;
  if (paidAmount < expected) {
    return NextResponse.json(
      { error: `Underpaid: ${paidAmount} < ${expected}` },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  try {
    const { recorded, deduped } = await recordPayment(supabase, {
      linkId: resolved.linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt: new Date(),
      userId: userId && isUuid(userId) ? userId : null,
      periodEnd: periodEndFor(plan),
    });
    return NextResponse.json({ ok: true, recorded, deduped });
  } catch (err) {
    console.error("reconcile grant failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Grant failed" }, { status: 500 });
  }
}
