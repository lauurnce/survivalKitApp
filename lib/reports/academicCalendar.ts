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
 *
 * Scans the entire range for overlapping windows, not just endpoints, so that
 * a window fully enclosed by the range (touching neither endpoint) is detected.
 * If any date in [startPhDate, endPhDate] is not covered by an overlapping
 * window, "unknown" is included in the phase set.
 */
export function phaseForRange(
  startPhDate: string,
  endPhDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): { phase: TermPhase; mixed: boolean } {
  // Find all windows overlapping the range: w.start <= endPhDate && w.end >= startPhDate
  const overlapping = calendar.filter(
    (w) => w.startPhDate <= endPhDate && w.endPhDate >= startPhDate
  );

  if (overlapping.length === 0) {
    return { phase: "unknown", mixed: false };
  }

  // Collect all phases present in overlapping windows
  const phases = new Set<TermPhase>();
  for (const w of overlapping) {
    phases.add(w.phase);
  }

  // Check if the overlapping windows cover the entire range [startPhDate, endPhDate]
  // without gaps. If there are uncovered dates, include "unknown" in the phase set.
  const sorted = overlapping.sort((a, b) =>
    a.startPhDate.localeCompare(b.startPhDate)
  );

  let hasCoverageGap = false;

  // Check if the first window starts after startPhDate (gap at the beginning)
  if (sorted[0]!.startPhDate > startPhDate) {
    hasCoverageGap = true;
  } else {
    // Check for gaps between consecutive windows and at the end
    let currentEnd = sorted[0]!.endPhDate;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startPhDate > currentEnd) {
        // Gap between window i-1 and window i
        hasCoverageGap = true;
        break;
      }
      // Extend current end (ISO strings compare correctly)
      currentEnd =
        sorted[i]!.endPhDate > currentEnd
          ? sorted[i]!.endPhDate
          : currentEnd;
    }

    // Check if the range extends beyond all windows
    if (!hasCoverageGap && endPhDate > currentEnd) {
      hasCoverageGap = true;
    }
  }

  if (hasCoverageGap) {
    phases.add("unknown");
  }

  const mixed = phases.size > 1;

  // Determine which phase to return
  let phase: TermPhase;
  if (!mixed) {
    // Only one phase present
    phase = Array.from(phases)[0]!;
  } else {
    // Multiple phases: prefer the phase at startPhDate
    const startPhase = phaseFor(startPhDate, calendar);
    if (startPhase !== "unknown") {
      phase = startPhase;
    } else {
      // If start is unknown, use the first known phase in calendar order
      const firstKnown = Array.from(phases).find((p) => p !== "unknown");
      phase = firstKnown ?? "unknown";
    }
  }

  return { phase, mixed };
}
