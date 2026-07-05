import crypto from "crypto";

export const SUBJECT_AMOUNT = 4900;  // ₱49.00 — one subject
export const YEAR_AMOUNT = 29900;    // ₱299.00 — all subjects in the year

export async function createPaymongoLink(
  yearId: string,
  deviceId: string,
  successUrl: string,
  subjectId: string | null = null,
  userId?: string
): Promise<{ checkoutUrl: string; linkId: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const amount = subjectId ? SUBJECT_AMOUNT : YEAR_AMOUNT;
  const description = subjectId
    ? "BSIT Survival Kit — Subject Subscription"
    : "BSIT Survival Kit — Year Subscription";
  let remarks = subjectId
    ? `year:${yearId} subject:${subjectId} device:${deviceId}`
    : `year:${yearId} device:${deviceId}`;
  if (userId) remarks += ` user:${userId}`;

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

// ── Reconciliation: list paid links from PayMongo to catch payments that never
//    reflected (webhook dropped/rejected). Used by the admin reconcile view. ──

export interface PaidLink {
  linkId: string;
  amount: number;        // centavos, as PayMongo reports it on the link
  description: string;
  reference: string;     // human-friendly reference_number for support lookups
  paidAt: Date | null;
  remarks: string;
  // Parsed from remarks (same format the webhook parses). null when absent.
  yearId: string | null;
  subjectId: string | null;
  deviceId: string | null;
  userId: string | null;
}

// Parse the remarks string we attach at checkout. Mirrors the webhook's regexes
// so reconcile and live-grant agree on what a link is for.
export function parseLinkRemarks(remarks: string): {
  yearId: string | null;
  subjectId: string | null;
  deviceId: string | null;
  userId: string | null;
} {
  const year = remarks.match(/year:([^\s]+)/);
  const subject = remarks.match(/subject:([^\s]+)/);
  const device = remarks.match(/device:([^\s]+)/);
  const user = remarks.match(/user:([^\s]+)/);
  return {
    yearId: year ? year[1] : null,
    subjectId: subject ? subject[1] : null,
    deviceId: device ? device[1] : null,
    userId: user ? user[1] : null,
  };
}

// PayMongo's Links API has NO "list all links" endpoint — GET /v1/links only
// resolves a single link by reference_number. So to enumerate paid activity we
// list PAYMENTS (GET /v1/payments, which IS a real list endpoint), then resolve
// each paid payment back to its Link (by reference) to read our remarks.

interface PaymentRow {
  reference: string;       // external_reference_number == the link's reference
  amount: number;          // centavos
  description: string;
  paidAt: Date | null;
}

// Resolve a single Link by its reference_number. Returns the link id + remarks,
// or null if PayMongo has no such link. The only supported way to read remarks.
// PayMongo resolves references at GET /v1/links/{reference}; the query-param
// form (?reference_number=) is not a real route and 404s.
export async function getLinkByReference(
  reference: string
): Promise<{ linkId: string; remarks: string; amount: number; status: string } | null> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(
    `https://api.paymongo.com/v1/links/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Basic ${encoded}` } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  // This endpoint returns an array under data even for a single reference.
  const row = Array.isArray(json?.data) ? json.data[0] : json?.data;
  if (!row?.id) return null;
  return {
    linkId: row.id as string,
    remarks: (row.attributes?.remarks ?? "") as string,
    amount: typeof row.attributes?.amount === "number" ? row.attributes.amount : 0,
    status: (row.attributes?.status ?? "") as string,
  };
}

// List recent PAID payments from PayMongo, then resolve each back to its Link
// to read our remarks. Returns the same PaidLink shape the reconcile matcher
// expects. Bounded: lists up to `maxPages` pages of payments and resolves each
// paid one. Live secret key only — never expose this to the client.
export async function listRecentPaidLinks(maxPages = 3): Promise<PaidLink[]> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error("PAYMONGO_SECRET_KEY is not set");
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  // 1. Collect recent paid payments (real list endpoint).
  const paidPayments: PaymentRow[] = [];
  let after: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL("https://api.paymongo.com/v1/payments");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${encoded}` },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const detail = json?.errors?.[0]?.detail ?? `HTTP ${res.status}`;
      throw new Error(`PayMongo payments list error: ${detail}`);
    }
    const json = await res.json();
    const rows = (json?.data ?? []) as Array<{
      id: string;
      attributes: {
        status?: string;
        amount?: number;
        description?: string;
        paid_at?: number;
        external_reference_number?: string;
      };
    }>;

    if (rows.length === 0) break;

    for (const row of rows) {
      const a = row.attributes;
      if (a.status !== "paid") continue;
      const reference = a.external_reference_number ?? "";
      if (!reference) continue; // can't tie back to a link without it
      paidPayments.push({
        reference,
        amount: typeof a.amount === "number" ? a.amount : 0,
        description: a.description ?? "",
        paidAt: typeof a.paid_at === "number" ? new Date(a.paid_at * 1000) : null,
      });
    }

    after = rows[rows.length - 1]?.id ?? null;
    if (!after || rows.length < 100) break; // last page
  }

  // 2. Resolve each unique reference to its Link to read remarks.
  const seen = new Set<string>();
  const paid: PaidLink[] = [];
  for (const p of paidPayments) {
    if (seen.has(p.reference)) continue;
    seen.add(p.reference);

    let link: Awaited<ReturnType<typeof getLinkByReference>> = null;
    try {
      link = await getLinkByReference(p.reference);
    } catch {
      link = null; // network hiccup resolving one link shouldn't fail the batch
    }
    const remarks = link?.remarks ?? "";
    const parsed = parseLinkRemarks(remarks);
    paid.push({
      linkId: link?.linkId ?? "",
      amount: p.amount || link?.amount || 0,
      description: p.description,
      reference: p.reference,
      paidAt: p.paidAt,
      remarks,
      ...parsed,
    });
  }

  return paid;
}

// Reject webhooks whose signed timestamp is older/newer than this window to
// blunt replay attacks (PayMongo's recommended tolerance).
const WEBHOOK_TOLERANCE_SECONDS = 300;

export function verifyPaymongoWebhook(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return false;

  // Header format: "t=<timestamp>,te=<hmac>,li=<hmac>"
  // Split only on the FIRST "=" so HMAC values containing "=" aren't truncated.
  const parts = Object.fromEntries(
    signatureHeader.split(",").map(part => {
      const idx = part.indexOf("=");
      return [part.slice(0, idx), part.slice(idx + 1)] as [string, string];
    })
  );
  const timestamp = parts["t"];
  // PayMongo signs TEST events in `te` and LIVE events in `li`; the other
  // field is not valid for our secret. Accept a match on either.
  const candidates = [parts["te"], parts["li"]].filter(Boolean);

  if (!timestamp || candidates.length === 0) return false;

  // Reject stale/replayed signatures before doing the constant-time compare.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > WEBHOOK_TOLERANCE_SECONDS) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return candidates.some((candidate) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate));
    } catch {
      return false;
    }
  });
}
