import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { canonicalOrigin } from "@/lib/appOrigin";

const SITE_URL = canonicalOrigin();

export const revalidate = 3600;

const PHASE_PRODUCTION_BUILD = "phase-production-build";

function staticEntries(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/year`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
  ];
}

// What happens when the catalogue can't be read:
//
// - No Supabase env at all (a local or CI `next build` without secrets): serve
//   the static URLs, with a warning, so the build still succeeds.
// - Env present but a query fails during `next build`: same fallback, logged
//   as an error. Failing the deploy over a sitemap during a database blip
//   would be worse, and ISR replaces it within `revalidate`.
// - Env present but a query fails at runtime (ISR revalidation): THROW. Next
//   keeps serving the last good sitemap when regeneration throws, instead of
//   publishing a static-only one for the next hour, which is what silently
//   ignoring the error used to do.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[sitemap] Supabase env is not set; serving static URLs only.");
    return staticEntries();
  }

  const supabase = createServerClient();
  const [years, subjects, modules] = await Promise.all([
    supabase.from("years").select("id, coming_soon"),
    supabase.from("subjects").select("id, year_id"),
    supabase.from("modules").select("id, subject_id"),
  ]);

  const failed = (
    [
      ["years", years.error],
      ["subjects", subjects.error],
      ["modules", modules.error],
    ] as const
  ).filter(([, error]) => error);

  if (failed.length > 0) {
    const detail = failed.map(([table, error]) => `${table}: ${error?.message}`).join("; ");
    console.error(`[sitemap] catalogue query failed (${detail})`);
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      console.error("[sitemap] build-time fallback: publishing static URLs until the next revalidation.");
      return staticEntries();
    }
    throw new Error(`sitemap: catalogue query failed (${detail})`);
  }

  const liveYearIds = new Set(
    (years.data ?? []).filter((y) => !y.coming_soon).map((y) => y.id)
  );
  const liveSubjects = (subjects.data ?? []).filter((s) => liveYearIds.has(s.year_id));
  const subjectById = new Map(liveSubjects.map((s) => [s.id, s]));

  const entries = staticEntries();

  for (const yearId of liveYearIds) {
    entries.push({
      url: `${SITE_URL}/year/${yearId}/subjects`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const s of liveSubjects) {
    entries.push({
      url: `${SITE_URL}/year/${s.year_id}/subjects/${s.id}/modules`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const m of modules.data ?? []) {
    const subject = subjectById.get(m.subject_id);
    if (!subject) continue;
    entries.push({
      url: `${SITE_URL}/year/${subject.year_id}/subjects/${subject.id}/modules/${m.id}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
