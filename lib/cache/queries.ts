import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

function getSupabase() {
  return createServerClient();
}

// Years list — static, rarely changes
export const getYears = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from("years").select("*").order("sort_order");
    return data ?? [];
  },
  ["years"],
  { revalidate: 60, tags: ["years"] }
);

// Subjects by year — static per year
export const getSubjectsByYear = unstable_cache(
  async (yearId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("subjects")
      .select("id, title, slug, semester, kind, sort_order, year_id")
      .eq("year_id", yearId)
      .order("sort_order");
    return data ?? [];
  },
  ["subjects-by-year"],
  { revalidate: 60, tags: ["subjects"] }
);

// All subjects (for search page)
export const getAllSubjects = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("subjects")
      .select("id, title, year_id, sort_order, semester, kind")
      .order("sort_order");
    return data ?? [];
  },
  ["all-subjects"],
  { revalidate: 60, tags: ["subjects"] }
);

// Modules by subject — static per subject
export const getModulesBySubject = unstable_cache(
  async (subjectId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("modules")
      .select("id, title, sort_order, subject_id")
      .eq("subject_id", subjectId)
      .order("sort_order");
    return data ?? [];
  },
  ["modules-by-subject"],
  { revalidate: 60, tags: ["modules"] }
);

// All modules (for search page)
export const getAllModules = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("modules")
      .select("id, title, subject_id, sort_order")
      .order("sort_order");
    return data ?? [];
  },
  ["all-modules"],
  { revalidate: 60, tags: ["modules"] }
);

// Year counters (reader counts)
export const getYearCounters = unstable_cache(
  async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("counters")
      .select("resource_id, reader_count")
      .eq("resource_type", "year");
    return data ?? [];
  },
  ["year-counters"],
  { revalidate: 60, tags: ["counters"] }
);

// Subject counters (read counts)
export const getSubjectCounters = unstable_cache(
  async (subjectIds: string[]) => {
    if (subjectIds.length === 0) return [];
    const supabase = getSupabase();
    const { data } = await supabase
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "subject")
      .in("resource_id", subjectIds);
    return data ?? [];
  },
  ["subject-counters"],
  { revalidate: 60, tags: ["counters"] }
);

// Module counters (read counts)
export const getModuleCounters = unstable_cache(
  async (moduleIds: string[]) => {
    if (moduleIds.length === 0) return [];
    const supabase = getSupabase();
    const { data } = await supabase
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "module")
      .in("resource_id", moduleIds);
    return data ?? [];
  },
  ["module-counters"],
  { revalidate: 60, tags: ["counters"] }
);

// Module content sections
export const getModuleContentSections = unstable_cache(
  async (moduleId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("sections")
      .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
      .eq("module_id", moduleId)
      .eq("kind", "content")
      .order("sort_order");
    return data ?? [];
  },
  ["module-content-sections"],
  { revalidate: 60, tags: ["sections"] }
);

// Activity sections for a module
export const getModuleActivitySections = unstable_cache(
  async (moduleId: string, unlockActivities: boolean) => {
    const supabase = getSupabase();
    const selectFields = unlockActivities
      ? "id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data"
      : "id, kind, heading, sort_order";
    const { data } = await supabase
      .from("sections")
      .select(selectFields)
      .eq("module_id", moduleId)
      .eq("kind", "activity")
      .order("sort_order");
    return data ?? [];
  },
  ["module-activity-sections"],
  { revalidate: 60, tags: ["sections"] }
);

// Activity sections for multiple modules (used in modules page for pro check)
export const getActivitySectionsForModules = unstable_cache(
  async (moduleIds: string[]) => {
    if (moduleIds.length === 0) return [];
    const supabase = getSupabase();
    const { data } = await supabase
      .from("sections")
      .select("id, module_id")
      .eq("kind", "activity")
      .in("module_id", moduleIds);
    return data ?? [];
  },
  ["activity-sections-for-modules"],
  { revalidate: 60, tags: ["sections"] }
);

// Subject with year info (for metadata)
export const getSubjectWithYear = unstable_cache(
  async (subjectId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("subjects")
      .select("id, title, year_id, years(label, sort_order)")
      .eq("id", subjectId)
      .single();
    return data;
  },
  ["subject-with-year"],
  { revalidate: 60, tags: ["subjects"] }
);

// Module with subject and year (for metadata)
export const getModuleWithSubject = unstable_cache(
  async (moduleId: string, subjectId: string) => {
    const supabase = getSupabase();
    const [{ data: mod }, { data: subject }] = await Promise.all([
      supabase.from("modules").select("id, title, subject_id").eq("id", moduleId).eq("subject_id", subjectId).single(),
      supabase.from("subjects").select("id, title, year_id, years(label, sort_order)").eq("id", subjectId).single(),
    ]);
    return { mod, subject };
  },
  ["module-with-subject"],
  { revalidate: 60, tags: ["modules"] }
);

// Sibling modules for navigation
export const getSiblingModules = unstable_cache(
  async (subjectId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("modules")
      .select("id, title, sort_order")
      .eq("subject_id", subjectId)
      .order("sort_order");
    return data ?? [];
  },
  ["sibling-modules"],
  { revalidate: 60, tags: ["modules"] }
);