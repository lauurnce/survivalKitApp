import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { formatCount } from "@/lib/counters";

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

  const subjects = (rawSubjects ?? []) as Subject[];
  const sem1 = subjects.filter((s) => s.semester === 1);
  const sem2 = subjects.filter((s) => s.semester === 2);

  function readCount(subjectId: string): number {
    return subjectCounters?.find((c) => c.resource_id === subjectId)?.read_count ?? 0;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="subject_open" yearId={yearId} />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <BackLink href="/year" label="Select Year" className="text-taupe hover:text-paper" />
        <div className="mt-10">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            § 0{year.sort_order} — {year.label}
          </p>
          <h1 className="font-serif text-display-lg text-paper">Subjects</h1>
        </div>
      </div>

      {/* Subject list — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="flex flex-col gap-12 max-w-wide">
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
                    <Link
                      key={subject.id}
                      href={`/year/${yearId}/subjects/${subject.id}/modules`}
                      className="group flex items-start gap-6 py-8 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
                    >
                      <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                          {subject.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                            {subject.kind === "major" ? "Major" : "Minor"}
                          </span>
                          <span className="font-mono text-label-sm text-ink-faint/40">·</span>
                          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                            <span className="text-ink-muted">{formatCount(readCount(subject.id))}</span> reads
                          </span>
                        </div>
                      </div>
                      <span className="font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}
