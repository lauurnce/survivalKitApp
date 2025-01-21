import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardNavRail } from "@/components/dashboard/SessionShell";
import { ReferrerBackLink } from "@/components/ReferrerAware";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageTracker } from "@/components/PageTracker";
import { RecentLessons } from "@/components/retention/RecentLessons";
import { SubjectAccordion, type SubjectModule } from "@/components/SubjectAccordion";
import { sectionLabel } from "@/lib/sectionLabel";
import { getYears, getSubjectsByYear, getModuleCounters, getModulesBySubject } from "@/lib/cache/queries";
import { sumReadsBySubject } from "@/lib/cache/countersSum";
import { pageMetadata, subjectsDescription } from "@/lib/seo/pageMetadata";
import { subjectsPath } from "@/lib/routes/canonicalChain";

export const revalidate = 60;

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

// Reads through the same cached queries as the page, instead of a second,
// uncached `years` query on every regeneration.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { yearId } = await params;
  const year = (await getYears()).find((y) => y.id === yearId);
  if (!year || year.coming_soon) return {};
  const subjects = ((await getSubjectsByYear(yearId)) ?? []) as Subject[];
  return pageMetadata({
    title: `${year.label} BSIT Subjects`,
    description: subjectsDescription(year.label, subjects),
    path: subjectsPath(year.id),
  });
}

// Prerendered on first request per year (ISR, 60s) and CDN-cached. The nav
// rail and the ?from=dashboard back link resolve client-side.
export async function generateStaticParams() {
  return [];
}

export default async function SubjectsPage({ params }: Props) {
  const { yearId } = await params;

  // The year is the root of the chain: 404 an unknown or unreleased year
  // before its subjects are fetched, so a junk id costs no subjects query.
  const year = (await getYears()).find((y) => y.id === yearId);
  if (!year) notFound();
  if (year.coming_soon) notFound();

  const rawSubjects = await getSubjectsByYear(yearId);

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

  // A subject's reads are its lessons' reads summed (QA CT-12): its own
  // counter only counted module-list opens, so CP1 trailed its own Lesson 1.
  const moduleCounters = await getModuleCounters([...modulesBySubject.values()].flat().map((m) => m.id));
  const subjectReads = sumReadsBySubject(
    new Map([...modulesBySubject].map(([id, ms]) => [id, ms.map((m) => m.id)])),
    moduleCounters ?? [],
  );

  function readCount(subjectId: string): number {
    return subjectReads.get(subjectId) ?? 0;
  }

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <DashboardNavRail />
      <div className="flex-1 min-w-0">
        <main className="min-h-screen bg-paper flex flex-col">
          <PageTracker event="subject_open" yearId={yearId} />

          {/* Page header — inverse band, dark in both themes */}
          <div className="bg-inverse px-6 py-12 md:px-16 md:py-16">
            <div className="max-w-wide mx-auto">
              <Breadcrumbs
                items={[{ label: "Year", href: "/year" }, { label: year.label }]}
                className="mb-6"
              />
              <ReferrerBackLink
                href="/year"
                label="Select Year"
                className="text-on-inverse/70 hover:text-on-inverse"
                dashboardFallback={{ href: "/account", label: "Back to Dashboard" }}
              />
              <div className="mt-10">
                <p className="font-mono text-label-md uppercase tracking-[0.1em] text-on-inverse/70 mb-4">
                  {sectionLabel(year.sort_order)} — {year.label}
                </p>
                <h1 className="font-serif text-display-lg text-on-inverse">Subjects</h1>
              </div>
            </div>
          </div>

          {/* Subject list — cream */}
          <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
            <div className="flex flex-col gap-12 max-w-wide mx-auto">
              <RecentLessons yearId={yearId} extra={1} />
              {[
                { label: "1st Semester", items: sem1 },
                { label: "2nd Semester", items: sem2 },
              ]
                .filter(({ items }) => items.length > 0)
                .map(({ label, items }) => (
                  <section key={label}>
                    {/* Semester label — dark band */}
                    <div className="bg-inverse px-4 py-3 mb-6 inline-block">
                      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-on-inverse/70">
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
