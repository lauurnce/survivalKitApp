import { NextRequest, NextResponse } from "next/server";
import { verifyPaymongoWebhook, SUBJECT_AMOUNT, YEAR_AMOUNT } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { recordPayment } from "@/lib/payments";

export const runtime = "nodejs";

// PAYMONGO_LIVEMODE=true → only accept live payments; false/unset → only test.
// Decoupled from NODE_ENV so preview/staging can still receive test webhooks.
const EXPECTED_LIVEMODE = process.env.PAYMONGO_LIVEMODE === "true";

// Bound unauthenticated flood against the signature-verification work. Real
// PayMongo deliveries are well under this; it only stops abuse.
const limiter = createRateLimiter(60);

interface PaymongoEvent {
  data: {
    attributes: {
      type: string;
      livemode: boolean;
      data: {
        id: string;
        attributes: {
          remarks: string;
          amount?: number;
          status?: string;
          // Some PayMongo resources also expose the id under attributes.
          id?: string;
          // PayMongo emits paid_at as Unix seconds on payment resources.
          // Untrusted display metadata only — never gates access.
          paid_at?: number;
        };
      };
    };
  };
}

export async function POST(req: NextRequest) {
  if (limiter.check(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature") ?? "";

  // Verify signature on the raw body before any parsing.
  if (!verifyPaymongoWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Body is signed at this point, but still guard against malformed JSON so a
  // bad payload returns 400 instead of an unhandled 500.
  let event: PaymongoEvent;
  try {
    event = JSON.parse(rawBody) as PaymongoEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type: eventType, livemode } = event.data.attributes;

  // livemode mismatch: acknowledge (2xx) so PayMongo stops retrying, but don't act.
  if (livemode !== EXPECTED_LIVEMODE) {
    return NextResponse.json({ ok: true, ignored: "livemode" });
  }

  if (eventType !== "link.payment.paid") {
    // Acknowledge non-payment events without action
    return NextResponse.json({ ok: true });
  }

  const resource = event.data.attributes.data;
  const remarks = resource.attributes.remarks ?? "";
  // PayMongo nests the resource id at data.attributes.data.id; fall back to the
  // attributes-level id for resources that expose it there.
  const linkId = resource.id ?? resource.attributes.id;
  const paidAmount = resource.attributes.amount;
  const paidStatus = resource.attributes.status;

  if (!linkId) {
    return NextResponse.json({ error: "Missing link id" }, { status: 400 });
  }

  // remarks format:
  //   subject plan: "year:<yearId> subject:<subjectId> device:<deviceId>"
  //   year plan:    "year:<yearId> device:<deviceId>"
  const yearMatch = remarks.match(/year:([^\s]+)/);
  const subjectMatch = remarks.match(/subject:([^\s]+)/);
  const deviceMatch = remarks.match(/device:([^\s]+)/);
  const userMatch = remarks.match(/user:([^\s]+)/);

  if (!yearMatch || !deviceMatch) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }

  const yearId = yearMatch[1];
  const subjectId = subjectMatch ? subjectMatch[1] : null;
  const deviceId = deviceMatch[1];
  const userId = userMatch && isUuid(userMatch[1]) ? userMatch[1] : null;

  if (!isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Malformed remarks" }, { status: 400 });
  }
  if (subjectId !== null && !isUuid(subjectId)) {
    return NextResponse.json({ error: "Malformed remarks" }, { status: 400 });
  }

  // Fail closed: require an explicit "paid" status. A missing/non-string status
  // must never unlock content.
  if (typeof paidStatus !== "string" || paidStatus !== "paid") {
    return NextResponse.json({ ok: true, ignored: "status" });
  }

  // Validate paid amount matches the plan: ₱49 subject, ₱299 year. Require a
  // numeric amount — never substitute the expected amount for a missing field.
  const expectedAmount = subjectId ? SUBJECT_AMOUNT : YEAR_AMOUNT;
  if (typeof paidAmount !== "number" || paidAmount !== expectedAmount) {
    console.error(`Webhook amount mismatch: got ${paidAmount}, expected ${expectedAmount}`);
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  const supabase = createServerClient();

  const paidAtSeconds = resource.attributes.paid_at;
  const paidAt =
    typeof paidAtSeconds === "number"
      ? new Date(paidAtSeconds * 1000)
      : new Date();

  try {
    const { deduped } = await recordPayment(supabase, {
      linkId,
      deviceId,
      yearId,
      subjectId,
      amount: paidAmount,
      paidAt,
      userId,
    });
    if (deduped) return NextResponse.json({ ok: true, deduped: true });
  } catch (err) {
    // Log details server-side; return a generic message so internal DB errors
    // aren't disclosed to the caller.
    console.error("recordPayment failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
