import { Resend } from "resend";
import type { RenderedEmail } from "./types";

// The one place the sender identity is written. mail.<domain> rather than the
// root so a spam complaint here never damages the apex domain's reputation.
export const FROM = "BSIT Survival Kit <noreply@mail.tryi2i.com>";

export interface SendResult { ok: boolean; id?: string; error?: string }

// Never throws. Callers sit on the payment path, where an email problem must
// never surface as a failed purchase — so failure is a value, not an exception.
export async function sendEmail(to: string, email: RenderedEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  try {
    const { data, error } = await new Resend(key).emails.send({
      from: FROM, to, subject: email.subject, html: email.html, text: email.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
