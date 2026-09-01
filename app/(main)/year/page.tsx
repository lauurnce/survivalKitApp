import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { signOutAction } from "../../(auth)/actions";
import { NavRail } from "@/components/dashboard/NavRail";
import { PageTracker } from "@/components/PageTracker";
import { YearGrid, type YearCardData } from "@/components/YearGrid";
import { SubjectsTour } from "@/components/tour/SubjectsTour";
import { hasDashboardReferrer } from "@/lib/navigation";
import { getYears, getAllSubjects, getYearCounters } from "@/lib/cache/queries";

// Year list is static; user progress on nav rail is cached for 60s (acceptable for progress indicator).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Select Year",
  description: "Pick your year level to browse BSIT subjects and modules.",
};

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function YearPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const fromDashboard = hasDashboardReferrer({ get: (k) => (k === "from" ? resolvedSearchParams.from ?? null : null ) });
  // Same dashboard shell as Resources/Roadmap/Profile. Anonymous visitors see
  // the page with zeroed rail progress until they sign in.
  const userId = await getCurrentUserId();
  const overview = userId
    ? await getAccountOverview(userId)
    : { overallDone: 0, overallTotal: 0 };

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

  const showNavRail = userId || fromDashboard;

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {showNavRail && (
        <>
          <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
          {/* Only for visitors arriving via the dashboard shell — anon
              visitors browsing here from the public landing page already
              saw the landing tour (#60) and shouldn't see this one too. */}
          <SubjectsTour />
        </>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          {userId && (
            <form action={signOutAction}>
              <button className="text-xs text-ink-muted underline">Log out</button>
            </form>
          )}
        </div>

        <main className="min-h-screen bg-paper flex flex-col">
          <PageTracker event="year_select" />

          {/* Page header — dark navy */}
          <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
            <div className="max-w-wide mx-auto">
              <div className="flex items-center justify-end gap-4">
                <Link
                  href="/search"
                  prefetch={true}
                  data-tour="subjects-search"
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
            <div className="max-w-wide mx-auto" data-tour="subjects-years">
              <YearGrid cards={cards} fromDashboard={fromDashboard} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
