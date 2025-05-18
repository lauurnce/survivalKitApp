import type { Metadata } from "next";
import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularModules, type PopularModule } from "@/components/PopularModules";
import { LandingTour } from "@/components/tour/LandingTour";
import { createServerClient } from "@/lib/supabase/server";
import { getCp1StartPath } from "@/lib/landing";
import { cheapestSubjectPrice } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo/pageMetadata";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "BSIT Survival Kit — Free lessons and reviewers for BSIT students",
  absoluteTitle: true,
  description:
    "Free lesson notes for BSIT subjects — Computer Programming 1, Introduction to Computing, Discrete Structures and more — plus reviewers with answer keys, organized by year and semester.",
  path: "/",
});

export default async function LandingPage() {
  const supabase = createServerClient();
  const startPath = await getCp1StartPath();

  // Fetch top 5 module IDs by read_count
  const { data: topCounters } = await supabase
    .from("counters")
    .select("resource_id, read_count")
    .eq("resource_type", "module")
    .gt("read_count", 0)
    .order("read_count", { ascending: false })
    .limit(5);

  const topModuleIds = (topCounters ?? []).map((c) => c.resource_id);
  let popularModules: PopularModule[] = [];

  if (topModuleIds.length > 0) {
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, subject_id")
      .in("id", topModuleIds);

    const subjectIds = [...new Set((modules ?? []).map((m) => m.subject_id))];
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, title, year_id")
      .in("id", subjectIds.length > 0 ? subjectIds : ["__none__"]);

    const yearIds = [...new Set((subjects ?? []).map((s) => s.year_id))];
    const { data: years } = await supabase
      .from("years")
      .select("id, label, coming_soon")
      .in("id", yearIds.length > 0 ? yearIds : ["__none__"])
      .eq("coming_soon", false);

    const moduleMap = new Map((modules ?? []).map((m) => [m.id, m]));
    const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));
    const yearMap = new Map((years ?? []).map((y) => [y.id, y]));

    popularModules = topModuleIds
      .map((id) => {
        const mod = moduleMap.get(id);
        if (!mod) return null;
        const subject = subjectMap.get(mod.subject_id);
        if (!subject) return null;
        const year = yearMap.get(subject.year_id);
        if (!year) return null;
        return {
          moduleId: mod.id,
          moduleTitle: mod.title,
          subjectId: subject.id,
          subjectTitle: subject.title,
          yearId: year.id,
          yearLabel: year.label,
        };
      })
      .filter((m): m is PopularModule => m !== null);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />
      <LandingTour />
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col gap-16">

      {/* Header label */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs,
          organized by year and subject. Start wherever you need to.
        </p>
        {/* One primary action. First-years are most of our readers and CP1 is
            their subject, so the main button drops them straight into Lesson 1
            (whose reviewers are the free sample). Every other subject stays one
            tap away via "Browse all subjects". If the CP1 lookup fails, the
            all-subjects link takes the primary slot instead. */}
        {startPath && (
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4">
            First year? Begin with {startPath.subjectTitle} — Lesson 1 and its reviewers are free.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-8">
          {startPath ? (
            <>
              <Link
                href={startPath.href}
                data-tour="landing-start"
                className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
              >
                Start Lesson 1
                <span className="text-accent">→</span>
              </Link>
              <Link
                href="/year"
                data-tour="landing-subjects"
                className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-ink-muted hover:text-ink transition-colors duration-150"
              >
                Browse all subjects
              </Link>
            </>
          ) : (
            <Link
              href="/year"
              data-tour="landing-subjects"
              className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
            >
              Start here
              <span className="text-accent">→</span>
            </Link>
          )}
          <Link
            href="/search"
            data-tour="landing-search"
            className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-ink-muted hover:text-ink transition-colors duration-150"
          >
            <span className="text-accent" aria-hidden="true">⌕</span>
            <span>Search modules</span>
          </Link>
        </div>
      </div>

      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />

      {/* Popular modules — hidden when no reads. The data-tour wrapper is
          conditional too, not just PopularModules' own empty state, so the
          landing tour's "skip a step whose target is missing" behavior sees
          no element at all on a fresh install rather than an empty one. */}
      {popularModules.length > 0 && (
        <div data-tour="landing-popular">
          <PopularModules modules={popularModules} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            For BSIT students
          </span>
          {/* Lessons are free; reviewers are not. Saying only "free to read"
              here contradicted the paywall one tap away (QA CT-05). */}
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent text-right">
            Lessons free · Reviewers from {cheapestSubjectPrice().amountLabel}
          </span>
        </div>
        <p className="font-mono text-label-sm text-ink-faint">
          We never sell your data.
        </p>
      </div>
      </div>
    </main>
  );
}
