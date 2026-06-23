import { NextRequest, NextResponse } from "next/server";
import { verifyPaymongoWebhook, SUBSCRIPTION_AMOUNT } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

export const runtime = "nodejs";

// Process live events in prod, test events otherwise. Prevents a test-mode
// payment (or a misconfigured secret) from unlocking real content.
const EXPECTED_LIVEMODE = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature") ?? "";

  // Verify signature on the raw body before any parsing.
  if (!verifyPaymongoWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
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
          };
        };
      };
    };
  };

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

  // Defense in depth: if the payload reports an amount/status, it must match
  // what we expect. Underpayment or a non-paid status must not grant access.
  if (typeof paidAmount === "number" && paidAmount !== SUBSCRIPTION_AMOUNT) {
    console.error(
      `Webhook amount mismatch: got ${paidAmount}, expected ${SUBSCRIPTION_AMOUNT}`
    );
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }
  if (typeof paidStatus === "string" && paidStatus !== "paid") {
    return NextResponse.json({ ok: true, ignored: "status" });
  }

  // remarks format: "year:<yearId> device:<deviceId>"
  const yearMatch = remarks.match(/year:([^\s]+)/);
  const deviceMatch = remarks.match(/device:([^\s]+)/);

  if (!yearMatch || !deviceMatch) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }

  const yearId = yearMatch[1];
  const deviceId = deviceMatch[1];

  // remarks is attacker-influenced (set at link creation). Only year_id has to
  // be a UUID (FK to years); device_id is a client UUID we also enforce. Reject
  // anything that doesn't match so a malformed/injected value can't be written.
  if (!isUuid(yearId) || !isUuid(deviceId)) {
    return NextResponse.json({ error: "Malformed remarks" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Idempotency: each PayMongo link is single-use, so a replayed webhook
  // carries a linkId we've already processed. Skip it rather than resetting
  // current_period_end (which would silently extend access on every replay).
  const { data: existingLink } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("paymongo_link_id", linkId)
    .limit(1)
    .maybeSingle();

  if (existingLink) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  // Grant 31 days of access
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 31);

  const { error } = await supabase.from("subscriptions").upsert(
    {
      device_id: deviceId,
      year_id: yearId,
      paymongo_link_id: linkId,
      status: "active",
      current_period_end: currentPeriodEnd.toISOString(),
    },
    { onConflict: "device_id,year_id" }
  );

  if (error) {
    console.error("Subscription upsert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
