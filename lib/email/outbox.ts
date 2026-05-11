// lib/email/outbox.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/client";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail, reactivationEmail } from "@/lib/email/templates";
import { isUnsubscribed, listUnsubscribeHeaders, unsubscribeUrl } from "@/lib/email/unsubscribe";
import { MARKETING_KINDS, type EmailKind, type RenderedEmail } from "./types";
import { canonicalUrl } from "@/lib/appOrigin";
import { taggedUrl, withUtm } from "@/lib/utm";

const MAX_ATTEMPTS = 5;

export interface EnqueueInput {
  kind: EmailKind; userId: string; toEmail: string;
  payload: Record<string, unknown>; scopeKey: string; sendAfter?: Date;
}

// scope_key rides inside payload so the schema's unique index can reach it
// without a dedicated column.
export async function enqueue(
  supabase: SupabaseClient, input: EnqueueInput
): Promise<{ enqueued: boolean; deduped: boolean }> {
  const { error } = await supabase.from("email_outbox").insert({
    kind: input.kind,
    user_id: input.userId,
    to_email: input.toEmail,
    payload: { ...input.payload, scope_key: input.scopeKey },
    status: "pending",
    send_after: (input.sendAfter ?? new Date()).toISOString(),
  });
  if (error) {
    if ((error as { code?: string }).code === "23505") return { enqueued: false, deduped: true };
    throw new Error(error.message);
  }
  return { enqueued: true, deduped: false };
}

// Tagged at render time rather than at enqueue, so rows already sitting in
// the queue go out tagged too. A malformed stored URL is sent as-is: an
// untagged link beats an email the drain cannot render.
function lifecycleUrl(kind: EmailKind, raw: string): string {
  try {
    return withUtm(raw, { source: "lifecycle", medium: "email", campaign: kind });
  } catch {
    return raw;
  }
}

export const REACTIVATION_CAMPAIGN = "finals-dec-2026";

// Throws when a marketing email cannot carry a working unsubscribe link
// (EMAIL_UNSUBSCRIBE_SECRET unset or short). drain() records that as a failed
// attempt rather than sending without an opt-out.
function render(kind: EmailKind, p: Record<string, unknown>, userId: string): RenderedEmail {
  const planLabel = String(p.planLabel ?? "your plan");
  const ends = p.accessEndsAt ? new Date(String(p.accessEndsAt)) : new Date();
  const url = lifecycleUrl(kind, String(p.url ?? canonicalUrl("/account")));
  switch (kind) {
    case "receipt": return receiptEmail({ planLabel, amountCentavos: Number(p.amountCentavos ?? 0), accessEndsAt: ends, returnUrl: url });
    case "welcome": return welcomeEmail({ planLabel, returnUrl: url });
    case "expiry_warning": return expiryWarningEmail({ planLabel, accessEndsAt: ends, renewUrl: url });
    case "winback": return winbackEmail({ planLabel, renewUrl: url });
    case "reactivation": {
      // "/" is where the enter event records UTM tags.
      const campaign = String(p.campaign ?? REACTIVATION_CAMPAIGN);
      const unsub = unsubscribeUrl(userId);
      return {
        ...reactivationEmail({
          ctaUrl: taggedUrl("/", { source: "reactivation", medium: "email", campaign }),
          unsubscribeUrl: unsub,
        }),
        headers: listUnsubscribeHeaders(unsub),
      };
    }
  }
}

// Sends every due pending row. Never throws: the cron reports counts, and a
// permanently failing row parks at status 'failed' where it stays queryable.
export async function drain(supabase: SupabaseClient, limit = 50): Promise<{ sent: number; failed: number }> {
  const { data } = await supabase
    .from("email_outbox").select("*")
    .eq("status", "pending")
    .lte("send_after", new Date().toISOString())
    .order("send_after", { ascending: true })
    .limit(limit);

  let sent = 0, failed = 0;
  for (const row of data ?? []) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const kind = row.kind as EmailKind;
    const attempts = Number(row.attempts ?? 0) + 1;

    let result: { ok: boolean; error?: string };
    try {
      // Re-checked at send time: someone may opt out after being queued.
      // A failed lookup throws, so marketing mail fails closed.
      if (MARKETING_KINDS.has(kind) && await isUnsubscribed(supabase, String(row.user_id))) {
        await supabase.from("email_outbox").update({
          status: "failed", attempts, last_error: "skipped: unsubscribed",
        }).eq("id", row.id);
        continue;
      }
      result = await sendEmail(String(row.to_email), render(kind, payload, String(row.user_id)), {
        idempotencyKey: `email-outbox/${row.id}`,
      });
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
    if (result.ok) {
      sent++;
      await supabase.from("email_outbox").update({ status: "sent", attempts, sent_at: new Date().toISOString() }).eq("id", row.id);
    } else {
      failed++;
      await supabase.from("email_outbox").update({
        status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
        attempts, last_error: result.error ?? "unknown",
      }).eq("id", row.id);
    }
  }
  return { sent, failed };
}
