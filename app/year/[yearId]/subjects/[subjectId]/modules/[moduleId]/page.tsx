import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { SectionRenderer } from "@/components/SectionRenderer";
import { PageTracker } from "@/components/PageTracker";

export const revalidate = 300;

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

  const { data: contentSections } = await supabase
    .from("sections")
    .select("id, kind, heading, body_md, sort_order, ide_language, starter_code")
    .eq("module_id", moduleId)
    .eq("kind", "content")
    .order("sort_order");

  const { data: activityMeta } = await supabase
    .from("sections")
    .select("id, kind, heading, sort_order")
    .eq("module_id", moduleId)
    .eq("kind", "activity")
    .order("sort_order");

  const unlockAll = process.env.UNLOCK_ALL === "true";

  const allSections = [
    ...(contentSections ?? []),
    ...(activityMeta ?? []).map((s) => ({ ...s, body_md: "", ide_language: null, starter_code: null })),
  ].sort((a, b) => a.sort_order - b.sort_order);

  const year = subject.years as { label: string; sort_order: number } | null;

  return (
    <main className="min-h-screen bg-paper">
      <PageTracker event="module_open" yearId={yearId} subjectId={subjectId} moduleId={moduleId} />

      {/* Top nav — dark navy */}
      <div className="bg-navy px-6 py-8 md:px-16 border-b border-paper/10">
        <BackLink
          href={`/year/${yearId}/subjects/${subjectId}/modules`}
          label={subject.title}
          className="text-taupe hover:text-paper"
        />
      </div>

      {/* Module header — dark navy */}
      <header className="bg-navy px-6 pt-10 pb-12 md:px-16 border-b border-paper/10 max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
          § 0{year?.sort_order ?? "?"} — {subject.title}
        </p>
        <h1 className="font-serif text-display-md text-paper">{mod.title}</h1>
      </header>

      {/* Article content — cream */}
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
