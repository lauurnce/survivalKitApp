// The next exam week, from the owner-maintained term calendar.
//
// Traffic triples in exam weeks: that is when students look for notes, and
// the one moment a "come back" reminder is believed. The countdown says how
// far away the next midterms or finals are for the Aug-10 wave (UP, USTP and
// schools that track them), using lib/reports/academicCalendar.ts so the
// dates have one source. Estimated windows are worded as "around".

import { TERM_CALENDAR, isEstimate, type TermWindow } from "@/lib/reports/academicCalendar";
import { phDate } from "@/lib/reports/phWeek";

/** Hide a countdown further out than this: "finals in 90 days" motivates nobody. */
export const COUNTDOWN_HORIZON_DAYS = 45;

export interface ExamCountdown {
  phase: "midterms" | "finals";
  startPhDate: string;
  endPhDate: string;
  /** Whole PH calendar days until the window starts; 0 while it is running. */
  daysUntil: number;
  inProgress: boolean;
  estimate: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** "Dec 9" from "2026-12-09". */
export function shortDate(isoDate: string): string {
  const [, m, d] = isoDate.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export function nextExamWindow(
  now: Date,
  calendar: readonly TermWindow[] = TERM_CALENDAR,
  horizonDays = COUNTDOWN_HORIZON_DAYS,
): ExamCountdown | null {
  const today = phDate(now);
  const next = calendar.find(
    (w) => (w.phase === "finals" || w.phase === "midterms") && w.endPhDate >= today,
  );
  if (!next) return null;
  const inProgress = next.startPhDate <= today;
  const daysUntil = inProgress ? 0 : dayNumber(next.startPhDate) - dayNumber(today);
  if (daysUntil > horizonDays) return null;
  return {
    phase: next.phase as ExamCountdown["phase"],
    startPhDate: next.startPhDate,
    endPhDate: next.endPhDate,
    daysUntil,
    inProgress,
    estimate: isEstimate(next),
  };
}

/** The headline: "Finals start in 39 days", "Finals start tomorrow", "Finals week". */
export function countdownHeadline(c: ExamCountdown): string {
  const name = c.phase === "finals" ? "Finals" : "Midterms";
  if (c.inProgress) return `${name} week`;
  if (c.daysUntil === 1) return `${name} start tomorrow`;
  return `${name} start in ${c.daysUntil} days`;
}

/** The line under it: dates, hedged when the window is an estimate. */
export function countdownDetail(c: ExamCountdown): string {
  const range = `${shortDate(c.startPhDate)}–${shortDate(c.endPhDate)}`;
  return c.estimate
    ? `Around ${range} on the August school calendar. Check your own school's dates.`
    : `${range} on the August school calendar (UP, USTP). Check your own school's dates.`;
}
