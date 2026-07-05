import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { PageTracker } from "@/components/PageTracker";
import { YearGrid, type YearCardData } from "@/components/YearGrid";

export const revalidate = 300;

export default async function YearPage() {
  const supabase = createServerClient();
  const [{ data: years }, { data: subjects }, { data: yearCounters }] = await Promise.all([
    supabase.from("years").select("*").order("sort_order"),
    supabase.from("subjects").select("id, year_id, semester, kind"),
    supabase.from("counters").select("resource_id, reader_count").eq("resource_type", "year"),
  ]);

  const cards: YearCardData[] = (years ?? []).map((year) => {
    const rows = subjects?.filter((s) => s.year_id === year.id) ?? [];
    return {
      id: year.id,
      label: year.label,
      coming_soon: year.coming_soon,
      stats: {
        total: rows.length,
        sem1: rows.filter((s) => s.semester === 1).length,
        sem2: rows.filter((s) => s.semester === 2).length,
        major: rows.filter((s) => s.kind === "major").length,
        minor: rows.filter((s) => s.kind === "minor").length,
      },
      readers: yearCounters?.find((c) => c.resource_id === year.id)?.reader_count ?? 0,
    };
  });

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="year_select" />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
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
      </div>

      {/* Year cards — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <YearGrid cards={cards} />
        </div>
      </div>
    </main>
  );
}
