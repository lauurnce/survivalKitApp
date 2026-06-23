import crypto from "crypto";

export async function createPaymongoLink(
  yearId: string,
  deviceId: string,
  successUrl: string
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.paymongo.com/v1/links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: 5000, // ₱50.00 in centavos
          description: "BSIT Survival Kit — Monthly Subscription",
          remarks: `year:${yearId} device:${deviceId}`,
          redirect: { success: successUrl, failed: successUrl },
        },
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail ?? "Unknown error";
    throw new Error(`PayMongo error: ${detail}`);
  }

  return {
    checkoutUrl: json.data.attributes.checkout_url as string,
    linkId: json.data.id as string,
  };
}

// Reject webhooks whose signed timestamp is older/newer than this window to
// blunt replay attacks (PayMongo's recommended tolerance).
const WEBHOOK_TOLERANCE_SECONDS = 300;

export function verifyPaymongoWebhook(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return false;

  // Header format: "t=<timestamp>,te=<hmac>,li=<hmac>"
  const parts = Object.fromEntries(
    signatureHeader.split(",").map(part => part.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const teHmac = parts["te"];

  if (!timestamp || !teHmac) return false;

  // Reject stale/replayed signatures before doing the constant-time compare.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(teHmac));
  } catch {
    return false;
  }
}
