import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularModules, type PopularModule } from "@/components/PopularModules";
import { createServerClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createServerClient();

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
      .select("id, label")
      .in("id", yearIds.length > 0 ? yearIds : ["__none__"]);

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
    <main className="min-h-screen bg-paper flex flex-col justify-between px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />

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
        <Link
          href="/year"
          className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />

      {/* Popular modules — hidden when no reads */}
      <PopularModules modules={popularModules} />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
    </main>
  );
}
