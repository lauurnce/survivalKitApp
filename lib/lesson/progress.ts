// How far through a lesson body the reader is, as a 0–1 fraction, and which
// engagement milestones a scroll step just crossed. Pure, so the hook that
// reads the DOM (hooks/useLessonProgress.ts) stays thin and this stays tested.

export interface ProgressInput {
  /** window.scrollY */
  scrollY: number;
  /** window.innerHeight */
  viewportHeight: number;
  /** Document-relative top of the lesson body, in px. */
  top: number;
  /** Height of the lesson body, in px. */
  height: number;
}

/**
 * 0 while the body's top is still below the fold's bottom edge, 1 once the
 * bottom of the viewport has reached the body's end. Measuring by the
 * viewport's bottom edge means a short lesson that fits on one screen reads
 * as finished, which it is.
 */
export function lessonFraction({ scrollY, viewportHeight, top, height }: ProgressInput): number {
  if (height <= 0) return 0;
  const seen = scrollY + viewportHeight - top;
  return Math.min(1, Math.max(0, seen / height));
}

export type Milestone = "halfway" | "end";

/** End counts from 97%, so a few px of bottom padding never blocks it. */
export const END_AT = 0.97;

export const MILESTONES: ReadonlyArray<{ name: Milestone; at: number }> = [
  { name: "halfway", at: 0.5 },
  { name: "end", at: END_AT },
];

/** Milestones reached at `fraction` that are not already in `reached`. */
export function newMilestones(fraction: number, reached: ReadonlySet<Milestone>): Milestone[] {
  return MILESTONES.filter((m) => fraction >= m.at && !reached.has(m.name)).map((m) => m.name);
}

/** Minutes still to read, rounded up; 0 once the end milestone is reached. */
export function minutesLeft(totalMinutes: number, fraction: number): number {
  if (fraction >= END_AT) return 0;
  return Math.max(1, Math.ceil(totalMinutes * (1 - fraction)));
}

/** Inverse of lessonFraction: the scrollY that puts the reader at `fraction`. */
export function scrollYForFraction(
  fraction: number,
  { viewportHeight, top, height }: Omit<ProgressInput, "scrollY">
): number {
  return Math.max(0, Math.round(top + fraction * height - viewportHeight));
}
