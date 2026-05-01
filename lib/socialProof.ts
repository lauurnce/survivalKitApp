// Social proof shown on the paywall teaser and /unlock. Every figure here is a
// true, already-public, non-personal aggregate — no names, no quotes, no counts
// of buyers (paid-unlock totals are deliberately never shown: too small to help).
//
// Source: live-database audit on 2026-10-31.
//   - user_feedback: 100 rows, mean app_rating 4.68 / 5 → shown as 4.7.
//   - profiles.university: readers report 35 distinct school names; many are
//     spelling variants of the same school, so the line claims only the 8+
//     universities the audit confirmed as distinct.
// These are floors, not live counters. Re-check them against the database
// before raising either number; lowering is never needed for a "+" figure.
export const AVERAGE_RATING = 4.7;
export const RATING_SCALE = 5;
export const UNIVERSITY_FLOOR = 8;

/** One line of proof, e.g. "Students rate it 4.7/5 · Used at 8+ universities". */
export function socialProofLine(): string {
  return `Students rate it ${AVERAGE_RATING.toFixed(1)}/${RATING_SCALE} · Used at ${UNIVERSITY_FLOOR}+ universities`;
}
