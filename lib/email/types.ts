export type EmailKind = "receipt" | "welcome" | "expiry_warning" | "winback" | "reactivation";

/** Kinds a recipient can opt out of. Everything else is transactional. */
export const MARKETING_KINDS: ReadonlySet<EmailKind> = new Set<EmailKind>(["reactivation"]);

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
  /** Extra headers, e.g. List-Unsubscribe on marketing mail. */
  headers?: Record<string, string>;
}
