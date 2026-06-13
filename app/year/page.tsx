import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";

export const dynamic = "force-dynamic";

export default async function YearPage() {
  const supabase = createServerClient();
  const [{ data: years }, { data: subjects }] = await Promise.all([
    supabase.from("years").select("*").order("sort_order"),
    supabase.from("subjects").select("id, year_id, semester, kind"),
  ]);

  // Count subjects per year, grouped by semester
  function subjectStats(yearId: string) {
    const rows = subjects?.filter((s) => s.year_id === yearId) ?? [];
    const sem1 = rows.filter((s) => s.semester === 1).length;
    const sem2 = rows.filter((s) => s.semester === 2).length;
    const major = rows.filter((s) => s.kind === "major").length;
    const minor = rows.filter((s) => s.kind === "minor").length;
    return { total: rows.length, sem1, sem2, major, minor };
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="year_select" />
      <BackLink href="/" label="Home" />

      <div className="mt-12 mb-16">
        <p className="label mb-4">§ 01 — Select Year</p>
        <h1 className="font-serif text-display-lg text-ink">
          Which year are you in?
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {years?.map((year, i) => {
          const stats = subjectStats(year.id);
          return (
            <Link
              key={year.id}
              href={`/year/${year.id}/subjects`}
              className="group border border-ink-faint hover:border-ink p-8 flex flex-col gap-4 transition-colors duration-150"
            >
              <span className="label-sm">§ 0{i + 1}</span>
              <h2 className="font-serif text-display-md text-ink group-hover:text-accent transition-colors duration-150">
                {year.label}
              </h2>

              {stats.total > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="font-sans text-xs text-ink-muted">
                    {stats.major} major · {stats.minor} minor
                  </p>
                  <p className="font-sans text-xs text-ink-faint">
                    Sem 1: {stats.sem1} subjects · Sem 2: {stats.sem2} subjects
                  </p>
                </div>
              )}

              <span className="font-sans text-sm text-ink-muted mt-auto group-hover:text-ink transition-colors">
                View subjects →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
