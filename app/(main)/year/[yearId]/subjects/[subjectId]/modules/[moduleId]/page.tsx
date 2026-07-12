import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/subscriptions";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { BackLink } from "@/components/BackLink";
import { SectionRenderer } from "@/components/SectionRenderer";
import { PageTracker } from "@/components/PageTracker";
import { LastModuleTracker } from "@/components/LastModuleTracker";
import { PaywallTeaser } from "@/components/PaywallTeaser";
import { pickFirstActivity } from "@/lib/freeSample";

export const revalidate = 300;

interface Props {
  params: Promise<{ yearId: string; subjectId: string; moduleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId, moduleId } = await params;
  const supabase = createServerClient();
  const [{ data: mod }, { data: subject }] = await Promise.all([
    supabase.from("modules").select("title").eq("id", moduleId).single(),
    supabase.from("subjects").select("title").eq("id", subjectId).single(),
  ]);
  if (!mod) return {};
  return {
    title: subject ? `${mod.title} · ${subject.title}` : mod.title,
    description: `Study notes and reviewers for ${mod.title}${subject ? ` in ${subject.title}` : ""}.`,
  };
}

export default async function ReaderPage({ params }: Props) {
  const { yearId, subjectId, moduleId } = await params;
  const supabase = createServerClient();

  const [{ data: mod }, { data: subject }, { data: siblingModules }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
    supabase
      .from("modules")
      .select("id, title, sort_order")
      .eq("subject_id", subjectId)
      .order("sort_order"),
  ]);

  if (!mod || !subject) notFound();

  const siblings = siblingModules ?? [];
  const currentIndex = siblings.findIndex((m) => m.id === moduleId);
  const nextModule =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;
  const prevModule = currentIndex > 0 ? siblings[currentIndex - 1] : null;

  const { data: contentSections } = await supabase
    .from("sections")
    .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
    .eq("module_id", moduleId)
    .eq("kind", "content")
    .order("sort_order");

  const devUnlockAll = process.env.UNLOCK_ALL === "true";
  const cookieStore = await cookies();
  // Only trust the device ID if its HMAC signature checks out — a forged or
  // copied cookie value verifies to null and grants no access.
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const userId = await getCurrentUserId();
  const subscribed = (userId || deviceId) ? await isSubscribed(deviceId ?? "", yearId, subjectId, userId ?? undefined) : false;
  const unlockActivities = devUnlockAll || subscribed;

  // Locked visitors only ever receive activity headings; the full body, drill
  // markdown, and starter code are fetched solely when this request is unlocked.
  const { data: activityMeta } = await supabase
    .from("sections")
    .select(
      unlockActivities
        ? "id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data"
        : "id, kind, heading, sort_order"
    )
    .eq("module_id", moduleId)
    .eq("kind", "activity")
    .order("sort_order");

  type ReaderSection = {
    id: string;
    kind: string;
    heading: string;
    body_md: string;
    sort_order: number;
    ide_language?: "python" | "sql" | "java" | "c" | null;
    starter_code?: string | null;
    topology_data?: import("@/lib/topology/types").TopologyData | null;
  };

  // Free sample: locked visitors get the subject's FIRST reviewer in full — a
  // taste of the paid content. Everything else stays headings-only, gated
  // server-side exactly as before.
  let freeSectionId: string | null = null;
  let reviewerCount = 0;
  let freeSection: ReaderSection | null = null;
  if (!unlockActivities && siblings.length > 0) {
    const { data: subjectActivities } = await supabase
      .from("sections")
      .select("id, module_id, sort_order")
      .eq("kind", "activity")
      .in("module_id", siblings.map((m) => m.id));
    const rows = subjectActivities ?? [];
    reviewerCount = rows.length;
    freeSectionId = pickFirstActivity(siblings.map((m) => m.id), rows);

    // Fetch the free section's full body only when it lives in THIS module.
    if (
      freeSectionId &&
      ((activityMeta ?? []) as unknown as { id: string }[]).some((s) => s.id === freeSectionId)
    ) {
      const { data: full } = await supabase
        .from("sections")
        .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
        .eq("id", freeSectionId)
        .single();
      freeSection = (full as unknown as ReaderSection) ?? null;
    }
  }

  const allSections: ReaderSection[] = [
    ...((contentSections ?? []) as ReaderSection[]),
    ...((activityMeta ?? []) as Partial<ReaderSection>[]).map((s) => {
      if (freeSection && s.id === freeSection.id) return freeSection;
      return {
        body_md: "",
        ide_language: null,
        starter_code: null,
        topology_data: null,
        ...s,
      } as ReaderSection;
    }),
  ].sort((a, b) => a.sort_order - b.sort_order);

  const year = subject.years as { label: string; sort_order: number } | null;

  return (
    <main className="min-h-screen bg-paper">
      <PageTracker event="module_open" yearId={yearId} subjectId={subjectId} moduleId={moduleId} />
      <LastModuleTracker
        moduleId={moduleId}
        subjectId={subjectId}
        yearId={yearId}
        moduleTitle={mod.title}
        subjectTitle={subject.title}
      />

      {/* Top nav — dark navy */}
      <div className="bg-navy px-6 py-8 md:px-16 border-b border-paper/10">
        <div className="max-w-wide mx-auto">
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
            § 0{year?.sort_order ?? "?"} — {subject.title}
          </p>
          <h1 className="font-serif text-display-md text-paper">{mod.title}</h1>
        </div>
      </header>

      {/* Article content — cream */}
      <article className="px-6 py-12 md:px-16">
        <div className="max-w-wide mx-auto space-y-16">
        {/* Surface the offer at the top when this module has gated activities
            and the user hasn't unlocked them. Scrolls to the gate below. */}
        {!unlockActivities && (activityMeta?.length ?? 0) > 0 && (
          <PaywallTeaser
            yearId={yearId}
            subjectId={subjectId}
            yearLabel={year?.label}
            subjectTitle={subject.title}
            ctaHref="#subscribe"
            reviewerCount={reviewerCount || undefined}
          />
        )}
        {allSections.map((section, i) => (
          <SectionRenderer
            key={section.id}
            section={section}
            index={i}
            moduleId={moduleId}
            yearId={yearId}
            subjectId={subjectId}
            unlockAll={unlockActivities}
            yearLabel={year?.label}
            subjectTitle={subject.title}
            moduleTitle={mod.title}
            freeSectionId={freeSectionId}
            reviewerCount={reviewerCount}
          />
        ))}
        </div>
      </article>

      {/* Next-module CTA */}
      <div className="border-t border-ink-faint/20 px-6 py-12 md:px-16">
        <div className="max-w-wide mx-auto">
        {nextModule ? (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              Up next
            </p>
            <Link
              href={`/year/${yearId}/subjects/${subjectId}/modules/${nextModule.id}`}
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
                className="inline-flex items-center gap-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <span className="text-accent">←</span>
                <span>Back to {subject.title}</span>
              </Link>
              {prevModule && (
                <Link
                  href={`/year/${yearId}/subjects/${subjectId}/modules/${prevModule.id}`}
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
    </main>
  );
}
