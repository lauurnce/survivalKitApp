import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

export function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

// An active subscription row, narrowed to the fields that decide unlocking.
export interface ActiveSub {
  year_id: string;
  subject_id: string | null;
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
