import { NextRequest, NextResponse } from "next/server";
import { verifyPaymongoWebhook } from "@/lib/paymongo";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature") ?? "";

  if (!verifyPaymongoWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    data: {
      attributes: {
        type: string;
        data: {
          attributes: {
            remarks: string;
            id: string;
          };
        };
      };
    };
  };

  const eventType = event.data.attributes.type;
  if (eventType !== "link.payment.paid") {
    // Acknowledge non-payment events without action
    return NextResponse.json({ ok: true });
  }

  const remarks = event.data.attributes.data.attributes.remarks ?? "";
  const linkId = event.data.attributes.data.attributes.id;

  // remarks format: "year:<yearId> device:<deviceId>"
  const yearMatch = remarks.match(/year:([^\s]+)/);
  const deviceMatch = remarks.match(/device:([^\s]+)/);

  if (!yearMatch || !deviceMatch) {
    return NextResponse.json({ error: "Missing remarks" }, { status: 400 });
  }

  const yearId = yearMatch[1];
  const deviceId = deviceMatch[1];

  // Grant 31 days of access
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 31);

  const supabase = createServerClient();
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
