import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { SearchClient, type SearchItem } from "@/components/SearchClient";

export const revalidate = 300;

export default async function SearchPage() {
  const supabase = createServerClient();

  const [{ data: years }, { data: subjects }, { data: modules }] = await Promise.all([
    supabase.from("years").select("id, label, sort_order"),
    supabase.from("subjects").select("id, year_id, title"),
    supabase.from("modules").select("id, subject_id, title"),
  ]);

  const yearById = new Map((years ?? []).map((y) => [y.id, y]));
  const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));

  const items: SearchItem[] = [];

  for (const subject of subjects ?? []) {
    const year = yearById.get(subject.year_id);
    items.push({
      type: "subject",
      id: subject.id,
      title: subject.title,
      href: `/year/${subject.year_id}/subjects/${subject.id}/modules`,
      context: year?.label ?? "Subject",
    });
  }

  for (const mod of modules ?? []) {
    const subject = subjectById.get(mod.subject_id);
    if (!subject) continue;
    const year = yearById.get(subject.year_id);
    items.push({
      type: "module",
      id: mod.id,
      title: mod.title,
      href: `/year/${subject.year_id}/subjects/${subject.id}/modules/${mod.id}`,
      context: [year?.label, subject.title].filter(Boolean).join(" · "),
    });
  }

  // Stable ordering: subjects before modules, then alphabetical by title.
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === "subject" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <BackLink href="/year" label="Select Year" className="text-taupe hover:text-paper" />
          <div className="mt-10">
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
              § Search
            </p>
            <h1 className="font-serif text-display-lg text-paper">Find anything</h1>
          </div>
        </div>
      </div>

      {/* Search body — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <SearchClient items={items} />
        </div>
      </div>
    </main>
  );
}
