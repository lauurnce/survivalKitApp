export type EmailKind = "receipt" | "welcome" | "expiry_warning" | "winback";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
