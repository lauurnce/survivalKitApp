import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { hasDashboardReferrer } from "@/lib/navigation";
import { NavRail } from "@/components/dashboard/NavRail";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageTracker } from "@/components/PageTracker";
import { SubjectAccordion, type SubjectModule } from "@/components/SubjectAccordion";
import { sectionLabel } from "@/lib/sectionLabel";
import { getAccountOverview } from "@/lib/account";
import { getYears, getSubjectsByYear, getSubjectCounters, getModulesBySubject } from "@/lib/cache/queries";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface Props {
  params: Promise<{ yearId: string }>;
  searchParams: Promise<{ from?: string }>;
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

export default async function SubjectsPage({ params, searchParams }: Props) {
  const { yearId } = await params;
  const resolvedSearchParams = await searchParams;
  const fromDashboard = hasDashboardReferrer({ get: (k) => (k === "from" ? resolvedSearchParams.from ?? null : null) });

  const userId = await getCurrentUserId();
  const overview = userId
    ? await getAccountOverview(userId)
    : { overallDone: 0, overallTotal: 0 };

  const showNavRail = userId || fromDashboard;

  // Use cached queries for static data
  const year = (await getYears()).find((y) => y.id === yearId);
  const rawSubjects = await getSubjectsByYear(yearId);
  const subjectCounters = await getSubjectCounters((rawSubjects ?? []).map((s) => s.id));

  if (!year) notFound();
  if (year.coming_soon) notFound();

  const subjects = (rawSubjects ?? []) as Subject[];
  const sem1 = subjects.filter((s) => s.semester === 1);
  const sem2 = subjects.filter((s) => s.semester === 2);

  // Module ids per subject — used by the per-subject progress bar (client-side
  // completion lookup happens in <SubjectProgressBar /> via the device_id).
  const subjectIds = subjects.length > 0 ? subjects.map((s) => s.id) : [];
  const modulesBySubject = new Map<string, SubjectModule[]>();
  
  if (subjectIds.length > 0) {
    // Fetch modules for all subjects in parallel
    const modulesPromises = subjectIds.map((subjectId) => getModulesBySubject(subjectId));
    const modulesResults = await Promise.all(modulesPromises);
    
    subjectIds.forEach((subjectId, index) => {
      const modules = modulesResults[index] ?? [];
      modulesBySubject.set(subjectId, modules.map((m) => ({ id: m.id, title: m.title, sort_order: m.sort_order })));
    });
  }

  function readCount(subjectId: string): number {
    return subjectCounters?.find((c) => c.resource_id === subjectId)?.read_count ?? 0;
  }

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {showNavRail && (
        <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
      )}
      <div className="flex-1 min-w-0">
        <main className="min-h-screen bg-paper flex flex-col">
          <PageTracker event="subject_open" yearId={yearId} />

          {/* Page header — dark navy */}
          <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
            <div className="max-w-wide mx-auto">
              <Breadcrumbs
                items={[{ label: "Year", href: "/year" }, { label: year.label }]}
                className="mb-6"
              />
              <BackLink
                href={`/year/${yearId}`}
                label="Select Year"
                className="text-taupe hover:text-paper"
                dashboardFallback={{ href: "/account", label: "Back to Dashboard" }}
                searchParams={{ get: (k) => (k === "from" ? resolvedSearchParams.from : null) }}
              />
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
      </div>
    </div>
  );
}
