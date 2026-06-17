import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { formatCount } from "@/lib/counters";

export const revalidate = 300;

export default async function YearPage() {
  const supabase = createServerClient();
  const [{ data: years }, { data: subjects }, { data: yearCounters }] = await Promise.all([
    supabase.from("years").select("*").order("sort_order"),
    supabase.from("subjects").select("id, year_id, semester, kind"),
    supabase.from("counters").select("resource_id, reader_count").eq("resource_type", "year"),
  ]);

  function subjectStats(yearId: string) {
    const rows = subjects?.filter((s) => s.year_id === yearId) ?? [];
    const sem1 = rows.filter((s) => s.semester === 1).length;
    const sem2 = rows.filter((s) => s.semester === 2).length;
    const major = rows.filter((s) => s.kind === "major").length;
    const minor = rows.filter((s) => s.kind === "minor").length;
    return { total: rows.length, sem1, sem2, major, minor };
  }

  function readerCount(yearId: string): number {
    return yearCounters?.find((c) => c.resource_id === yearId)?.reader_count ?? 0;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="year_select" />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="flex items-center justify-between gap-4">
          <BackLink href="/" label="Home" className="text-taupe hover:text-paper" />
          <Link
            href="/search"
            className="inline-flex items-center gap-2 font-sans text-sm text-taupe hover:text-paper transition-colors duration-150"
          >
            <span className="text-accent">⌕</span>
            <span>Search</span>
          </Link>
        </div>
        <div className="mt-10">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            § 01 — Select Year
          </p>
          <h1 className="font-serif text-display-lg text-paper">
            Which year are you in?
          </h1>
        </div>
      </div>

      {/* Year cards — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {years?.map((year, i) => {
            const stats = subjectStats(year.id);
            return (
              <Link
                key={year.id}
                href={`/year/${year.id}/subjects`}
                className="group border border-ink-faint hover:border-navy hover:bg-navy p-8 flex flex-col gap-4 transition-colors duration-200"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                  § 0{i + 1}
                </span>
                <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200">
                  {year.label}
                </h2>

                {stats.total > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="font-sans text-xs text-ink-muted group-hover:text-taupe transition-colors duration-200">
                      {stats.major} major · {stats.minor} minor
                    </p>
                    <p className="font-sans text-xs text-ink-faint group-hover:text-taupe/70 transition-colors duration-200">
                      Sem 1: {stats.sem1} subjects · Sem 2: {stats.sem2} subjects
                    </p>
                  </div>
                )}

                <span className="font-sans text-sm text-ink-muted mt-auto group-hover:text-paper transition-colors duration-200">
                  View subjects →
                </span>

                <div className="flex items-center gap-2 pt-3 border-t border-ink-faint/20 group-hover:border-taupe/20 transition-colors duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
                    <span className="text-ink-muted group-hover:text-taupe/80 transition-colors duration-200">
                      {formatCount(readerCount(year.id))}
                    </span>{" "}
                    readers
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
