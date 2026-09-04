/**
 * Manila calendar windows for weekly department reports.
 *
 * Three decisions are load-bearing.
 *
 * First, windows are Monday-anchored PH calendar weeks, matching
 * growth_cohort_agg's own convention (its `weekly`/`cohorts` CTEs bucket by
 * `date_trunc('week', created_at at time zone 'Asia/Manila')`, and Postgres's
 * `date_trunc('week', ...)` starts weeks on Monday). Before issue #33, this
 * function instead returned a trailing 7-days-ending-today window — plausible
 * from its own name, but NOT the same calendar span as retention's buckets
 * unless the report happened to run on a Monday. A report run any other day
 * of the week silently compared two adjacent-but-different 7-day spans
 * across the funnel and retention tables.
 *
 * Second, the current window is the most recently COMPLETE Monday-Sunday PH
 * week — never the in-progress one. Same reasoning growth_cohort_agg's
 * `weekly` CTE already documents: a partial week always has fewer days of
 * activity than a finished one purely because it isn't over yet, so
 * including it would read as a manufactured decline in the newest bucket.
 * Whole PH days only, same as before.
 *
 * Third, boundaries are emitted as UTC instants. `events.created_at` and
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
 * Complete Monday-anchored PH weeks, newest first. Index 0 is the most
 * recently ENDED Monday-Sunday week; index 1 is the one before that. The
 * week containing "now" is always excluded, even if today is Monday (see
 * this file's header).
 */
export function phWeekWindows(now: Date, weeks = 2): PhWindow[] {
  const todayDate = phDate(now);
  const todayStartMs = Date.parse(phDayStartUtc(todayDate));
  // Day of week for the PH calendar date itself (0=Sun..6=Sat) — derived
  // from the date string, not from todayStartMs. todayStartMs is a UTC
  // instant that (PH being UTC+8) falls on the PREVIOUS UTC calendar day, so
  // reading its weekday directly would be off by one.
  const dow = new Date(`${todayDate}T00:00:00.000Z`).getUTCDay();
  const daysSinceMonday = (dow + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
  const thisMondayStartMs = todayStartMs - daysSinceMonday * DAY_MS;

  return Array.from({ length: weeks }, (_, i) => {
    const untilMs = thisMondayStartMs - i * WEEK_MS;
    const sinceMs = untilMs - WEEK_MS;
    return {
      // The last day INSIDE the window is one day before its exclusive end.
      label: `${phDate(new Date(sinceMs))} → ${phDate(new Date(untilMs - DAY_MS))}`,
      sinceIso: new Date(sinceMs).toISOString(),
      untilIso: new Date(untilMs).toISOString(),
    };
  });
}
