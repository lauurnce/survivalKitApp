// lib/email/outbox.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/client";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail } from "@/lib/email/templates";
import type { EmailKind, RenderedEmail } from "./types";

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

function render(kind: EmailKind, p: Record<string, unknown>): RenderedEmail {
  const planLabel = String(p.planLabel ?? "your plan");
  const ends = p.accessEndsAt ? new Date(String(p.accessEndsAt)) : new Date();
  const url = String(p.url ?? "https://survival-kit-app.vercel.app/account");
  switch (kind) {
    case "receipt": return receiptEmail({ planLabel, amountCentavos: Number(p.amountCentavos ?? 0), accessEndsAt: ends, returnUrl: url });
    case "welcome": return welcomeEmail({ planLabel, returnUrl: url });
    case "expiry_warning": return expiryWarningEmail({ planLabel, accessEndsAt: ends, renewUrl: url });
    case "winback": return winbackEmail({ planLabel, renewUrl: url });
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
    const result = await sendEmail(String(row.to_email), render(row.kind as EmailKind, payload));
    const attempts = Number(row.attempts ?? 0) + 1;
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
