import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { SubjectAccordion, type SubjectModule } from "@/components/SubjectAccordion";
import { sectionLabel } from "@/lib/sectionLabel";

export const revalidate = 300;

interface Props {
  params: Promise<{ yearId: string }>;
}

interface Subject {
  id: string;
  title: string;
  slug: string;
  semester: number;
  kind: "major" | "minor";
  sort_order: number;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { yearId } = await params;
  const supabase = createServerClient();
  const { data: year } = await supabase
    .from("years")
    .select("label")
    .eq("id", yearId)
    .single();
  if (!year) return {};
  return {
    title: `${year.label} Subjects`,
    description: `Browse all ${year.label} BSIT subjects, modules, and reviewers.`,
  };
}

export default async function SubjectsPage({ params }: Props) {
  const { yearId } = await params;
  const supabase = createServerClient();

  const [{ data: year }, { data: rawSubjects }, { data: subjectCounters }] = await Promise.all([
    supabase.from("years").select("*").eq("id", yearId).single(),
    supabase
      .from("subjects")
      .select("*")
      .eq("year_id", yearId)
      .order("sort_order"),
    supabase.from("counters").select("resource_id, read_count").eq("resource_type", "subject"),
  ]);

  if (!year) notFound();
  if (year.coming_soon) notFound();

  const subjects = (rawSubjects ?? []) as Subject[];
  const sem1 = subjects.filter((s) => s.semester === 1);
  const sem2 = subjects.filter((s) => s.semester === 2);

  // Module ids per subject — used by the per-subject progress bar (client-side
  // completion lookup happens in <SubjectProgressBar /> via the device_id).
  const { data: subjectModules } = await supabase
    .from("modules")
    .select("id, title, sort_order, subject_id")
    .in("subject_id", subjects.length > 0 ? subjects.map((s) => s.id) : ["__none__"])
    .order("sort_order");

  const modulesBySubject = new Map<string, SubjectModule[]>();
  for (const m of subjectModules ?? []) {
    const list = modulesBySubject.get(m.subject_id) ?? [];
    list.push({ id: m.id, title: m.title, sort_order: m.sort_order });
    modulesBySubject.set(m.subject_id, list);
  }

  function readCount(subjectId: string): number {
    return subjectCounters?.find((c) => c.resource_id === subjectId)?.read_count ?? 0;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="subject_open" yearId={yearId} />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <BackLink href="/year" label="Select Year" className="text-taupe hover:text-paper" />
          <div className="mt-10">
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
              {sectionLabel(year.sort_order)} — {year.label}
            </p>
            <h1 className="font-serif text-display-lg text-paper">Subjects</h1>
          </div>
        </div>
      </div>

      {/* Subject list — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="flex flex-col gap-12 max-w-wide mx-auto">
          {[
            { label: "1st Semester", items: sem1 },
            { label: "2nd Semester", items: sem2 },
          ]
            .filter(({ items }) => items.length > 0)
            .map(({ label, items }) => (
              <section key={label}>
                {/* Semester label — dark band */}
                <div className="bg-navy px-4 py-3 mb-6 inline-block">
                  <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">
                    {label}
                  </p>
                </div>

                <div className="flex flex-col divide-y divide-ink-faint/30">
                  {items.map((subject, i) => (
                    <SubjectAccordion
                      key={subject.id}
                      subject={subject}
                      modules={modulesBySubject.get(subject.id) ?? []}
                      yearId={yearId}
                      index={i}
                      reads={readCount(subject.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}
