/**
 * Manila calendar windows for weekly department reports.
 *
 * Two decisions are load-bearing.
 *
 * First, the current window ends at the start of TODAY in Manila, not at
 * "now". A window that includes a partial day is compared against windows
 * that do not, so every week-over-week delta carries a fraction of a day of
 * noise in one direction. Whole PH days only.
 *
 * Second, boundaries are emitted as UTC instants. `events.created_at` and
 * `payments.paid_at` are timestamptz, and the comparison happens inside
 * Postgres — handing it a naive local date would compare against the
 * database's timezone, not the Philippines'.
 *
 * The Philippines is UTC+8 all year with no daylight saving, which is why a
 * fixed offset is correct and why PH_OFFSET_MS already exists in
 * lib/payments.ts. There is one definition of that offset; import it.
 */

import { PH_OFFSET_MS } from "../payments";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export interface PhWindow {
  /** "YYYY-MM-DD → YYYY-MM-DD", the inclusive first and last PH calendar day. */
  label: string;
  /** UTC instant of the first PH midnight inside the window. Inclusive. */
  sinceIso: string;
  /** UTC instant of the PH midnight that closes the window. Exclusive. */
  untilIso: string;
}

/** The Manila calendar date of an instant, as YYYY-MM-DD. */
export function phDate(now: Date): string {
  return new Date(now.getTime() + PH_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant at which a PH calendar date began. */
export function phDayStartUtc(phCalendarDate: string): string {
  const utcMidnight = Date.parse(`${phCalendarDate}T00:00:00.000Z`);
  return new Date(utcMidnight - PH_OFFSET_MS).toISOString();
}

/**
 * Trailing complete PH weeks, newest first. Index 0 is the seven whole days
 * ending at PH midnight this morning; index 1 is the seven before that.
 */
export function phWeekWindows(now: Date, weeks = 2): PhWindow[] {
  const todayStartMs = Date.parse(phDayStartUtc(phDate(now)));

  return Array.from({ length: weeks }, (_, i) => {
    const untilMs = todayStartMs - i * WEEK_MS;
    const sinceMs = untilMs - WEEK_MS;
    return {
      // The last day INSIDE the window is one day before its exclusive end.
      label: `${phDate(new Date(sinceMs))} → ${phDate(new Date(untilMs - DAY_MS))}`,
      sinceIso: new Date(sinceMs).toISOString(),
      untilIso: new Date(untilMs).toISOString(),
    };
  });
}
