import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/subscriptions";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageTracker } from "@/components/PageTracker";
import { ModuleListItem } from "@/components/ModuleListItem";
import { SubjectComingSoon } from "@/components/SubjectComingSoon";
import { PaywallTeaser } from "@/components/PaywallTeaser";
import { ProAccessBanner } from "@/components/ProAccessBanner";
import { ShareProgressButton } from "@/components/share/ShareProgressButton";
import { sectionLabel } from "@/lib/sectionLabel";
import { modulePath } from "@/lib/subscribeRedirect";
import { getSubjectWithYear, getModulesBySubject, getModuleCounters, getActivitySectionsForModules } from "@/lib/cache/queries";

export const revalidate = 60;

interface Props {
  params: Promise<{ yearId: string; subjectId: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params;
  const supabase = createServerClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("title, years(label)")
    .eq("id", subjectId)
    .single();
  if (!subject) return {};
  const year = subject.years as unknown as { label: string } | null;
  return {
    title: subject.title,
    description: `Modules and reviewers for ${subject.title}${year ? ` (${year.label})` : ""}.`,
  };
}

export default async function ModulesPage({ params, searchParams }: Props) {
  const { yearId, subjectId } = await params;
  const resolvedSearchParams = await searchParams;

  // Use cached queries for static data
  const subject = await getSubjectWithYear(subjectId);
  if (!subject) notFound();

  const modules = await getModulesBySubject(subjectId);
  const moduleIds = (modules ?? []).map((m) => m.id);
  
  const [moduleCounters, activityRows] = await Promise.all([
    getModuleCounters(moduleIds),
    getActivitySectionsForModules(moduleIds),
  ]);

  if (!subject) notFound();

  // Concrete reviewer count for the teaser ("N reviewers with answer keys…"),
  // plus which modules carry gated activity sections at all — a module with
  // none is free content and must never wear the PRO treatment.
  const reviewerCount = activityRows?.length ?? 0;
  const proModuleIds = new Set((activityRows ?? []).map((row) => row.module_id));

  // Same identity approach as the module detail page: signed device cookie or
  // session user, checked once for the whole page.
  const devUnlockAll = process.env.UNLOCK_ALL === "true";
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const userId = await getCurrentUserId();
  const subscribed =
    devUnlockAll ||
    ((userId || deviceId)
      ? await isSubscribed(deviceId ?? "", yearId, subjectId, userId ?? undefined)
      : false);

  const year = (subject.years as { label: string; sort_order: number }[] | null)?.[0] ?? null;

  function readCount(moduleId: string): number {
    return moduleCounters?.find((c) => c.resource_id === moduleId)?.read_count ?? 0;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <PageTracker event="subject_open" yearId={yearId} subjectId={subjectId} />

      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <Breadcrumbs
            items={[
              { label: "Year", href: "/year" },
              { label: year?.label ?? "Year", href: `/year/${yearId}/subjects` },
              { label: subject.title },
            ]}
            className="mb-6"
          />
          <BackLink
            href={`/year/${yearId}/subjects`}
            label={year?.label ?? "Subjects"}
            className="text-taupe hover:text-paper"
            dashboardFallback={{ href: "/account", label: "Back to Dashboard" }}
            searchParams={{ get: (k) => (k === "from" ? resolvedSearchParams.from : null) }}
          />
          <div className="mt-10">
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
              {sectionLabel(year?.sort_order)} — {subject.title}
            </p>
            <h1 className="font-serif text-display-lg text-paper">Modules</h1>
          </div>
        </div>
      </div>

      {/* Module list — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          {modules && modules.length > 0 && (
            <>
              {subscribed && <ProAccessBanner />}
              <PaywallTeaser
                yearId={yearId}
                subjectId={subjectId}
                subjectTitle={subject.title}
                from={modulePath(yearId, subjectId, modules[0].id)}
                reviewerCount={reviewerCount ?? undefined}
              />
              <div className="mt-6 flex justify-end">
                <ShareProgressButton
                  subjectId={subjectId}
                  subjectTitle={subject.title}
                  moduleIds={moduleIds}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col divide-y divide-ink-faint/30 max-w-wide mx-auto">
          {modules?.map((mod, i) => {
            // PRO treatment only for modules that actually carry gated
            // reviewer content, and only once the reader can open them.
            const isPro = subscribed && proModuleIds.has(mod.id);
            return (
              <ModuleListItem
                key={mod.id}
                href={modulePath(yearId, subjectId, mod.id)}
                index={i}
                moduleId={mod.id}
                title={mod.title}
                readCount={readCount(mod.id)}
                isPro={isPro}
                share={{
                  subjectId,
                  subjectTitle: subject.title,
                  moduleTitle: mod.title,
                  moduleIds,
                }}
              />
            );
          })}

          {(!modules || modules.length === 0) && (
            <SubjectComingSoon
              subjectTitle={subject.title}
              yearLabel={year?.label ?? ""}
            />
          )}
        </div>
      </div>
    </main>
  );
}
