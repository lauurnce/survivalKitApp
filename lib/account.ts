import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";
import type { RoadmapData, RoadmapMilestone, MilestoneSubject, ModuleProgress } from "./dashboard";

export function completionPercentage(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

// An active subscription row, narrowed to the fields that decide unlocking.
export interface ActiveSub {
  year_id: string;
  subject_id: string | null;
  created_at: string; // when this subscription/unlock was created
}

// The joined `years` relation on a subjects row (see the subjects query below).
interface SubjectYearJoin {
  id: string;
  label: string;
  sort_order: number | null;
}

/**
 * In-memory equivalent of isSubscribed(): given a user's active, unexpired
 * subscriptions, is (yearId, subjectId) unlocked? A year-level plan
 * (subject_id IS NULL) unlocks every subject in that year; a subject-level
 * plan unlocks only its own subject. Pre-filter `subs` to status='active'
 * and current_period_end > now before calling.
 */
export function isUnlockedBy(
  subs: ActiveSub[],
  yearId: string,
  subjectId: string,
): boolean {
  return subs.some(
    (s) =>
      s.year_id === yearId &&
      (s.subject_id === null || s.subject_id === subjectId),
  );
}

export interface ModuleSummary {
  id: string;
  title: string;
  done: boolean;
}

export interface SubjectSummary {
  id: string; title: string; yearId: string;
  unlocked: boolean; doneCount: number; totalCount: number;
  modules: ModuleSummary[];
  semester: number; kind: "major" | "minor";
}

export interface YearGroup {
  yearId: string;
  label: string;
  sortOrder: number;
  subjects: SubjectSummary[];
}

export interface AccountOverview {
  yearLabel: string | null;
  subjects: SubjectSummary[];
  years: YearGroup[];
  overallDone: number; overallTotal: number;
}

export async function getAccountOverview(userId: string): Promise<AccountOverview> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Four bulk queries, run in parallel — no per-subject loop. This replaces an
  // N+1 waterfall (1 modules query + up to 2 subscription queries per subject)
  // that made the account page take ~10-15s with dozens of subjects.
  const [subjectsRes, progressRes, modulesRes, subsRes] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, title, year_id, semester, kind, years(id, label, sort_order)")
      .order("sort_order"),
    supabase.from("module_progress").select("module_id").eq("user_id", userId),
    supabase.from("modules").select("id, title, subject_id").order("sort_order"),
    isUuid(userId)
      ? supabase
          .from("subscriptions")
          .select("year_id, subject_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("current_period_end", now)
      : { data: [] as ActiveSub[] },
  ]);

  const subjects = subjectsRes.data ?? [];
  const doneModuleIds = new Set((progressRes.data ?? []).map((r) => r.module_id));
  const activeSubs = (subsRes.data ?? []) as ActiveSub[];

  // Group modules by subject once, preserving the sort_order from the query.
  const modulesBySubject = new Map<string, ModuleSummary[]>();
  for (const m of modulesRes.data ?? []) {
    const list = modulesBySubject.get(m.subject_id) ?? [];
    list.push({ id: m.id, title: m.title, done: doneModuleIds.has(m.id) });
    modulesBySubject.set(m.subject_id, list);
  }

  const summaries: SubjectSummary[] = [];
  const yearMap = new Map<string, YearGroup>();
  let overallDone = 0, overallTotal = 0;
  let yearLabel: string | null = null;

  for (const s of subjects) {
    const moduleSummaries = modulesBySubject.get(s.id) ?? [];
    const doneCount = moduleSummaries.filter((m) => m.done).length;
    const totalCount = moduleSummaries.length;
    const unlocked = isUnlockedBy(activeSubs, s.year_id, s.id);
    if (unlocked) { overallDone += doneCount; overallTotal += totalCount; }
    const yr = (s as unknown as { years: SubjectYearJoin | null }).years;
    yearLabel = yearLabel ?? yr?.label ?? null;
    const summary: SubjectSummary = {
      id: s.id, title: s.title, yearId: s.year_id,
      unlocked, doneCount, totalCount, modules: moduleSummaries,
      semester: s.semester, kind: s.kind,
    };
    summaries.push(summary);

    // Group by year
    if (yr) {
      if (!yearMap.has(yr.id)) {
        yearMap.set(yr.id, { yearId: yr.id, label: yr.label, sortOrder: yr.sort_order ?? 0, subjects: [] });
      }
      yearMap.get(yr.id)!.subjects.push(summary);
    }
  }

  const years = Array.from(yearMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

  return { yearLabel, subjects: summaries, years, overallDone, overallTotal };
}

// ─── Roadmap Data Fetching ────────────────────────────────────────────────────

interface ProfileRow {
  created_at: string;
}

interface SubscriptionRow {
  year_id: string;
  subject_id: string | null;
  created_at: string;
}

interface ModuleProgressRow {
  module_id: string;
  completed_at: string;
}

interface EventRow {
  event_type: "subject_open" | "module_open";
  subject_id: string | null;
  module_id: string | null;
  created_at: string;
}

interface ModuleRow {
  id: string;
  title: string;
  subject_id: string;
}

/**
 * Fetches rich roadmap data for the academic timeline redesign.
 * Single batched query to avoid N+1.
 */
export async function getRoadmapData(userId: string): Promise<RoadmapData> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Parallel fetch: profile, subscriptions (with created_at), module_progress (with completed_at),
  // events (subject_open/module_open), and curriculum
  const [
    profileRes,
    subsRes,
    progressRes,
    eventsRes,
    modulesRes,
    subjectsRes,
  ] = await Promise.all([
    isUuid(userId)
      ? supabase.from("profiles").select("created_at").eq("user_id", userId).maybeSingle()
      : { data: null },
    isUuid(userId)
      ? supabase
          .from("subscriptions")
          .select("year_id, subject_id, created_at")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("current_period_end", now)
      : { data: [] as SubscriptionRow[] },
    supabase.from("module_progress").select("module_id, completed_at").eq("user_id", userId),
    supabase
      .from("events")
      .select("event_type, subject_id, module_id, created_at")
      .eq("device_id", userId) // fallback to device_id for anonymous
      .in("event_type", ["subject_open", "module_open"])
      .order("created_at", { ascending: true })
      .limit(5000),
    supabase.from("modules").select("id, title, subject_id").order("sort_order"),
    supabase
      .from("subjects")
      .select("id, title, year_id, semester, kind, years(id, label, sort_order)")
      .order("sort_order"),
  ]);

  const profile = profileRes.data as ProfileRow | null;
  const journeyStartedAt = profile?.created_at ?? new Date().toISOString();

  const subscriptions = (subsRes.data ?? []) as SubscriptionRow[];
  const moduleProgress = (progressRes.data ?? []) as ModuleProgressRow[];
  const events = (eventsRes.data ?? []) as EventRow[];
  const allModules = (modulesRes.data ?? []) as ModuleRow[];
  const subjects = subjectsRes.data ?? [];

  // Maps for fast lookup
  const completedAtByModule = new Map(moduleProgress.map((r) => [r.module_id, r.completed_at]));
  const firstOpenedAt = new Map<string, string>(); // module_id | subject_id -> first event timestamp

  for (const e of events) {
    const key = e.module_id ? `m:${e.module_id}` : `s:${e.subject_id}`;
    if (!firstOpenedAt.has(key)) firstOpenedAt.set(key, e.created_at);
  }

  // Subscription unlock lookup: (year_id, subject_id) -> earliest unlock created_at
  const unlockAt = new Map<string, string>();
  for (const s of subscriptions) {
    const key = `${s.year_id}:${s.subject_id ?? "year"}`;
    const existing = unlockAt.get(key);
    if (!existing || s.created_at < existing) unlockAt.set(key, s.created_at);
  }

  // Group modules by subject
  const modulesBySubject = new Map<string, ModuleRow[]>();
  for (const m of allModules) {
    const list = modulesBySubject.get(m.subject_id) ?? [];
    list.push(m);
    modulesBySubject.set(m.subject_id, list);
  }

  // Group subjects by year
  const yearMap = new Map<string, { label: string; sortOrder: number; subjects: typeof subjects }>();
  for (const s of subjects) {
    const yr = (s as unknown as { years: { id: string; label: string; sort_order: number } | null }).years;
    if (!yr) continue;
    if (!yearMap.has(yr.id)) {
      yearMap.set(yr.id, { label: yr.label, sortOrder: yr.sort_order ?? 0, subjects: [] });
    }
    yearMap.get(yr.id)!.subjects.push(s);
  }

  const sortedYears = Array.from(yearMap.entries()).sort((a, b) => a[1].sortOrder - b[1].sortOrder);

  // Build milestones
  const milestones: RoadmapMilestone[] = [];
  let foundCurrent = false;

  for (let yearIdx = 0; yearIdx < sortedYears.length; yearIdx++) {
    const [yearId, { label: yearLabel, subjects: yearSubjects }] = sortedYears[yearIdx];
    const yearPosition = yearIdx + 1;

    for (const semester of [1, 2] as const) {
      const semSubjects = yearSubjects.filter((s) => s.semester === semester);
      if (semSubjects.length === 0) continue;

      const key = `${yearId}-${semester}`;
      const isCurrentCandidate = !foundCurrent;

      // Aggregate subject-level progress
      const milestoneSubjects: MilestoneSubject[] = [];
      let totalModules = 0;
      let completedModules = 0;
      let inProgressModules = 0;
      let notStartedModules = 0;
      let lockedModules = 0;
      let firstActivityAt: string | null = null;
      let lastActivityAt: string | null = null;
      let unlockedAt: string | null = null;

      for (const s of semSubjects) {
        const subjectModules = modulesBySubject.get(s.id) ?? [];
        const subjectTotal = subjectModules.length;
        totalModules += subjectTotal;

        const subUnlocked = subscriptions.some(
          (sub) => sub.year_id === s.year_id && (sub.subject_id === null || sub.subject_id === s.id)
        );

        if (!subUnlocked) {
          lockedModules += subjectTotal;
          continue;
        }

        // Track earliest unlock for this semester
        const semUnlockKey = `${s.year_id}:${s.id}`;
        const yearUnlockKey = `${s.year_id}:year`;
        const subUnlockAt = unlockAt.get(semUnlockKey) ?? unlockAt.get(yearUnlockKey);
        if (subUnlockAt && (!unlockedAt || subUnlockAt < unlockedAt)) unlockedAt = subUnlockAt;

        let subCompleted = 0;
        let subInProgress = 0;
        const moduleProgressList: ModuleProgress[] = [];

        for (const m of subjectModules) {
          const completedAt = completedAtByModule.get(m.id) ?? null;
          const openedAt = firstOpenedAt.get(`m:${m.id}`) ?? null;

          if (completedAt) {
            subCompleted++;
            completedModules++;
            moduleProgressList.push({
              id: m.id,
              title: m.title,
              status: "done",
              completedAt,
              firstOpenedAt: openedAt,
            });
            if (!firstActivityAt || completedAt < firstActivityAt) firstActivityAt = completedAt;
            if (!lastActivityAt || completedAt > lastActivityAt) lastActivityAt = completedAt;
          } else if (openedAt) {
            subInProgress++;
            inProgressModules++;
            moduleProgressList.push({
              id: m.id,
              title: m.title,
              status: "in-progress",
              completedAt: null,
              firstOpenedAt: openedAt,
            });
            if (!firstActivityAt || openedAt < firstActivityAt) firstActivityAt = openedAt;
            if (!lastActivityAt || openedAt > lastActivityAt) lastActivityAt = openedAt;
          } else {
            notStartedModules++;
            moduleProgressList.push({
              id: m.id,
              title: m.title,
              status: "not-started",
              completedAt: null,
              firstOpenedAt: null,
            });
          }
        }

        milestoneSubjects.push({
          id: s.id,
          title: s.title,
          kind: s.kind,
          unlocked: true,
          totalModules: subjectTotal,
          completedModules: subCompleted,
          inProgressModules: subInProgress,
          modules: moduleProgressList,
        });
      }

      const label = milestoneLabel(yearLabel, semester);
      const state = deriveMilestoneState(
        { totalModules, completedModules, lockedModules },
        isCurrentCandidate && !foundCurrent
      );

      if (state === "current" && !foundCurrent) {
        foundCurrent = true;
      }

      milestones.push({
        key,
        label,
        yearId,
        semester,
        yearPosition,
        state,
        totalModules,
        completedModules,
        inProgressModules,
        notStartedModules,
        lockedModules,
        unlockedAt,
        firstActivityAt,
        lastActivityAt,
        subjects: milestoneSubjects,
      });
    }
  }

  // If no current milestone found, mark the first unlocked/upcoming as current
  if (!foundCurrent) {
    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].state !== "locked") {
        milestones[i].state = "current";
        break;
      }
    }
  }

  // Overall stats (only counting unlocked modules)
  const overallTotal = milestones.reduce((sum, m) => sum + m.totalModules - m.lockedModules, 0);
  const overallCompleted = milestones.reduce((sum, m) => sum + m.completedModules, 0);
  const overallInProgress = milestones.reduce((sum, m) => sum + m.inProgressModules, 0);

  return {
    journeyStartedAt,
    milestones,
    overall: {
      totalModules: overallTotal,
      completedModules: overallCompleted,
      inProgressModules: overallInProgress,
      completionRate: overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0,
    },
  };
}

// Local helpers (avoid circular import with dashboard.ts)
function milestoneLabel(yearLabel: string, semester: number): string {
  const semLabel = semester === 1 ? "1st" : "2nd";
  return `${yearLabel} • ${semLabel} Semester`;
}

function deriveMilestoneState(
  milestone: Pick<RoadmapMilestone, "totalModules" | "completedModules" | "lockedModules">,
  isCurrent: boolean
): RoadmapMilestone["state"] {
  if (milestone.lockedModules === milestone.totalModules && milestone.totalModules > 0) {
    return "locked";
  }
  if (milestone.completedModules === milestone.totalModules && milestone.totalModules > 0) {
    return "completed";
  }
  if (isCurrent) return "current";
  return "upcoming";
}
