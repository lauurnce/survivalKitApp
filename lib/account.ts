import { createServerClient } from "./supabase/server";
import { isSubscribed } from "./subscriptions";

export function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export interface SubjectSummary {
  id: string; title: string; yearId: string;
  unlocked: boolean; doneCount: number; totalCount: number;
}
export interface AccountOverview {
  yearLabel: string | null;
  subjects: SubjectSummary[];
  overallDone: number; overallTotal: number;
}

export async function getAccountOverview(userId: string): Promise<AccountOverview> {
  const supabase = createServerClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, year_id, years(label, sort_order)")
    .order("sort_order");

  const { data: progressRows } = await supabase
    .from("module_progress").select("module_id").eq("user_id", userId);
  const doneModuleIds = new Set((progressRows ?? []).map((r) => r.module_id));

  const summaries: SubjectSummary[] = [];
  let overallDone = 0, overallTotal = 0;
  let yearLabel: string | null = null;

  for (const s of subjects ?? []) {
    const { data: mods } = await supabase
      .from("modules").select("id").eq("subject_id", s.id);
    const moduleIds = (mods ?? []).map((m) => m.id);
    const doneCount = moduleIds.filter((id) => doneModuleIds.has(id)).length;
    const unlocked = await isSubscribed("", s.year_id, s.id, userId);
    if (unlocked) { overallDone += doneCount; overallTotal += moduleIds.length; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yearLabel = yearLabel ?? (s as any).years?.label ?? null;
    summaries.push({
      id: s.id, title: s.title, yearId: s.year_id,
      unlocked, doneCount, totalCount: moduleIds.length,
    });
  }

  return { yearLabel, subjects: summaries, overallDone, overallTotal };
}
