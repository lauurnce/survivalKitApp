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

// ─── Legacy RoadmapNode (kept for backward compatibility) ────────────────────

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

// ─── New Rich Roadmap Types (Roadmap Redesign) ───────────────────────────────

export type MilestoneState = "completed" | "current" | "upcoming" | "locked";

export interface ModuleProgress {
  id: string;
  title: string;
  status: "done" | "in-progress" | "not-started" | "locked";
  completedAt: string | null;
  firstOpenedAt: string | null;
}

export interface MilestoneSubject {
  id: string;
  title: string;
  kind: "major" | "minor";
  unlocked: boolean;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  modules: ModuleProgress[];
}

export interface RoadmapMilestone {
  key: string;
  label: string;
  yearId: string;
  semester: number;
  yearPosition: number;
  state: MilestoneState;

  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  lockedModules: number;

  unlockedAt: string | null;
  firstActivityAt: string | null;
  lastActivityAt: string | null;

  subjects: MilestoneSubject[];
}

export interface RoadmapData {
  journeyStartedAt: string;
  milestones: RoadmapMilestone[];
  overall: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    completionRate: number;
  };
}

// Derives semester label like "Year 1 • 1st Semester"
export function milestoneLabel(yearLabel: string, semester: number): string {
  const semLabel = semester === 1 ? "1st" : "2nd";
  return `${yearLabel} • ${semLabel} Semester`;
}

// Determines milestone state based on unlock status and progress
export function deriveMilestoneState(
  milestone: Pick<RoadmapMilestone, "totalModules" | "completedModules" | "lockedModules">,
  isCurrent: boolean
): MilestoneState {
  if (milestone.lockedModules === milestone.totalModules && milestone.totalModules > 0) {
    return "locked";
  }
  if (milestone.completedModules === milestone.totalModules && milestone.totalModules > 0) {
    return "completed";
  }
  if (isCurrent) return "current";
  return "upcoming";
}

// ─── Activity & Subscription Types (Roadmap v2) ────────────────────────────────

export interface ActivityWeek {
  weekStart: string;
  activeDays: number;
  totalEvents: number;
  days: Array<{
    date: string;
    isActive: boolean;
    eventCount: number;
  }>;
}

export interface ActivityData {
  weeks: ActivityWeek[];
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export interface SubscriptionTimelineItem {
  yearId: string;
  yearLabel: string;
  subjectId: string | null;
  subjectTitle: string | null;
  startedAt: string;
  endsAt: string;
  daysRemaining: number;
  progressPct: number;
  isActive: boolean;
}

export interface DashboardData {
  roadmap: RoadmapData;
  activity: ActivityData;
  subscriptions: SubscriptionTimelineItem[];
}

// Calendar-accurate breakdown (years/months from actual month lengths, not a
// /30 approximation), largest unit first — a raw day count for a far-out
// deadline (e.g. "26786 days") doesn't tell a reader when that actually is.
export function formatDurationRemaining(from: Date, to: Date): string {
  if (to.getTime() <= from.getTime()) return "0 days";

  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  const cursor = new Date(from);
  cursor.setMonth(cursor.getMonth() + months);
  if (cursor.getTime() > to.getTime()) {
    months -= 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }

  const years = Math.floor(months / 12);
  months %= 12;

  const remainderDays = Math.floor((to.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(remainderDays / 7);
  const days = remainderDays % 7;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
  if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return parts.slice(0, 3).join(", ");
}
