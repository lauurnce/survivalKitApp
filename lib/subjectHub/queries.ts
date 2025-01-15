import { unstable_cache } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

// Content-section counts per module, so the subject hub can skip a module that
// would open on an empty page. Only ids and module ids are read, never bodies.
//
// Returns null (not an empty map) when the query fails, so callers treat every
// module as openable instead of hiding real lessons on a transient error.
export async function fetchContentSectionCounts(
  moduleIds: string[],
): Promise<Record<string, number> | null> {
  if (moduleIds.length === 0) return {};
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sections")
    .select("module_id")
    .eq("kind", "content")
    .in("module_id", moduleIds);
  if (error || !data) return null;
  return countByModule(moduleIds, data);
}

export function countByModule(moduleIds: string[], rows: { module_id: string }[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(moduleIds.map((id) => [id, 0]));
  for (const row of rows) {
    if (row.module_id in counts) counts[row.module_id] += 1;
  }
  return counts;
}

export const getContentSectionCounts = unstable_cache(fetchContentSectionCounts, ["subject-hub-content-counts"], {
  revalidate: 60,
  tags: ["sections"],
});
