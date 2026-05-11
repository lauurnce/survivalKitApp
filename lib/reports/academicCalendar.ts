/**
 * Term phases, so a traffic drop can be told apart from a term break.
 *
 * Visits to this product cluster around exam dates. Without a calendar, a
 * quiet week reads identically whether the audience left or the semester
 * ended — and those call for opposite responses.
 *
 * WHOSE CALENDAR THIS IS. One contiguous timeline for the "Aug-10 wave" — the
 * UP system and USTP (confirmed AY 2026–27 dates), which WVSU and CTU track
 * closely — because that wave is the bulk of the audience and overlapping
 * windows from other schools would make every week read as `mixed`. Silliman
 * (Jun start) and PUP (Sep start, finals in January) run on different clocks
 * and are deliberately left out; a report window that matters to them should
 * say so in prose.
 *
 * Source: docs/gtm/academic-calendars-ay2026-27.md. A window whose dates are
 * not confirmed by a published calendar says "ESTIMATE" in its note, and the
 * VANTAGE write-up must carry that caveat rather than state the phase as fact.
 * Dates past the last window are `unknown`, never extrapolated: extend this
 * list when the 2nd-semester calendars publish.
 */

/** Marker for a window inferred rather than read off a published calendar. */
export const ESTIMATE_MARKER = "ESTIMATE";

export function isEstimate(w: TermWindow): boolean {
  return w.note?.includes(ESTIMATE_MARKER) ?? false;
}

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

/** Owner-maintained. Contiguous, non-overlapping, in date order. */
export const TERM_CALENDAR: readonly TermWindow[] = [
  {
    phase: "classes",
    startPhDate: "2026-08-10",
    endPhDate: "2026-10-04",
    note: "UP system + USTP 1st-sem classes start Aug 10 (confirmed)",
  },
  {
    phase: "midterms",
    startPhDate: "2026-10-05",
    endPhDate: "2026-10-10",
    note: "USTP midterms Oct 5–10; UP mid-sem Oct 7 (confirmed)",
  },
  {
    phase: "classes",
    startPhDate: "2026-10-11",
    endPhDate: "2026-12-08",
    note: "Between midterms and finals (confirmed by its bounds)",
  },
  {
    phase: "finals",
    startPhDate: "2026-12-09",
    endPhDate: "2026-12-19",
    note: "UP finals Dec 9–17 (confirmed); USTP ~Dec 9–19 — end date ESTIMATE",
  },
  {
    phase: "break",
    startPhDate: "2026-12-20",
    endPhDate: "2027-01-04",
    note: "Sem break; USTP 2nd sem Jan 5 (confirmed), UP Jan 15 — UP break runs longer",
  },
];

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
 * Add one day to a YYYY-MM-DD date string. Handles month and year rollover.
 * Used to distinguish adjacent windows (contiguous coverage) from real gaps.
 */
function dayAfter(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dy = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dy}`;
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
    // Check for gaps between consecutive windows and at the end.
    // A gap exists if the next window starts AFTER the day after the current end.
    // Adjacent windows (one ends 2026-09-20, next starts 2026-09-21) are contiguous.
    let currentEnd = sorted[0]!.endPhDate;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startPhDate > dayAfter(currentEnd)) {
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

    // Check if the range extends beyond all windows (gaps at the end).
    // Note: no dayAfter() here—this compares a window boundary against the query's
    // own fixed edge, not window-to-window adjacency.
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
      // If start is unknown, use the first known phase in chronological order.
      // All windows in sorted have non-unknown phases (by type), so use the first one.
      phase = sorted[0]?.phase ?? "unknown";
    }
  }

  return { phase, mixed };
}

/**
 * True when any window overlapping the range is an ESTIMATE, so the report can
 * carry the caveat instead of stating an inferred phase as fact.
 */
export function rangeIncludesEstimate(
  startPhDate: string,
  endPhDate: string,
  calendar: readonly TermWindow[] = TERM_CALENDAR
): boolean {
  return calendar.some(
    (w) => w.startPhDate <= endPhDate && w.endPhDate >= startPhDate && isEstimate(w)
  );
}
