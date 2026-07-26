import type { SupabaseClient } from "@supabase/supabase-js";
import { listRecentPaidLinks, parseBlockRemarks, type PaidLink } from "./paymongo";

// A paid PayMongo link that has NO matching active subscription in our DB.
// These are the "paid but not reflected" cases the admin must resolve.
export interface UnreflectedPayment {
  linkId: string;
  reference: string;
  amount: number;          // centavos
  description: string;
  paidAt: string | null;   // ISO
  yearId: string | null;
  subjectId: string | null;
  deviceId: string | null;
  userId: string | null;
  // Why it's flagged, for the admin UI.
  reason: "no_subscription" | "malformed_remarks" | "class_block_unfulfilled";
  hasLedgerRow: boolean;   // payment was recorded but subscription missing
}

// Compare recent PAID PayMongo links against our subscriptions. Returns the
// links whose buyer does NOT currently have an active subscription for what
// they paid for — i.e. money in, access not granted. Read-only.
export async function findUnreflectedPayments(
  supabase: SupabaseClient
): Promise<UnreflectedPayment[]> {
  const paidLinks = await listRecentPaidLinks();
  if (paidLinks.length === 0) return [];

  const now = new Date().toISOString();
  const linkIds = paidLinks.map((l) => l.linkId);

  // Which of these links already produced a ledger row (payment recorded)?
  const { data: ledgerRows } = await supabase
    .from("payments")
    .select("paymongo_link_id")
    .in("paymongo_link_id", linkIds);
  const ledgered = new Set(
    (ledgerRows ?? []).map((r: { paymongo_link_id: string }) => r.paymongo_link_id)
  );

  // Pull active subscriptions for the devices/users involved, then match in JS.
  const deviceIds = Array.from(
    new Set(paidLinks.map((l) => l.deviceId).filter((v): v is string => !!v))
  );
  const userIds = Array.from(
    new Set(paidLinks.map((l) => l.userId).filter((v): v is string => !!v))
  );

  // Class-rep block sales are fulfilled by creating a row in `classes`, NOT a
  // subscription, and their remarks carry no device:/user: token — so the
  // subscription matching below can never vouch for them. Resolve them against
  // `classes` by link id instead.
  const blockLinkIds = paidLinks
    .filter((l) => parseBlockRemarks(l.remarks) !== null)
    .map((l) => l.linkId)
    .filter(Boolean);

  let fulfilledBlocks = new Set<string>();
  if (blockLinkIds.length > 0) {
    const { data: classRows } = await supabase
      .from("classes")
      .select("paymongo_link_id")
      .in("paymongo_link_id", blockLinkIds);
    fulfilledBlocks = new Set(
      (classRows ?? []).map((r: { paymongo_link_id: string }) => r.paymongo_link_id)
    );
  }

  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("device_id, user_id, year_id, subject_id, status, current_period_end")
    .eq("status", "active")
    .gt("current_period_end", now)
    .or(
      [
        deviceIds.length ? `device_id.in.(${deviceIds.join(",")})` : null,
        userIds.length ? `user_id.in.(${userIds.join(",")})` : null,
      ]
        .filter(Boolean)
        .join(",") || "device_id.eq.__none__"
    );

  const subs = (activeSubs ?? []) as {
    device_id: string | null;
    user_id: string | null;
    year_id: string;
    subject_id: string | null;
  }[];

  // Does some active sub already grant what this link paid for? A year plan
  // (subject_id IS NULL) covers any subject in that year; a subject plan covers
  // only that subject. Match by device OR user (either identity grants access).
  function isReflected(link: PaidLink): boolean {
    return subs.some((s) => {
      const identityMatch =
        (link.deviceId && s.device_id === link.deviceId) ||
        (link.userId && s.user_id === link.userId);
      if (!identityMatch) return false;
      if (s.year_id !== link.yearId) return false;
      // Year plan covers everything in the year.
      if (s.subject_id === null) return true;
      // Subject plan must match the exact subject the link was for.
      return s.subject_id === link.subjectId;
    });
  }

  function flag(link: PaidLink, reason: UnreflectedPayment["reason"]): UnreflectedPayment {
    return {
      linkId: link.linkId,
      reference: link.reference,
      amount: link.amount,
      description: link.description,
      paidAt: link.paidAt ? link.paidAt.toISOString() : null,
      yearId: link.yearId,
      subjectId: link.subjectId,
      deviceId: link.deviceId,
      userId: link.userId,
      reason,
      hasLedgerRow: ledgered.has(link.linkId),
    };
  }

  const out: UnreflectedPayment[] = [];
  for (const link of paidLinks) {
    // Block sales first: they parse as device-less and would otherwise trip the
    // malformed-remarks check below even when perfectly fulfilled.
    if (parseBlockRemarks(link.remarks)) {
      if (!fulfilledBlocks.has(link.linkId)) {
        out.push(flag(link, "class_block_unfulfilled"));
      }
      continue;
    }
    if (!link.yearId || !link.deviceId) {
      out.push(flag(link, "malformed_remarks"));
      continue;
    }
    if (isReflected(link)) continue;
    out.push(flag(link, "no_subscription"));
  }

  // Most recent first.
  out.sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""));
  return out;
}
