// ── Term schedule: when a semester pass ends ─────────────────────────────────
//
// The single source of truth for how long a semester purchase lasts. A
// semester pass (subject_sem, year_sem, class blocks) runs until the
// `accessEndsAt` of the term it was bought in; a purchase made on or after the
// next term's `purchasableFrom` rolls into that next term instead.
//
// Pure data and date math, no node: imports, so client components (the plan
// cards' "until Jan 31" copy) can read it as well as the webhook.
//
// Replaces the single hand-bumped SEMESTER_END constant. That constant read
// 2026-12-31 until Oct 2026 and would have locked PUP students out right
// before their mid-January finals; paid subscriptions had to be extended by
// hand. lib/terms.test.ts now fails the build 30 days before the last term
// below ends without a successor, so the rollover cannot be forgotten.
//
// Rollover procedure: docs/runbooks/semester-rollover.md.

const DAY_MS = 24 * 60 * 60 * 1000;

/** Philippine time has no DST, so a fixed offset is exact. */
const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface Term {
  /** Stable id, e.g. "ay2026-27-sem1". Never reuse one. */
  id: string;
  /** Human label for copy and reports. */
  label: string;
  /**
   * First instant (inclusive) a semester purchase counts toward this term.
   * Write it as midnight PH: "YYYY-MM-DDT00:00:00+08:00".
   */
  purchasableFrom: string;
  /**
   * When access bought in this term ends. Always 23:59:59 PH on the last day,
   * written in UTC: "YYYY-MM-DDT15:59:59Z".
   */
  accessEndsAt: string;
  /** Why these dates; cite docs/gtm/academic-calendars-*.md. */
  why: string;
}

/**
 * Owner-maintained. In date order. Each term's `purchasableFrom` must be on or
 * before the previous term's `accessEndsAt`, so there is never a window where
 * a purchase lands on a term that has already ended.
 */
export const TERM_SCHEDULE: readonly Term[] = [
  {
    id: "ay2026-27-sem1",
    label: "1st semester, AY 2026–27",
    purchasableFrom: "2026-06-01T00:00:00+08:00",
    accessEndsAt: "2027-01-31T15:59:59Z",
    why:
      "Unchanged from the old SEMESTER_END. Runs past PUP's 1st-sem finals " +
      "(~Jan 12–17, 2027); the Aug-10 wave (UP, USTP) finishes by Dec 19.",
  },
  {
    id: "ay2026-27-sem2",
    label: "2nd semester, AY 2026–27",
    // From Jan 1 a 1st-sem pass would have under 31 days left, the 31-day
    // floor would decide the end anyway, and USTP's 2nd sem opens Jan 5. It is
    // also what a renewal from the Jan 28 expiry warning should buy.
    purchasableFrom: "2027-01-01T00:00:00+08:00",
    accessEndsAt: "2027-06-30T15:59:59Z",
    why:
      "PUP runs the latest calendar: 2nd-sem finals ~Jun 15–21 (ESTIMATE from " +
      "AY 2025–26). Jun 30 adds ~9 days for a slipped exam week or removals; " +
      "UP (from Jan 15) and USTP (from Jan 5) end in May.",
  },
  {
    id: "ay2026-27-midyear",
    label: "Midyear (summer) 2027",
    // Summer classes and PUP stragglers. From Jun 1 a 2nd-sem pass would run
    // under a month, so June buyers get the midyear term instead.
    purchasableFrom: "2027-06-01T00:00:00+08:00",
    accessEndsAt: "2027-07-31T15:59:59Z",
    why:
      "Midyear rule: purchases from Jun 1 cover summer classes and run to the " +
      "end of July, before the Aug 4–17 freshman wave. Buyers after Jul 1 are " +
      "protected by the 31-day floor until AY 2027–28 1st sem is scheduled.",
  },
];

/** How close to the last term's end the schedule may get without a successor. */
export const SCHEDULE_RUNWAY_DAYS = 30;

function ms(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * The term a semester purchase made at `at` belongs to: the latest term whose
 * purchase window has opened. Null when `at` predates the schedule or the
 * schedule has run out (the chosen term already ended) — callers must then
 * fall back, never invent dates.
 */
export function termForPurchase(
  at: Date,
  schedule: readonly Term[] = TERM_SCHEDULE
): Term | null {
  const t = at.getTime();
  let hit: Term | null = null;
  for (const term of schedule) {
    if (ms(term.purchasableFrom) <= t) hit = term;
  }
  if (!hit || t >= ms(hit.accessEndsAt)) return null;
  return hit;
}

/** When a semester pass bought at `at` ends, or null if no term covers it. */
export function semesterAccessEndFor(
  at: Date,
  schedule: readonly Term[] = TERM_SCHEDULE
): Date | null {
  const term = termForPurchase(at, schedule);
  return term ? new Date(term.accessEndsAt) : null;
}

/** The last instant the schedule covers. */
export function scheduleHorizon(schedule: readonly Term[] = TERM_SCHEDULE): Date {
  return new Date(Math.max(...schedule.map((t) => ms(t.accessEndsAt))));
}

/** Whole days from `now` until the schedule runs out (negative once past). */
export function daysUntilScheduleEnds(
  now: Date,
  schedule: readonly Term[] = TERM_SCHEDULE
): number {
  return Math.floor((scheduleHorizon(schedule).getTime() - now.getTime()) / DAY_MS);
}

/** Structural problems with a schedule; empty when it is sound. */
export function scheduleProblems(schedule: readonly Term[] = TERM_SCHEDULE): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  schedule.forEach((term, i) => {
    if (ids.has(term.id)) problems.push(`${term.id}: duplicate id`);
    ids.add(term.id);
    const from = ms(term.purchasableFrom);
    const end = ms(term.accessEndsAt);
    if (Number.isNaN(from) || Number.isNaN(end)) {
      problems.push(`${term.id}: unparseable date`);
      return;
    }
    if (end <= from) problems.push(`${term.id}: accessEndsAt is not after purchasableFrom`);
    // 23:59:59 PH on the last day, so "until Jan 31" means all of Jan 31.
    if (!/T15:59:59(\.000)?Z$/.test(term.accessEndsAt)) {
      problems.push(`${term.id}: accessEndsAt must be 23:59:59 PH, written as "...T15:59:59Z"`);
    }
    if (end - from < 31 * DAY_MS) {
      problems.push(`${term.id}: shorter than the 31-day floor, so it would never decide an end`);
    }
    const prev = schedule[i - 1];
    if (prev) {
      if (from <= ms(prev.purchasableFrom)) problems.push(`${term.id}: out of order`);
      if (end <= ms(prev.accessEndsAt)) problems.push(`${term.id}: ends before ${prev.id}`);
      if (from > ms(prev.accessEndsAt)) {
        problems.push(`${term.id}: purchase gap after ${prev.id} ends — open it on or before that end`);
      }
    }
  });
  return problems;
}

function phParts(d: Date): { y: number; m: number; day: number } {
  const ph = new Date(d.getTime() + PH_OFFSET_MS);
  return { y: ph.getUTCFullYear(), m: ph.getUTCMonth(), day: ph.getUTCDate() };
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "Jan 31" — the PH calendar date, independent of the viewer's timezone, so
 * server and client render the same string. Hand-rolled rather than Intl so
 * no runtime's locale data can change it.
 */
export function shortPhDate(d: Date): string {
  const { m, day } = phParts(d);
  return `${SHORT_MONTHS[m]} ${day}`;
}

/** "January 31, 2027" in PH time. */
export function longPhDate(d: Date): string {
  const { y, m, day } = phParts(d);
  return `${LONG_MONTHS[m]} ${day}, ${y}`;
}

/**
 * Copy for the plan cards: the end a semester pass bought right now would get.
 * Falls back to "the end of the semester" when the schedule has run out, so
 * the UI never quotes a date the webhook will not grant.
 */
export function semesterUntilLabel(now: Date = new Date()): string {
  const end = semesterAccessEndFor(now);
  return end ? shortPhDate(end) : "the end of the semester";
}
