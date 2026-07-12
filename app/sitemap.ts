import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";

const SITE_URL = "https://survival-kit-app.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const [{ data: years }, { data: subjects }, { data: modules }] = await Promise.all([
    supabase.from("years").select("id, coming_soon"),
    supabase.from("subjects").select("id, year_id"),
    supabase.from("modules").select("id, subject_id"),
  ]);

  const liveYearIds = new Set(
    (years ?? []).filter((y) => !y.coming_soon).map((y) => y.id)
  );
  const liveSubjects = (subjects ?? []).filter((s) => liveYearIds.has(s.year_id));
  const subjectById = new Map(liveSubjects.map((s) => [s.id, s]));

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/year`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
  ];

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

  for (const m of modules ?? []) {
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
