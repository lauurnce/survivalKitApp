// Copy for the reader's "you already paid" status. Pure, so the exact strings
// are pinned by tests and shared by the reader, the modules list, and the
// subject list.

export type PlanScope = "year" | "subject" | "class";

export interface PlanLike {
  scope: PlanScope;
  /** ISO current_period_end; null only under the UNLOCK_ALL dev flag. */
  until: string | null;
}

/**
 * "Dec 1, 2026". Access dates are shown on the Manila calendar — that is where
 * the term runs and where the grant was priced — regardless of the device's
 * timezone, so the reader and the receipt agree.
 */
export function formatAccessDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(d);
}

/**
 * One line, e.g.
 *   subject plan → "Unlocked · Computer Programming 1 · access until Dec 1, 2026"
 *   year pass    → "1st Year pass · until Jan 31, 2027"
 *   class grant  → "Unlocked via your class · Computer Programming 1 · until Dec 15, 2026"
 * The date part is dropped when the grant has no end.
 */
export function paidStatusParts(
  plan: PlanLike,
  { subjectTitle, yearLabel }: { subjectTitle?: string; yearLabel?: string },
): string[] {
  const date = plan.until ? formatAccessDate(plan.until) : null;
  if (plan.scope === "year") {
    return [yearLabel ? `${yearLabel} pass` : "Year pass", ...(date ? [`until ${date}`] : [])];
  }
  const lead = plan.scope === "class" ? "Unlocked via your class" : "Unlocked";
  const until = date ? [plan.scope === "class" ? `until ${date}` : `access until ${date}`] : [];
  return [lead, ...(subjectTitle ? [subjectTitle] : []), ...until];
}

export function paidStatusLine(
  plan: PlanLike,
  names: { subjectTitle?: string; yearLabel?: string },
): string {
  return paidStatusParts(plan, names).join(" · ");
}

/** Shown while the post-payment poll waits for the webhook. */
export const PAYMENT_PENDING_COPY = "Payment received — unlocking…";
/** Shown when the poll window ran out before the webhook landed. */
export const PAYMENT_CONFIRMING_COPY =
  "Payment received — your access is being confirmed, this can take a minute.";
