// Which lesson a subject's module list should point a student at first.
//
// The 2026-11-01 second-year research found the modules page had no first
// step: its first call to action was "Unlock reviewers", and a 16-row list
// with no lesson numbers (Data Communications) or two rows that both look like
// review material (Computer Programming 2) left the student to choose. This
// picks one lesson to put above the list.

export interface HubModule {
  id: string;
  title: string;
  sort_order: number;
}

// Exam prep is a review module, not a first lesson. It is only a fallback when
// the subject has nothing else to read.
export function isExamPrep(title: string): boolean {
  return /^\s*exam\s+prep\b/i.test(title);
}

// A module with no content sections renders an empty page. Unknown counts
// (module missing from the map) count as openable, so a failed count query
// never hides a real lesson.
export function isOpenable(moduleId: string, contentCounts?: Record<string, number>): boolean {
  if (!contentCounts) return true;
  const n = contentCounts[moduleId];
  return n === undefined || n > 0;
}

export function sortModules<T extends HubModule>(modules: T[]): T[] {
  return [...modules].sort((a, b) => a.sort_order - b.sort_order);
}

export type StartReason = "start" | "continue" | "review";

export interface StartPick<T extends HubModule = HubModule> {
  module: T;
  // 0-based position in the full sort_order list, matching the row number the
  // module list prints (index + 1).
  index: number;
  reason: StartReason;
}

/**
 * The lesson to start (or continue) with.
 *
 * - "start": nothing done yet; the first openable non-exam-prep module.
 * - "continue": some done; the first openable non-exam-prep module not done.
 * - "review": every lesson done; exam prep if there is one, else the first
 *   lesson.
 *
 * Returns null only when no module is openable at all.
 */
export function pickStartModule<T extends HubModule>(
  modules: T[],
  opts: { contentCounts?: Record<string, number>; completedIds?: ReadonlySet<string> } = {},
): StartPick<T> | null {
  const ordered = sortModules(modules);
  const openable = ordered.filter((m) => isOpenable(m.id, opts.contentCounts));
  if (openable.length === 0) return null;

  const lessons = openable.filter((m) => !isExamPrep(m.title));
  const exams = openable.filter((m) => isExamPrep(m.title));
  const done = opts.completedIds ?? new Set<string>();
  const indexOf = (m: T) => ordered.indexOf(m);

  if (lessons.length === 0) {
    return { module: exams[0], index: indexOf(exams[0]), reason: "start" };
  }

  const anyDone = openable.some((m) => done.has(m.id));
  const next = lessons.find((m) => !done.has(m.id));
  if (next) {
    return { module: next, index: indexOf(next), reason: anyDone ? "continue" : "start" };
  }

  const review = exams.find((m) => !done.has(m.id)) ?? exams[0] ?? lessons[0];
  return { module: review, index: indexOf(review), reason: "review" };
}
