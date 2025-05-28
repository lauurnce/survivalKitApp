import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ModuleDoneToggle } from "@/components/ModuleDoneToggle";
import { ModuleSections, type ReaderSection } from "@/components/ModuleSections";
import { SignedOutOnly } from "@/components/dashboard/SessionShell";
import { PageTracker } from "@/components/PageTracker";
import { PrintButton } from "@/components/PrintButton";
import { PrintGateRoot } from "@/components/PrintGateRoot";
import { LastModuleTracker } from "@/components/LastModuleTracker";
import { PaywallTeaser } from "@/components/PaywallTeaser";
import { UnlockSuccessToast } from "@/components/UnlockSuccessToast";
import { PaidStatusBar } from "@/components/PaidStatusBar";
import { SignupNudgeToast } from "@/components/SignupNudgeToast";
import { ModuleReaderClient } from "@/components/ModuleReaderClient";
import { ModuleSurveyCard } from "@/components/ModuleSurveyCard";
import { LessonOverview } from "@/components/lesson/LessonOverview";
import { freeIdsInModule, pickFreeActivities } from "@/lib/freeSample";
import { cheapestSubjectPrice } from "@/lib/pricing";
import { sectionLabel } from "@/lib/sectionLabel";
import { getModuleWithSubject, getSiblingModules, getModuleContentSections, getModuleActivitySections } from "@/lib/cache/queries";

// Prerendered on first request per module (ISR, 60s) and CDN-cached. The HTML
// is the locked view for every visitor — content, activity headings, and the
// free sample; paid bodies are never in it. Subscribers get them client-side
// from /api/subscription-status?moduleId= (components/ModuleSections.tsx).
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ yearId: string; subjectId: string; moduleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId, moduleId } = await params;
  const { mod, subject } = await getModuleWithSubject(moduleId, subjectId);
  if (!mod) return {};
  return {
    title: subject ? `${mod.title} · ${subject.title}` : mod.title,
    description: `Study notes and reviewers for ${mod.title}${subject ? ` in ${subject.title}` : ""}.`,
  };
}

export default async function ReaderPage({ params }: Props) {
  const { yearId, subjectId, moduleId } = await params;
  const supabase = createServerClient();

  // Use cached queries for static data
  const [{ mod, subject }, siblingModules, contentSections] = await Promise.all([
    getModuleWithSubject(moduleId, subjectId),
    getSiblingModules(subjectId),
    getModuleContentSections(moduleId),
  ]);

  if (!mod || !subject) notFound();

  const siblings = siblingModules ?? [];
  const currentIndex = siblings.findIndex((m) => m.id === moduleId);
  const nextModule =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;
  const prevModule = currentIndex > 0 ? siblings[currentIndex - 1] : null;

  // Per-reader entitlement is NOT read here: this render is shared by every
  // visitor. Only the build-wide UNLOCK_ALL dev flag unlocks the prerendered
  // HTML.
  const unlockActivities = process.env.UNLOCK_ALL === "true";

  // The prerendered page only ever receives activity headings; the full body,
  // drill markdown, and starter code reach subscribers via /api/subscription-status.
  const activityMeta = await getModuleActivitySections(moduleId, unlockActivities);

  // Free sample: locked visitors get every reviewer of the subject's first
  // module in full (lib/freeSample.ts) — the whole paid loop, once. Everything
  // else stays headings-only, gated server-side exactly as before.
  let freeSectionIds: string[] = [];
  let reviewerCount = 0;
  let freeSections: ReaderSection[] = [];
  if (!unlockActivities && siblings.length > 0) {
    const { data: subjectActivities } = await supabase
      .from("sections")
      .select("id, module_id, sort_order")
      .eq("kind", "activity")
      .in("module_id", siblings.map((m) => m.id));
    const rows = subjectActivities ?? [];
    reviewerCount = rows.length;
    freeSectionIds = pickFreeActivities(siblings.map((m) => m.id), rows);

    // Fetch full bodies only for the free sections that live in THIS module.
    const freeHere = freeIdsInModule(
      ((activityMeta ?? []) as unknown as { id: string }[]).map((s) => s.id),
      freeSectionIds
    );
    if (freeHere.length > 0) {
      const { data: full } = await supabase
        .from("sections")
        .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
        .in("id", freeHere);
      freeSections = (full as unknown as ReaderSection[] | null) ?? [];
    }
  }
  const freeById = new Map(freeSections.map((s) => [s.id, s]));

  const allSections: ReaderSection[] = [
    ...((contentSections ?? []) as ReaderSection[]),
    ...((activityMeta ?? []) as Partial<ReaderSection>[]).map((s) => {
      const free = s.id ? freeById.get(s.id) : undefined;
      if (free) return free;
      return {
        body_md: "",
        ide_language: null,
        starter_code: null,
        topology_data: null,
        ...s,
      } as ReaderSection;
    }),
  ].sort((a, b) => a.sort_order - b.sort_order);

  // years(...) is a many-to-one embed, so PostgREST returns an object; accept
  // an array too so a typegen or query change can't silently drop the year.
  const yearEmbed = subject.years as unknown as
    | { label: string; sort_order: number }
    | { label: string; sort_order: number }[]
    | null;
  const year = (Array.isArray(yearEmbed) ? yearEmbed[0] : yearEmbed) ?? null;

  return (
    <ModuleReaderClient moduleId={moduleId} moduleTitle={mod.title}>
      <main className="min-h-screen bg-paper">
      {/* Locked in the static HTML; opens only for a reader entitled to this
          subject. Anyone else's printout is a single notice (globals.css). */}
      <PrintGateRoot yearId={yearId} subjectId={subjectId} subjectTitle={subject.title}>
      <PageTracker event="module_open" yearId={yearId} subjectId={subjectId} moduleId={moduleId} />
      {/* Post-payment confirmation: shown once, when the shared status
          confirms the unlock; self-dismisses. */}
      <div className="print:hidden">
        <UnlockSuccessToast yearId={yearId} subjectId={subjectId} subjectTitle={subject.title} />
      </div>
      {/* This page already serves free (non-activity) content to anonymous
          visitors — the nudge here is purely a soft prompt to create an
          account, not a new gate. It never blocks reading. */}
      <div className="print:hidden">
        <SignedOutOnly>
          <SignupNudgeToast
            signupHref={`/signup?next=${encodeURIComponent(
              `/year/${yearId}/subjects/${subjectId}/modules/${moduleId}`
            )}`}
          />
        </SignedOutOnly>
      </div>
      <LastModuleTracker
        moduleId={moduleId}
        subjectId={subjectId}
        yearId={yearId}
        moduleTitle={mod.title}
        subjectTitle={subject.title}
      />

      {/* Top nav — dark navy */}
      <div className="bg-navy px-6 py-8 md:px-16 border-b border-paper/10 print:hidden">
        <div className="max-w-wide mx-auto">
          <Breadcrumbs
            items={[
              { label: "Year", href: "/year" },
              { label: year?.label ?? "Year", href: `/year/${yearId}/subjects` },
              { label: subject.title, href: `/year/${yearId}/subjects/${subjectId}/modules` },
              { label: mod.title },
            ]}
            className="mb-4"
          />
          <BackLink
            href={`/year/${yearId}/subjects/${subjectId}/modules`}
            label={subject.title}
            className="text-taupe hover:text-paper"
          />
        </div>
      </div>

      {/* Module header — dark navy */}
      <header className="bg-navy px-6 pt-10 pb-12 md:px-16 border-b border-paper/10">
        <div className="max-w-wide mx-auto">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            {sectionLabel(year?.sort_order)} — {subject.title}
          </p>
          <h1 className="font-serif text-display-md text-paper">{mod.title}</h1>
          {/* "You already paid", up top, no click needed — or the
              post-payment progress while the webhook lands. Client-side:
              this HTML is shared by every visitor. */}
          <PaidStatusBar
            yearId={yearId}
            subjectId={subjectId}
            subjectTitle={subject.title}
            yearLabel={year?.label}
            tone="dark"
            className="mt-6 w-fit max-w-full print:hidden"
          />
          <div className="mt-6">
            <PrintButton
              yearId={yearId}
              subjectId={subjectId}
              moduleId={moduleId}
              subjectTitle={subject.title}
            />
          </div>
        </div>
      </header>

      {/* Article content — cream */}
      <article id="lesson-body" className="px-6 py-12 md:px-16">
        <div className="max-w-wide mx-auto space-y-16">
        {/* Length and topic map up front, for readers who land here from a
            group-chat link and would otherwise have to scroll to find out. */}
        <LessonOverview sections={allSections} />
        {/* Surface the offer at the top when this module has gated activities
            and the user hasn't unlocked them. A module whose reviewers are all
            free sample (the subject's first) gets no teaser — the offer starts
            from the next module, after the reader has had the full loop.
            ModuleSections drops it once a subscriber unlocks client-side. */}
        <ModuleSections
          yearId={yearId}
          subjectId={subjectId}
          moduleId={moduleId}
          subjectTitle={subject.title}
          sections={allSections}
          unlockAll={unlockActivities}
          freeSectionIds={freeSectionIds}
          reviewerCount={reviewerCount}
          teaser={
            !unlockActivities && (activityMeta?.length ?? 0) > freeSections.length ? (
              <PaywallTeaser
                yearId={yearId}
                subjectId={subjectId}
                subjectTitle={subject.title}
                reviewerCount={reviewerCount || undefined}
                fromPrice={cheapestSubjectPrice()}
              />
            ) : null
          }
        />
        </div>
      </article>

      {/* Next-module CTA */}
      <div className="border-t border-ink-faint/20 px-6 py-12 md:px-16 print:hidden">
        <div className="max-w-wide mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10">
          <p className="font-sans text-sm text-ink-muted">
            Done with this module? Track it — your progress shows on the subject list.
          </p>
          <ModuleDoneToggle
            moduleId={moduleId}
            share={{
              subjectId,
              subjectTitle: subject.title,
              moduleTitle: mod.title,
              moduleIds: siblings.map((m) => m.id),
            }}
          />
        </div>
        <ModuleSurveyCard />
        {nextModule ? (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              Up next
            </p>
            <Link
              href={`/year/${yearId}/subjects/${subjectId}/modules/${nextModule.id}`}
              prefetch={true}
              className="group flex items-center justify-between gap-6 bg-navy px-8 py-6 hover:bg-ink transition-colors duration-150"
            >
              <span className="font-serif text-display-md text-paper">
                {nextModule.title}
              </span>
              <span className="text-accent text-xl flex-shrink-0">→</span>
            </Link>
            {prevModule && (
              <Link
                href={`/year/${yearId}/subjects/${subjectId}/modules/${prevModule.id}`}
                prefetch={true}
                className="group inline-flex items-center gap-3 mt-6 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
                <span>Previous: {prevModule.title}</span>
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              You&apos;ve finished this subject
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/year/${yearId}/subjects/${subjectId}/modules`}
                prefetch={true}
                className="inline-flex items-center gap-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <span className="text-accent">←</span>
                <span>Back to {subject.title}</span>
              </Link>
              {prevModule && (
                <Link
                  href={`/year/${yearId}/subjects/${subjectId}/modules/${prevModule.id}`}
                  prefetch={true}
                  className="inline-flex items-center gap-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
                >
                  <span className="text-accent">←</span>
                  <span>Previous: {prevModule.title}</span>
                </Link>
              )}
            </div>
          </>
        )}
        </div>
      </div>
      </PrintGateRoot>
      </main>
    </ModuleReaderClient>
  );
}
