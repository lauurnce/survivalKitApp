// One-click opt-out for every non-transactional email (today: the finals
// reactivation mail). Receipts and access-expiry notices are transactional and
// are not gated by this, matching CAN-SPAM's transactional carve-out.
//
// The link carries the user id plus an HMAC of it, so it works without a login
// (a requirement: the reader may be signed out, or on another device) and
// cannot be forged to unsubscribe someone else. It never expires: an
// unsubscribe link must keep working long after the send (CAN-SPAM: 30 days
// minimum; we keep it indefinitely).

import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canonicalUrl } from "@/lib/appOrigin";
import { signingSecretCandidates } from "@/lib/auth/signingSecrets";
import { isUuid } from "@/lib/validation";

export const UNSUBSCRIBE_PATH = "/api/email/unsubscribe";

function candidates(): string[] {
  return signingSecretCandidates("EMAIL_UNSUBSCRIBE_SECRET", "EMAIL_UNSUBSCRIBE_SECRET_PREVIOUS");
}

// Domain-separated so a signature minted here can never be replayed as some
// other HMAC in this codebase, even if a secret were ever shared.
function hmac(secret: string, userId: string): string {
  return createHmac("sha256", secret).update(`email-unsubscribe:${userId}`).digest("base64url");
}

export function signUnsubscribeToken(userId: string): string {
  return hmac(candidates()[0], userId);
}

/** True only for a well-formed user id with a signature from a current secret. */
export function verifyUnsubscribeToken(userId: string | null, token: string | null): boolean {
  if (!userId || !token || !isUuid(userId)) return false;
  try {
    for (const secret of candidates()) {
      const expected = Buffer.from(hmac(secret, userId));
      const given = Buffer.from(token);
      if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Absolute one-click unsubscribe URL. Throws when EMAIL_UNSUBSCRIBE_SECRET is
 * missing or short: a marketing email that cannot carry a working opt-out
 * must not be sent at all.
 */
export function unsubscribeUrl(userId: string): string {
  const qs = new URLSearchParams({ u: userId, t: signUnsubscribeToken(userId) });
  return `${canonicalUrl(UNSUBSCRIBE_PATH)}?${qs.toString()}`;
}

/** RFC 8058 headers so Gmail/Yahoo/Outlook show their native unsubscribe button. */
export function listUnsubscribeHeaders(url: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export type UnsubscribeSource = "link" | "one_click";

/** Idempotent: unsubscribing twice keeps the first timestamp. */
export async function recordUnsubscribe(
  supabase: SupabaseClient,
  userId: string,
  source: UnsubscribeSource
): Promise<void> {
  const { error } = await supabase
    .from("email_unsubscribes")
    .upsert({ user_id: userId, source }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

/**
 * Whether the user has opted out. Throws on a read error so a caller about to
 * send marketing mail fails closed instead of mailing someone who opted out.
 */
export async function isUnsubscribed(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("email_unsubscribes")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}
