/**
 * Term phases, so a traffic drop can be told apart from a term break.
 *
 * Visits to this product cluster around exam dates. Without a calendar, a
 * quiet week reads identically whether the audience left or the semester
 * ended — and those call for opposite responses.
 *
 * TERM_CALENDAR SHIPS EMPTY ON PURPOSE. Philippine academic dates are not a
 * fact this codebase knows, and an invented one is worse than none: VANTAGE
 * would confidently blame a real regression on a break that was never
 * happening. Same rule the Active CPU row follows — an unknown value is
 * recorded as unknown, never estimated.
 *
 * To populate it, add windows below with real dates from the universities the
 * audience actually attends, then re-run the report. Until then VANTAGE says
 * "term phase not recorded" and leans on the trailing weekly-active series
 * from growth_cohort_agg instead.
 */

export type TermPhase =
  | "classes"
  | "prelims"
  | "midterms"
  | "finals"
  | "break"
  | "unknown";

export interface TermWindow {
  phase: Exclude<TermPhase, "unknown">;
  /** PH calendar date, YYYY-MM-DD. Inclusive. */
  startPhDate: string;
  /** PH calendar date, YYYY-MM-DD. Inclusive. */
  endPhDate: string;
  /** Optional: which school or system this window came from. */
  note?: string;
}

/** Owner-maintained. Empty until real dates are supplied. */
export const TERM_CALENDAR: readonly TermWindow[] = [];

/** The phase covering a PH calendar date, or "unknown" if none does. */
export function phaseFor(
  phCalendarDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): TermPhase {
  // ISO dates compare correctly as strings, which keeps this free of any
  // timezone reasoning — the caller already resolved the PH calendar date.
  const hit = calendar.find(
    (w) => phCalendarDate >= w.startPhDate && phCalendarDate <= w.endPhDate
  );
  return hit?.phase ?? "unknown";
}

/**
 * The phase covering a report window. `mixed` is true when the window spans
 * more than one phase, which is a caveat the agent must state rather than
 * pick a winner for.
 */
export function phaseForRange(
  startPhDate: string,
  endPhDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): { phase: TermPhase; mixed: boolean } {
  const start = phaseFor(startPhDate, calendar);
  const end = phaseFor(endPhDate, calendar);

  if (start === end) return { phase: start, mixed: false };
  if (start === "unknown") return { phase: end, mixed: true };
  return { phase: start, mixed: true };
}
