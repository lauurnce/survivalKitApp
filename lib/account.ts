import { createServerClient } from "./supabase/server";
import { isSubscribed } from "./subscriptions";

export function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
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

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, year_id, years(id, label, sort_order)")
    .order("sort_order");

  const { data: progressRows } = await supabase
    .from("module_progress").select("module_id").eq("user_id", userId);
  const doneModuleIds = new Set((progressRows ?? []).map((r) => r.module_id));

  const summaries: SubjectSummary[] = [];
  const yearMap = new Map<string, YearGroup>();
  let overallDone = 0, overallTotal = 0;
  let yearLabel: string | null = null;

  for (const s of subjects ?? []) {
    const { data: mods } = await supabase
      .from("modules").select("id, title").eq("subject_id", s.id).order("sort_order");
    const moduleSummaries: ModuleSummary[] = (mods ?? []).map((m) => ({
      id: m.id, title: m.title, done: doneModuleIds.has(m.id),
    }));
    const doneCount = moduleSummaries.filter((m) => m.done).length;
    const totalCount = moduleSummaries.length;
    const unlocked = await isSubscribed("", s.year_id, s.id, userId);
    if (unlocked) { overallDone += doneCount; overallTotal += totalCount; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yr = (s as any).years;
    yearLabel = yearLabel ?? yr?.label ?? null;
    const summary: SubjectSummary = {
      id: s.id, title: s.title, yearId: s.year_id,
      unlocked, doneCount, totalCount, modules: moduleSummaries,
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
