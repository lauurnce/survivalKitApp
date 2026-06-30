import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import { getLinkByReference, parseLinkRemarks, SUBJECT_AMOUNT, YEAR_AMOUNT } from "@/lib/paymongo";
import { recordPayment } from "@/lib/payments";
import { isUuid } from "@/lib/validation";

// Manually grant access for a paid PayMongo link that never reflected. The
// admin supplies only the payment's reference_number; we resolve the link from
// PayMongo (the only supported lookup) so the grant is driven by PayMongo's
// truth (status=paid, real amount/remarks), never by client-supplied amounts.
// recordPayment is idempotent, so re-granting an already-recorded link is a
// safe no-op.
export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { reference?: string } | null;
  const reference = body?.reference;
  if (!reference || typeof reference !== "string") {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  let link: Awaited<ReturnType<typeof getLinkByReference>>;
  try {
    link = await getLinkByReference(reference);
  } catch (err) {
    console.error("reconcile link lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not reach PayMongo" }, { status: 502 });
  }
  if (!link) {
    return NextResponse.json({ error: "Link not found at PayMongo" }, { status: 404 });
  }
  if (link.status !== "paid") {
    return NextResponse.json({ error: "Link is not paid" }, { status: 400 });
  }

  const { yearId, subjectId, deviceId, userId } = parseLinkRemarks(link.remarks);
  if (!yearId || !deviceId || !isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Link remarks are malformed; cannot grant" }, { status: 422 });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ error: "Link remarks are malformed; cannot grant" }, { status: 422 });
  }

  const paidAmount = link.amount;
  const expected = subjectId ? SUBJECT_AMOUNT : YEAR_AMOUNT;
  if (paidAmount < expected) {
    return NextResponse.json(
      { error: `Underpaid: ${paidAmount} < ${expected}` },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  try {
    const { recorded, deduped } = await recordPayment(supabase, {
      linkId: link.linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt: new Date(),
      userId: userId && isUuid(userId) ? userId : null,
    });
    return NextResponse.json({ ok: true, recorded, deduped });
  } catch (err) {
    console.error("reconcile grant failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Grant failed" }, { status: 500 });
  }
}
