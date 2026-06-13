import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";

export const dynamic = "force-dynamic";

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

  const [{ data: year }, { data: rawSubjects }] = await Promise.all([
    supabase.from("years").select("*").eq("id", yearId).single(),
    supabase
      .from("subjects")
      .select("*")
      .eq("year_id", yearId)
      .order("sort_order"),
  ]);

  if (!year) notFound();

  const subjects = (rawSubjects ?? []) as Subject[];
  const sem1 = subjects.filter((s) => s.semester === 1);
  const sem2 = subjects.filter((s) => s.semester === 2);

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="subject_open" yearId={yearId} />
      <BackLink href="/year" label="Select Year" />

      <div className="mt-12 mb-16">
        <p className="label mb-4">§ 0{year.sort_order} — {year.label}</p>
        <h1 className="font-serif text-display-lg text-ink">Subjects</h1>
      </div>

      <div className="flex flex-col gap-16 max-w-wide">
        {[
          { label: "1st Semester", items: sem1 },
          { label: "2nd Semester", items: sem2 },
        ]
          .filter(({ items }) => items.length > 0)
          .map(({ label, items }) => (
            <section key={label}>
              <p className="label mb-6">{label}</p>
              <div className="flex flex-col divide-y divide-ink-faint/30">
                {items.map((subject, i) => (
                  <Link
                    key={subject.id}
                    href={`/year/${yearId}/subjects/${subject.id}/modules`}
                    className="group flex items-start gap-6 py-8 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
                  >
                    <span className="label-sm mt-1 w-8 shrink-0 text-right">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                        {subject.title}
                      </h2>
                      <span className="label-sm">
                        {subject.kind === "major" ? "Major" : "Minor"}
                      </span>
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
    </main>
  );
}
