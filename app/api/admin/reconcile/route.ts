import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { createServerClient } from "@/lib/supabase/server";
import { parseLinkRemarks, SUBJECT_AMOUNT, YEAR_AMOUNT } from "@/lib/paymongo";
import { recordPayment } from "@/lib/payments";
import { isUuid } from "@/lib/validation";

// Manually grant access for a paid PayMongo link that never reflected. The
// admin supplies only the linkId; we re-fetch the link from PayMongo so the
// grant is driven by PayMongo's truth (status=paid, real amount/remarks), never
// by client-supplied amounts. recordPayment is idempotent, so re-granting an
// already-recorded link is a safe no-op.
export async function POST(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { linkId?: string } | null;
  const linkId = body?.linkId;
  if (!linkId || typeof linkId !== "string") {
    return NextResponse.json({ error: "linkId required" }, { status: 400 });
  }

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  // Re-fetch the single link from PayMongo and verify it is genuinely paid.
  const res = await fetch(`https://api.paymongo.com/v1/links/${encodeURIComponent(linkId)}`, {
    headers: { Authorization: `Basic ${encoded}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Link not found at PayMongo" }, { status: 404 });
  }
  const json = await res.json();
  const attrs = json?.data?.attributes ?? {};
  if (attrs.status !== "paid") {
    return NextResponse.json({ error: "Link is not paid" }, { status: 400 });
  }

  const { yearId, subjectId, deviceId, userId } = parseLinkRemarks(attrs.remarks ?? "");
  if (!yearId || !deviceId || !isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Link remarks are malformed; cannot grant" }, { status: 422 });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ error: "Link remarks are malformed; cannot grant" }, { status: 422 });
  }

  const paidAmount = typeof attrs.amount === "number" ? attrs.amount : 0;
  const expected = subjectId ? SUBJECT_AMOUNT : YEAR_AMOUNT;
  if (paidAmount < expected) {
    return NextResponse.json(
      { error: `Underpaid: ${paidAmount} < ${expected}` },
      { status: 400 }
    );
  }

  const paidAtSec = attrs.payments?.[0]?.data?.attributes?.paid_at;
  const paidAt = typeof paidAtSec === "number" ? new Date(paidAtSec * 1000) : new Date();

  const supabase = createServerClient();
  try {
    const { recorded, deduped } = await recordPayment(supabase, {
      linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt,
      userId: userId && isUuid(userId) ? userId : null,
    });
    return NextResponse.json({ ok: true, recorded, deduped });
  } catch (err) {
    console.error("reconcile grant failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Grant failed" }, { status: 500 });
  }
}
