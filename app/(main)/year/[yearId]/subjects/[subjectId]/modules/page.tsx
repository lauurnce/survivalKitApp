import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { ModuleDoneToggle } from "@/components/ModuleDoneToggle";
import { SubjectComingSoon } from "@/components/SubjectComingSoon";
import { PaywallTeaser } from "@/components/PaywallTeaser";
import { formatCount } from "@/lib/counters";

export const revalidate = 300;

interface Props {
  params: Promise<{ yearId: string; subjectId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params;
  const supabase = createServerClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("title, years(label)")
    .eq("id", subjectId)
    .single();
  if (!subject) return {};
  const year = subject.years as unknown as { label: string } | null;
  return {
    title: subject.title,
    description: `Modules and reviewers for ${subject.title}${year ? ` (${year.label})` : ""}.`,
  };
}

export default async function ModulesPage({ params }: Props) {
  const { yearId, subjectId } = await params;
  const supabase = createServerClient();

  const [{ data: subject }, { data: modules }, { data: moduleCounters }] = await Promise.all([
    supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
    supabase
      .from("modules")
      .select("*")
      .eq("subject_id", subjectId)
      .order("sort_order"),
    supabase.from("counters").select("resource_id, read_count").eq("resource_type", "module"),
  ]);

  // Concrete reviewer count for the teaser ("N reviewers with answer keys…").
  const moduleIds = (modules ?? []).map((m) => m.id);
  const { count: reviewerCount } = moduleIds.length
    ? await supabase
        .from("sections")
        .select("id", { count: "exact", head: true })
        .eq("kind", "activity")
        .in("module_id", moduleIds)
    : { count: 0 };

  if (!subject) notFound();

  const year = subject.years as { label: string; sort_order: number } | null;

  function readCount(moduleId: string): number {
    return moduleCounters?.find((c) => c.resource_id === moduleId)?.read_count ?? 0;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="subject_open" yearId={yearId} subjectId={subjectId} />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <BackLink
            href={`/year/${yearId}/subjects`}
            label={year?.label ?? "Subjects"}
            className="text-taupe hover:text-paper"
          />
          <div className="mt-10">
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
              § 0{year?.sort_order ?? "?"} — {subject.title}
            </p>
            <h1 className="font-serif text-display-lg text-paper">Modules</h1>
          </div>
        </div>
      </div>

      {/* Module list — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          {modules && modules.length > 0 && (
            <PaywallTeaser
              yearId={yearId}
              subjectId={subjectId}
              yearLabel={year?.label}
              subjectTitle={subject.title}
              ctaHref={`/year/${yearId}/subjects/${subjectId}/modules/${modules[0].id}#subscribe`}
              reviewerCount={reviewerCount ?? undefined}
            />
          )}
        </div>
        <div className="flex flex-col divide-y divide-ink-faint/30 max-w-wide mx-auto">
          {modules?.map((mod, i) => (
            <Link
              key={mod.id}
              href={`/year/${yearId}/subjects/${subjectId}/modules/${mod.id}`}
              className="group flex items-start gap-6 py-8 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
            >
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                  {mod.title}
                </h2>
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                  <span className="text-ink-muted">{formatCount(readCount(mod.id))}</span> reads
                </span>
              </div>
              <ModuleDoneToggle moduleId={mod.id} />
              <span className="font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1">
                →
              </span>
            </Link>
          ))}

          {(!modules || modules.length === 0) && (
            <SubjectComingSoon
              subjectTitle={subject.title}
              yearLabel={year?.label ?? ""}
            />
          )}
        </div>
      </div>
    </main>
  );
}
