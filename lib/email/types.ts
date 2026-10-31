// Mirrors email_outbox_kind_check in supabase/migrations.
export const EMAIL_KINDS = ["receipt", "welcome", "expiry_warning", "winback", "reactivation"] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

/** Kinds a recipient can opt out of. Everything else is transactional. */
export const MARKETING_KINDS: ReadonlySet<EmailKind> = new Set<EmailKind>(["reactivation"]);

/** Receipts and access reminders: drained before any marketing mail. */
export const TRANSACTIONAL_KINDS: readonly EmailKind[] = EMAIL_KINDS.filter((k) => !MARKETING_KINDS.has(k));

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
  /** Extra headers, e.g. List-Unsubscribe on marketing mail. */
  headers?: Record<string, string>;
}
