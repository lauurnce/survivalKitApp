import { pickFreeActivities } from "@/lib/freeSample";
import { pluralize } from "@/lib/plural";
import { isExamPrep, isOpenable, sortModules, type HubModule } from "./startHere";

// What a subject holds, in the words a student scanning the modules page
// needs: how many lessons, how many reviewers, and which ones are free.
//
// The page header said only "Modules", and the offer above the list said "The
// first set is free to try" without naming it. A student on Data
// Communications (16 rows) or Computer Programming 2 (2 rows, one of them exam
// prep) could not tell what they would get for a tap.

export interface SubjectSummary {
  lessonCount: number;
  examPrepCount: number;
  reviewerCount: number;
  // The free sample (lib/freeSample): every reviewer of the first module that
  // has any. Null when the subject has no reviewers.
  freeModule: { id: string; title: string; reviewerCount: number } | null;
  // True when the free sample is every reviewer, so nothing is locked.
  allFree: boolean;
  emptyModuleIds: string[];
}

export function summarizeSubject(
  modules: HubModule[],
  activityRows: { id: string; module_id: string; sort_order?: number }[],
  contentCounts?: Record<string, number>,
): SubjectSummary {
  const ordered = sortModules(modules);
  const openable = ordered.filter((m) => isOpenable(m.id, contentCounts));
  const emptyModuleIds = ordered.filter((m) => !isOpenable(m.id, contentCounts)).map((m) => m.id);
  const examPrepCount = openable.filter((m) => isExamPrep(m.title)).length;

  const moduleIds = new Set(ordered.map((m) => m.id));
  const activities = activityRows.filter((a) => moduleIds.has(a.module_id));
  const freeIds = new Set(
    pickFreeActivities(
      ordered.map((m) => m.id),
      activities.map((a, i) => ({ id: a.id, module_id: a.module_id, sort_order: a.sort_order ?? i })),
    ),
  );
  const freeRow = activities.find((a) => freeIds.has(a.id));
  const free = freeRow ? ordered.find((m) => m.id === freeRow.module_id) ?? null : null;

  return {
    lessonCount: openable.length - examPrepCount,
    examPrepCount,
    reviewerCount: activities.length,
    freeModule: free ? { id: free.id, title: free.title, reviewerCount: freeIds.size } : null,
    allFree: activities.length > 0 && freeIds.size === activities.length,
    emptyModuleIds,
  };
}

// "16 lessons · 52 reviewers · exam prep included". Parts with a zero count
// are dropped rather than printed as "0 reviewers".
export function summaryParts(s: SubjectSummary): string[] {
  const parts: string[] = [];
  if (s.lessonCount > 0) parts.push(`${s.lessonCount} ${pluralize(s.lessonCount, "lesson")}`);
  if (s.reviewerCount > 0) parts.push(`${s.reviewerCount} ${pluralize(s.reviewerCount, "reviewer")}`);
  if (s.examPrepCount > 0) parts.push("exam prep included");
  return parts;
}

// The sentence that names the free sample, or null when there is none.
export function freeSampleLine(s: SubjectSummary): string | null {
  if (!s.freeModule) return null;
  if (s.allFree) return "Every lesson and reviewer here is free.";
  const n = s.freeModule.reviewerCount;
  return `Every lesson is free to read. The ${n} ${pluralize(n, "reviewer")} in ${s.freeModule.title} ${pluralize(n, "is", "are")} free too.`;
}
