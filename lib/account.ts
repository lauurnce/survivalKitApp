import { createServerClient } from "./supabase/server";
import { PH_OFFSET_MS } from "./payments";
import { isUuid } from "./validation";
import type {
  ActivityData,
  ActivityWeek,
  DashboardData,
  RoadmapData,
  RoadmapMilestone,
  MilestoneSubject,
  ModuleProgress,
  SubscriptionTimelineItem,
} from "./dashboard";
// A value import is safe here: dashboard.ts imports only types from this
// module, which are erased at build time, so there is no runtime cycle.
import { deriveMilestoneState, milestoneLabel } from "./dashboard";

// Canonical definitions live in ./dashboard; re-exported for existing importers.
export type { ActivityData, ActivityWeek, DashboardData, SubscriptionTimelineItem };

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

// ─── Activity Graph Data ──────────────────────────────────────────────────────

interface EventRowFull {
  event_type: string;
  subject_id: string | null;
  module_id: string | null;
  created_at: string;
}

const ACTIVITY_WINDOW_DAYS = 56; // 8 weeks
const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_PAGE_SIZE = 1000; // PostgREST's default max-rows per request
const ACTIVITY_MAX_PAGES = 10;

/** "YYYY-MM-DD" of the Asia/Manila calendar day containing `instant`. */
function phDayKey(instant: Date): string {
  return new Date(instant.getTime() + PH_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * The UTC instant at which the activity window opens: Manila midnight
 * 55 days before today, so the window is 56 whole Manila days ending today.
 */
export function activityWindowStartUtc(now: Date): Date {
  const todayKey = phDayKey(now);
  return new Date(Date.parse(`${todayKey}T00:00:00Z`) - (ACTIVITY_WINDOW_DAYS - 1) * DAY_MS - PH_OFFSET_MS);
}

/**
 * Buckets event timestamps into the 56 Manila calendar days ending today and
 * derives the streaks. Pure, so the day and streak rules are unit-tested.
 *
 * A "day" is an Asia/Manila calendar day (UTC+8, no DST): users are in the
 * Philippines, and events.created_at is timestamptz, returned as UTC ISO.
 * The current streak counts back from today, or from yesterday when today has
 * no activity yet (the day isn't over), and stops at the first gap. The
 * longest streak is the longest run of consecutive active days in the window.
 */
export function buildActivityData(createdAts: string[], now: Date): ActivityData {
  const windowStart = activityWindowStartUtc(now);
  const dayKeys: string[] = [];
  for (let i = 0; i < ACTIVITY_WINDOW_DAYS; i++) {
    dayKeys.push(phDayKey(new Date(windowStart.getTime() + i * DAY_MS)));
  }

  const eventCounts = new Map<string, number>(dayKeys.map((k) => [k, 0]));
  for (const createdAt of createdAts) {
    const t = Date.parse(createdAt);
    if (Number.isNaN(t)) continue;
    const key = phDayKey(new Date(t));
    const count = eventCounts.get(key);
    if (count !== undefined) eventCounts.set(key, count + 1);
  }

  // Group into weeks (Monday-Sunday, Manila calendar)
  const weeks: ActivityWeek[] = [];
  let currentWeek: ActivityWeek | null = null;
  for (const key of dayKeys) {
    const eventCount = eventCounts.get(key)!;
    const isActive = eventCount > 0;
    const dayOfWeek = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0=Sun, 1=Mon...

    if (dayOfWeek === 1 || currentWeek === null) {
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { weekStart: key, activeDays: 0, totalEvents: 0, days: [] };
    }
    currentWeek.days.push({ date: key, isActive, eventCount });
    if (isActive) currentWeek.activeDays++;
    currentWeek.totalEvents += eventCount;
  }
  if (currentWeek) weeks.push(currentWeek);

  const active = dayKeys.map((k) => eventCounts.get(k)! > 0);

  let longestStreak = 0;
  let run = 0;
  for (const isActive of active) {
    run = isActive ? run + 1 : 0;
    if (run > longestStreak) longestStreak = run;
  }

  let currentStreak = 0;
  let i = active.length - 1;
  if (!active[i]) i--; // today not active yet: the streak may still end yesterday
  for (; i >= 0 && active[i]; i--) currentStreak++;

  const totalActiveDays = active.filter(Boolean).length;

  return { weeks, currentStreak, longestStreak, totalActiveDays };
}

/**
 * Fetches activity data for the 56 Manila calendar days ending today.
 * Used for the activity line graph visualization.
 */
export async function getActivityData(deviceId: string | null): Promise<ActivityData> {
  const supabase = createServerClient();
  const now = new Date();

  // events has no user_id column — every row is keyed by device_id, so a
  // signed-in user's activity is only visible through the device cookie set
  // on their browser (the same one subscriptions/unlocks fall back to).
  if (!deviceId) return buildActivityData([], now);

  // Newest first and paged: PostgREST returns at most 1000 rows per request,
  // and an ascending unpaged read kept the oldest 1000, dropping the recent
  // days the streak depends on. Only the 56-day window is read, and a runaway
  // device is capped so one dashboard load can't page forever.
  const since = activityWindowStartUtc(now).toISOString();
  const createdAts: string[] = [];
  for (let page = 0; page < ACTIVITY_MAX_PAGES; page++) {
    const from = page * ACTIVITY_PAGE_SIZE;
    const { data } = await supabase
      .from("events")
      .select("created_at")
      .eq("device_id", deviceId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(from, from + ACTIVITY_PAGE_SIZE - 1);
    const rows = (data ?? []) as Pick<EventRowFull, "created_at">[];
    for (const r of rows) createdAts.push(r.created_at);
    if (rows.length < ACTIVITY_PAGE_SIZE) break;
  }
  return buildActivityData(createdAts, now);
}

// ─── Subscription Timeline Data ───────────────────────────────────────────────

/**
 * Fetches subscription timeline data for visualization.
 * Shows each active subscription as a progress bar with time remaining.
 */
export async function getSubscriptionTimeline(userId: string): Promise<SubscriptionTimelineItem[]> {
  const supabase = createServerClient();
  const now = new Date();
  const nowISO = now.toISOString();

  const subsRes = await supabase
    .from("subscriptions")
    .select("year_id, subject_id, created_at, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", nowISO);

  const subs = (subsRes.data ?? []) as Array<{
    year_id: string;
    subject_id: string | null;
    created_at: string;
    current_period_end: string;
  }>;

  if (subs.length === 0) return [];

  // Fetch year/subject labels
  const yearIds = [...new Set(subs.map(s => s.year_id))];
  const subjectIds = [...new Set(subs.map(s => s.subject_id).filter(Boolean))];

  const [yearsRes, subjectsRes] = await Promise.all([
    yearIds.length > 0
      ? supabase.from("years").select("id, label").in("id", yearIds)
      : { data: [] },
    subjectIds.length > 0
      ? supabase.from("subjects").select("id, title").in("id", subjectIds)
      : { data: [] },
  ]);

  const yearLabels = new Map((yearsRes.data ?? []).map(y => [y.id, y.label]));
  const subjectTitles = new Map((subjectsRes.data ?? []).map(s => [s.id, s.title]));

  return subs.map(sub => {
    const startedAt = new Date(sub.created_at);
    const endsAt = new Date(sub.current_period_end);
    const totalMs = endsAt.getTime() - startedAt.getTime();
    const elapsedMs = now.getTime() - startedAt.getTime();
    const progressPct = totalMs > 0 ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100))) : 0;
    const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      yearId: sub.year_id,
      yearLabel: yearLabels.get(sub.year_id) ?? "Unknown Year",
      subjectId: sub.subject_id,
      subjectTitle: sub.subject_id ? subjectTitles.get(sub.subject_id) ?? null : null,
      startedAt: sub.created_at,
      endsAt: sub.current_period_end,
      daysRemaining,
      progressPct,
      isActive: daysRemaining > 0,
    };
  });
}

// ─── Combined Dashboard Data ──────────────────────────────────────────────────

/**
 * Single batched fetch for all dashboard data.
 * Used by /account page for simplified roadmap + activity graph.
 */
export async function getDashboardData(userId: string, deviceId: string | null): Promise<DashboardData> {
  const [roadmap, activity, subscriptions] = await Promise.all([
    getRoadmapData(userId),
    getActivityData(deviceId),
    getSubscriptionTimeline(userId),
  ]);
  return { roadmap, activity, subscriptions };
}
