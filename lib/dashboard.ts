import type { SubjectSummary, YearGroup } from "./account";

export type SubjectStatus = "done" | "in-progress" | "ready";

export function subjectStatus(s: { doneCount: number; totalCount: number }): SubjectStatus {
  if (s.totalCount <= 0 || s.doneCount <= 0) return "ready";
  if (s.doneCount >= s.totalCount) return "done";
  return "in-progress";
}

export interface TermGroup {
  yearId: string;
  yearLabel: string;
  yearSort: number;
  semester: number;
  subjects: SubjectSummary[];
}

export function groupByTerm(years: YearGroup[]): TermGroup[] {
  const sortedYears = [...years].sort((a, b) => a.sortOrder - b.sortOrder);
  const terms: TermGroup[] = [];
  for (const year of sortedYears) {
    for (const semester of [1, 2]) {
      const subjects = year.subjects.filter((s) => s.semester === semester);
      if (subjects.length === 0) continue;
      terms.push({
        yearId: year.yearId,
        yearLabel: year.label,
        yearSort: year.sortOrder,
        semester,
        subjects,
      });
    }
  }
  return terms;
}

export interface CurrentTerm extends TermGroup {
  modulesDone: number;
  modulesTotal: number;
  inProgress: number;
  ready: number;
}

function termStats(term: TermGroup): Omit<CurrentTerm, keyof TermGroup> {
  const unlocked = term.subjects.filter((s) => s.unlocked);
  let modulesDone = 0;
  let modulesTotal = 0;
  let inProgress = 0;
  let ready = 0;
  for (const s of unlocked) {
    modulesDone += s.doneCount;
    modulesTotal += s.totalCount;
    const status = subjectStatus(s);
    if (status === "in-progress") inProgress++;
    else if (status === "ready") ready++;
  }
  return { modulesDone, modulesTotal, inProgress, ready };
}

export function deriveCurrentTerm(terms: TermGroup[]): CurrentTerm | null {
  let lastUnlockedTerm: TermGroup | null = null;

  for (const term of terms) {
    const unlockedSubjects = term.subjects.filter((s) => s.unlocked);
    if (unlockedSubjects.length === 0) continue;
    lastUnlockedTerm = term;

    const hasUnfinished = unlockedSubjects.some((s) => s.doneCount < s.totalCount);
    if (hasUnfinished) {
      return { ...term, ...termStats(term) };
    }
  }

  if (lastUnlockedTerm) {
    return { ...lastUnlockedTerm, ...termStats(lastUnlockedTerm) };
  }

  return null;
}

export interface Recommendation {
  moduleId: string;
  moduleTitle: string;
  subjectId: string;
  subjectTitle: string;
  yearId: string;
  status: SubjectStatus;
}

export function pickRecommended(term: TermGroup | null, limit = 3): Recommendation[] {
  if (!term) return [];

  const unlocked = term.subjects.filter((s) => s.unlocked);
  const inProgressSubjects = unlocked.filter((s) => subjectStatus(s) === "in-progress");
  const readySubjects = unlocked.filter((s) => subjectStatus(s) === "ready");

  const recs: Recommendation[] = [];

  for (const s of inProgressSubjects) {
    const nextModule = s.modules.find((m) => !m.done);
    if (!nextModule) continue;
    recs.push({
      moduleId: nextModule.id,
      moduleTitle: nextModule.title,
      subjectId: s.id,
      subjectTitle: s.title,
      yearId: s.yearId,
      status: "in-progress",
    });
  }

  for (const s of readySubjects) {
    const firstModule = s.modules[0];
    if (!firstModule) continue;
    recs.push({
      moduleId: firstModule.id,
      moduleTitle: firstModule.title,
      subjectId: s.id,
      subjectTitle: s.title,
      yearId: s.yearId,
      status: "ready",
    });
  }

  return recs.slice(0, limit);
}

export interface RoadmapNode {
  key: string;
  short: string;
  state: "past" | "current" | "future";
}

export function roadmapNodes(terms: TermGroup[], current: CurrentTerm | null): RoadmapNode[] {
  const distinctYearSorts = Array.from(new Set(terms.map((t) => t.yearSort))).sort(
    (a, b) => a - b,
  );
  const yearPositionBySort = new Map<number, number>();
  distinctYearSorts.forEach((sortValue, index) => {
    yearPositionBySort.set(sortValue, index + 1);
  });

  const currentIndex = current
    ? terms.findIndex((t) => t.yearId === current.yearId && t.semester === current.semester)
    : -1;

  const nodes: RoadmapNode[] = terms.map((term, index) => {
    const yearPosition = yearPositionBySort.get(term.yearSort) ?? term.yearSort;
    let state: RoadmapNode["state"] = "future";
    if (currentIndex !== -1) {
      if (index < currentIndex) state = "past";
      else if (index === currentIndex) state = "current";
    }
    return {
      key: `${term.yearId}-${term.semester}`,
      short: `${yearPosition}-${term.semester}`,
      state,
    };
  });

  nodes.push({ key: "grad", short: "Graduation", state: "future" });

  return nodes;
}

export function continueHref(rec: Recommendation | undefined): string {
  if (!rec) return "/year";
  return `/year/${rec.yearId}/subjects/${rec.subjectId}/modules/${rec.moduleId}`;
}
