import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaymongoWebhook,
  parseLinkRemarks,
  resolvePlan,
  periodEndFor,
  PLANS,
  SEMESTER_END,
} from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";
import { recordPayment } from "@/lib/payments";
import { generateClassCode } from "@/lib/classCode";

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

  // Class-rep block purchases carry a distinct remarks format and run
  // INSTEAD of the device-subscription path below — checked first because
  // parseLinkRemarks/resolvePlan assume a PLANS-keyed purchase and would
  // misparse a class purchase's dynamically computed amount.
  // remarks format: "block:1 year:<yearId> [subject:<subjectId>] seats:<n> rep:<repDeviceId>"
  // Built by app/api/class/checkout/route.ts.
  const classMatch = remarks.match(
    /^block:1 year:([^\s]+)(?: subject:([^\s]+))? seats:(\d+) rep:([^\s]+)/
  );
  if (classMatch) {
    const [, classYearId, classSubjectId, seatsStr, repDeviceId] = classMatch;
    const seats = parseInt(seatsStr, 10);

    if (!isUuid(classYearId) || (classSubjectId && !isUuid(classSubjectId))) {
      return NextResponse.json({ error: "Malformed remarks" }, { status: 400 });
    }
    if (typeof paidStatus !== "string" || paidStatus !== "paid") {
      return NextResponse.json({ ok: true, ignored: "status" });
    }

    // Recompute the expected amount server-side — never trust the client's
    // declared seat count without verifying the paid amount matches it.
    const BASE_SUBJECT_CENTAVOS = 79900,
      BASE_ALL_CENTAVOS = 99900,
      PER_SEAT_CENTAVOS = 5900,
      INCLUDED_SEATS = 11;
    const base = classSubjectId ? BASE_SUBJECT_CENTAVOS : BASE_ALL_CENTAVOS;
    const expectedAmount = base + Math.max(0, seats - INCLUDED_SEATS) * PER_SEAT_CENTAVOS;
    if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
      console.error(`Class webhook underpayment: got ${paidAmount}, expected >= ${expectedAmount}`);
      return NextResponse.json({ error: "Amount too low" }, { status: 400 });
    }

    const supabase = createServerClient();
    const paidAtSeconds = resource.attributes.paid_at;
    const paidAt = typeof paidAtSeconds === "number" ? new Date(paidAtSeconds * 1000) : new Date();

    // Ledger row first — never grant access without a recorded payment,
    // mirroring recordPayment's invariant in lib/payments.ts.
    const { error: paymentError } = await supabase.from("payments").insert({
      paymongo_link_id: linkId,
      device_id: repDeviceId,
      year_id: classYearId,
      subject_id: classSubjectId ?? null,
      amount: paidAmount,
      currency: "PHP",
      paid_at: paidAt.toISOString(),
    });
    if (paymentError) {
      if ((paymentError as { code?: string }).code === "23505") {
        return NextResponse.json({ ok: true, deduped: true });
      }
      console.error("Class payment insert failed:", paymentError.message);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    let code = generateClassCode();
    let created = false;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const { error } = await supabase.from("classes").insert({
        code,
        name: "Untitled class", // rep can rename later if a rename feature ships; not in this plan's scope
        subject_id: classSubjectId ?? null,
        year_id: classYearId,
        rep_device_id: repDeviceId,
        seat_cap: seats,
        status: "active",
        current_period_end: SEMESTER_END.toISOString(),
        paymongo_link_id: linkId,
      });
      if (error?.code === "23505") {
        code = generateClassCode();
        continue;
      }
      if (error) {
        console.error("Class insert failed:", error.message);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
      }
      created = true;
    }
    if (!created) {
      return NextResponse.json({ error: "Could not generate a unique class code" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // remarks format: "year:<id> [subject:<id>] device:<id> [user:<id>] [plan:<key>]"
  const parsed = parseLinkRemarks(remarks);

  if (!parsed.yearId || !parsed.deviceId) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }

  const yearId = parsed.yearId;
  const subjectId = parsed.subjectId;
  const deviceId = parsed.deviceId;
  const userId = parsed.userId && isUuid(parsed.userId) ? parsed.userId : null;

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

  // Resolve the tier from the link's plan token (legacy links infer from
  // scope) and validate the paid amount covers it. Reject only UNDERpayments
  // (e.g. a tampered ₱1 link trying to unlock ₱299 of content) — a payer who
  // paid the correct amount or more must always be granted access, so a price
  // change, promo, or manually-created link never strands a real payment.
  // Still require a numeric amount; never grant on a missing field.
  const plan = resolvePlan(parsed.plan, subjectId);
  const expectedAmount = PLANS[plan].amount;
  if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
    console.error(`Webhook underpayment: got ${paidAmount}, expected >= ${expectedAmount} (${plan})`);
    return NextResponse.json({ error: "Amount too low" }, { status: 400 });
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
      periodEnd: periodEndFor(plan),
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
