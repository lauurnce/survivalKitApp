import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/subscriptions";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { BackLink } from "@/components/BackLink";
import { SectionRenderer } from "@/components/SectionRenderer";
import { PageTracker } from "@/components/PageTracker";
import { LastModuleTracker } from "@/components/LastModuleTracker";

export const revalidate = 300;

interface Props {
  params: Promise<{ yearId: string; subjectId: string; moduleId: string }>;
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

  const { data: contentSections } = await supabase
    .from("sections")
    .select("id, kind, heading, body_md, sort_order, ide_language, starter_code, topology_data")
    .eq("module_id", moduleId)
    .eq("kind", "content")
    .order("sort_order");

  const { data: activityMeta } = await supabase
    .from("sections")
    .select("id, kind, heading, sort_order")
    .eq("module_id", moduleId)
    .eq("kind", "activity")
    .order("sort_order");

  const devUnlockAll = process.env.UNLOCK_ALL === "true";
  const cookieStore = await cookies();
  // Only trust the device ID if its HMAC signature checks out — a forged or
  // copied cookie value verifies to null and grants no access.
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const subscribed = deviceId ? await isSubscribed(deviceId, yearId, subjectId) : false;
  const unlockActivities = devUnlockAll || subscribed;

  const allSections = [
    ...(contentSections ?? []),
    ...(activityMeta ?? []).map((s) => ({ ...s, body_md: "", ide_language: null, starter_code: null })),
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
        <BackLink
          href={`/year/${yearId}/subjects/${subjectId}/modules`}
          label={subject.title}
          className="text-taupe hover:text-paper"
        />
      </div>

      {/* Module header — dark navy */}
      <header className="bg-navy px-6 pt-10 pb-12 md:px-16 border-b border-paper/10 max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
          § 0{year?.sort_order ?? "?"} — {subject.title}
        </p>
        <h1 className="font-serif text-display-md text-paper">{mod.title}</h1>
      </header>

      {/* Article content — cream */}
      <article className="px-6 py-12 md:px-16 max-w-wide space-y-16">
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
          />
        ))}
      </article>

      {/* Next-module CTA */}
      <div className="border-t border-ink-faint/20 px-6 py-12 md:px-16 max-w-wide">
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
          </>
        ) : (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              You&apos;ve finished this subject
            </p>
            <Link
              href={`/year/${yearId}/subjects/${subjectId}/modules`}
              className="inline-flex items-center gap-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
            >
              <span className="text-accent">←</span>
              <span>Back to {subject.title}</span>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
