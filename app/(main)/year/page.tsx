import type { Metadata } from "next";
import Link from "next/link";
import { DashboardNavRail, SessionLogoutButton } from "@/components/dashboard/SessionShell";
import { PageTracker } from "@/components/PageTracker";
import { type YearCardData } from "@/components/YearGrid";
import { ReferrerYearGrid } from "@/components/ReferrerAware";
import { SubjectsTour } from "@/components/tour/SubjectsTour";
import { RecentLessons } from "@/components/retention/RecentLessons";
import { ExamCountdown } from "@/components/retention/ExamCountdown";
import { InstallPrompt } from "@/components/retention/InstallPrompt";
import { getYears, getAllSubjects, getYearCounters } from "@/lib/cache/queries";
import { pageMetadata } from "@/lib/seo/pageMetadata";

// Prerendered (ISR, 60s) and CDN-cached: identical for every visitor. The
// session-dependent bits — nav rail, its progress, log out — and the
// ?from=dashboard variant are resolved client-side.
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "BSIT Subjects by Year",
  description:
    "Every BSIT subject from 1st to 4th year, by semester — free lesson notes, programming guides and reviewers for each module.",
  path: "/year",
});

export default async function YearPage() {
  // Use cached queries for static data
  const [years, allSubjects, yearCounters] = await Promise.all([
    getYears(),
    getAllSubjects(),
    getYearCounters(),
  ]);

  const cards: YearCardData[] = (years ?? []).map((year) => {
    const rows = (allSubjects ?? []).filter((s) => s.year_id === year.id);
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
    <div className="min-h-screen bg-paper lg:flex">
      {/* Same dashboard shell as Resources/Roadmap/Profile, shown to signed-in
          readers and anyone arriving via the dashboard. The tour rides along:
          anon visitors browsing here from the public landing page already
          saw the landing tour (#60) and shouldn't see this one too. */}
      <DashboardNavRail>
        <SubjectsTour />
      </DashboardNavRail>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          <SessionLogoutButton />
        </div>

        <main className="min-h-screen bg-paper flex flex-col">
          <PageTracker event="year_select" />

          {/* Page header — inverse band, dark in both themes */}
          <div className="bg-inverse px-6 py-12 md:px-16 md:py-16">
            <div className="max-w-wide mx-auto">
              <div className="flex items-center justify-end gap-4">
                <Link
                  href="/search"
                  prefetch={true}
                  data-tour="subjects-search"
                  className="inline-flex items-center gap-2 font-sans text-sm text-on-inverse/70 hover:text-on-inverse transition-colors duration-150"
                >
                  <span className="text-accent">⌕</span>
                  <span>Search</span>
                </Link>
              </div>
              <div className="mt-10">
                <p className="font-mono text-label-md uppercase tracking-[0.1em] text-on-inverse/70 mb-4">
                  § 01 — Select Year
                </p>
                <h1 className="font-serif text-display-lg text-on-inverse">
                  Which year are you in?
                </h1>
              </div>
            </div>
          </div>

          {/* Year cards — cream */}
          <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
            <ExamCountdown className="mx-auto mb-10" />
            <RecentLessons extra={1} className="mx-auto mb-12" />
            <InstallPrompt className="mx-auto mb-12" />
            <div className="max-w-wide mx-auto" data-tour="subjects-years">
              <ReferrerYearGrid cards={cards} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
