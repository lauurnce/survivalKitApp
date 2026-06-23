import crypto from "crypto";

export const SUBJECT_AMOUNT = 5000;  // ₱50.00 — one subject
export const YEAR_AMOUNT = 30000;    // ₱300.00 — all subjects in the year

export async function createPaymongoLink(
  yearId: string,
  deviceId: string,
  successUrl: string,
  subjectId: string | null = null
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const amount = subjectId ? SUBJECT_AMOUNT : YEAR_AMOUNT;
  const description = subjectId
    ? "BSIT Survival Kit — Subject Subscription"
    : "BSIT Survival Kit — Year Subscription";
  const remarks = subjectId
    ? `year:${yearId} subject:${subjectId} device:${deviceId}`
    : `year:${yearId} device:${deviceId}`;

  // Idempotency key per (device, year, subject) — prevents duplicate charges on double-click
  const idempotencyKey = crypto
    .createHash("sha256")
    .update(`subscribe:${deviceId}:${yearId}:${subjectId ?? "year"}`)
    .digest("hex");

  const res = await fetch("https://api.paymongo.com/v1/links", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount,
          description,
          remarks,
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
