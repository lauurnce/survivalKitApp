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

// Reader/read counters (definitions: lib/readCounting.ts). They change on
// every read, so they ride the same 60s revalidation as the pages that show
// them. A failed read throws INSIDE the cache, so unstable_cache never stores
// it and the next request retries; the wrapper then degrades to "no counts"
// (the year cards and module rows hide a zero) instead of failing the page.
type CounterRow<K extends "reader_count" | "read_count"> = { resource_id: string } & Record<K, number>;

function counterQuery<A extends unknown[], R>(
  name: string,
  query: (...args: A) => Promise<R[]>,
): (...args: A) => Promise<R[]> {
  const cached = unstable_cache(query, [name], { revalidate: 60, tags: ["counters"] });
  return async (...args: A) => {
    try {
      return await cached(...args);
    } catch (error) {
      console.error(`${name} read failed:`, error instanceof Error ? error.message : error);
      return [];
    }
  };
}

function rowsOrThrow<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(result.error.message);
  return result.data ?? [];
}

// Year counters (reader counts)
export const getYearCounters = counterQuery("year-counters", async () =>
  rowsOrThrow<CounterRow<"reader_count">>(
    await getSupabase()
      .from("counters")
      .select("resource_id, reader_count")
      .eq("resource_type", "year"),
  ),
);

// Subject counters (read counts)
export const getSubjectCounters = counterQuery("subject-counters", async (subjectIds: string[]) => {
  if (subjectIds.length === 0) return [];
  return rowsOrThrow<CounterRow<"read_count">>(
    await getSupabase()
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "subject")
      .in("resource_id", subjectIds),
  );
});

// Module counters (read counts)
export const getModuleCounters = counterQuery("module-counters", async (moduleIds: string[]) => {
  if (moduleIds.length === 0) return [];
  return rowsOrThrow<CounterRow<"read_count">>(
    await getSupabase()
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "module")
      .in("resource_id", moduleIds),
  );
});

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
// Where a module really lives — its subject and that subject's year — looked
// up by the module id alone. Only the lesson reader's mismatch path calls it:
// a module requested under the wrong subject, so the page can 308 to the
// module's real URL instead of 404ing a link that was shared before.
export const getModuleOwner = unstable_cache(
  async (moduleId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("modules")
      .select("id, subject_id, subjects(year_id)")
      .eq("id", moduleId)
      .maybeSingle();
    if (!data) return null;
    // subjects(...) is a many-to-one embed: an object, but accept an array too.
    const embed = data.subjects as unknown as { year_id: string } | { year_id: string }[] | null;
    const subject = Array.isArray(embed) ? embed[0] : embed;
    if (!subject?.year_id) return null;
    return { moduleId: data.id as string, subjectId: data.subject_id as string, yearId: subject.year_id };
  },
  ["module-owner"],
  { revalidate: 60, tags: ["modules"] }
);
