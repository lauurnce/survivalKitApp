import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { SectionRenderer } from "@/components/SectionRenderer";
import { PageTracker } from "@/components/PageTracker";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ yearId: string; subjectId: string; moduleId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { yearId, subjectId, moduleId } = await params;
  const supabase = createServerClient();

  const [{ data: mod }, { data: subject }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
  ]);

  if (!mod || !subject) notFound();

  // Fetch content sections (public via RLS)
  const { data: contentSections } = await supabase
    .from("sections")
    .select("id, kind, heading, body_md, sort_order")
    .eq("module_id", moduleId)
    .eq("kind", "content")
    .order("sort_order");

  // Fetch activity section headings (no body — body gated server-side)
  // We only need heading + sort_order to position the locked block correctly
  const { data: activityMeta } = await supabase
    .from("sections")
    .select("id, kind, heading, sort_order")
    .eq("module_id", moduleId)
    .eq("kind", "activity")
    .order("sort_order");

  const unlockAll = process.env.UNLOCK_ALL === "true";

  // Merge sections by sort_order
  const allSections = [
    ...(contentSections ?? []).map((s) => ({ ...s, body_md: s.body_md })),
    ...(activityMeta ?? []).map((s) => ({ ...s, body_md: "" })),
  ].sort((a, b) => a.sort_order - b.sort_order);

  const year = subject.years as { label: string; sort_order: number } | null;

  return (
    <main className="min-h-screen bg-paper">
      <PageTracker event="module_open" yearId={yearId} subjectId={subjectId} moduleId={moduleId} />

      {/* Top nav */}
      <div className="px-6 py-12 md:px-16 md:py-10 border-b border-ink-faint/30">
        <BackLink href={`/year/${yearId}/subjects/${subjectId}/modules`} label={subject.title} />
      </div>

      {/* Module header */}
      <header className="px-6 pt-12 pb-10 md:px-16 max-w-wide border-b border-ink-faint/30">
        <p className="label mb-4">§ 0{year?.sort_order ?? "?"} — {subject.title}</p>
        <h1 className="font-serif text-display-md text-ink">{mod.title}</h1>
      </header>

      {/* Sections */}
      <article className="px-6 py-12 md:px-16 max-w-wide space-y-16">
        {allSections.map((section, i) => (
          <SectionRenderer
            key={section.id}
            section={section}
            index={i}
            moduleId={moduleId}
            unlockAll={unlockAll}
          />
        ))}
      </article>
    </main>
  );
}
