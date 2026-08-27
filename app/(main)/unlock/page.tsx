import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/subscriptions";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { BackLink } from "@/components/BackLink";
import { SubscribeGate } from "@/components/SubscribeGate";
import { parseModuleRoute, safeReturnPath } from "@/lib/subscribeRedirect";
import { isUuid } from "@/lib/validation";
import { sectionLabel } from "@/lib/sectionLabel";

interface Props {
  searchParams: Promise<{ year?: string | string[]; subject?: string | string[]; from?: string | string[] }>;
}

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { subject: subjectParam } = await searchParams;
  const subjectId = single(subjectParam);
  if (!isUuid(subjectId)) return { title: "Unlock reviewers" };

  const supabase = createServerClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("title")
    .eq("id", subjectId)
    .single();

  return {
    title: subject ? `Unlock ${subject.title}` : "Unlock reviewers",
    description:
      "Unlock every reviewer with answer keys — drills, code labs, and full worked solutions.",
  };
}

// The one place in the app that quotes a price. Locked reviewers and the
// paywall teaser link here instead of repeating the plan table per section.
export default async function UnlockPage({ searchParams }: Props) {
  const { year: yearParam, subject: subjectParam, from: fromParam } = await searchParams;
  const yearId = single(yearParam);
  const subjectId = single(subjectParam);

  if (!isUuid(yearId) || !isUuid(subjectId)) notFound();

  const supabase = createServerClient();
  const [{ data: subject }, { data: modules }] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, title, years(label, sort_order)")
      .eq("id", subjectId)
      .eq("year_id", yearId)
      .maybeSingle(),
    // Titles come along so the return-module lookup below is a local find
    // rather than a second, easily-unscoped query.
    supabase.from("modules").select("id, title").eq("subject_id", subjectId).order("sort_order"),
  ]);

  if (!subject) notFound();

  const subjectModules = (modules ?? []) as { id: string; title: string }[];
  const moduleIds = subjectModules.map((m) => m.id);

  // `from` is attacker-controllable. safeReturnPath only proves the SHAPE and
  // the year/subject segments — the module id is still whatever the crafter
  // typed, so bind it to this subject here, where the database is in reach.
  // Without this, /unlock?year=Y&subject=S&from=…/modules/<module of subject T>
  // both sends the payer into T's module after checkout and renders T's module
  // title in the header. An unknown module falls back to the subject's list.
  const candidatePath = safeReturnPath(single(fromParam), yearId, subjectId);
  const candidateModuleId = parseModuleRoute(candidatePath)?.moduleId ?? null;
  const returnModule = subjectModules.find((m) => m.id === candidateModuleId) ?? null;
  const returnPath = returnModule ? candidatePath : null;
  const backHref = returnPath ?? `/year/${yearId}/subjects/${subjectId}/modules`;

  // Bring a signed-out payer straight back to this unlock page after they sign
  // in, so they land on the plans again instead of restarting from the module
  // list.
  const fromValue = single(fromParam);
  const returnHref = fromValue
    ? `/unlock?year=${yearId}&subject=${subjectId}&from=${encodeURIComponent(fromValue)}`
    : `/unlock?year=${yearId}&subject=${subjectId}`;

  // Nothing below depends on anything above, so pay for one round trip instead
  // of three on the app's highest-intent screen.
  const [cookieStore, userId, { count: reviewerCount }] = await Promise.all([
    cookies(),
    getCurrentUserId(),
    moduleIds.length
      ? supabase
          .from("sections")
          .select("id", { count: "exact", head: true })
          .eq("kind", "activity")
          .in("module_id", moduleIds)
      : Promise.resolve({ count: 0 as number | null }),
  ]);

  // Someone who already paid should never be sold this subject again, whether
  // they arrived from a bookmark, a shared link, or the browser back button.
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const alreadyUnlocked =
    (userId || deviceId)
      ? await isSubscribed(deviceId ?? "", yearId, subjectId, userId ?? undefined)
      : false;

  const year = subject.years as unknown as { label: string; sort_order: number } | null;

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <BackLink
            href={backHref}
            label={returnModule?.title ?? subject.title}
            className="text-taupe hover:text-paper"
          />
          <div className="mt-10">
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
              {sectionLabel(year?.sort_order)} — {subject.title}
            </p>
            <h1 className="font-serif text-display-lg text-paper">
              {alreadyUnlocked ? subject.title : `Unlock ${subject.title}`}
            </h1>
            <p className="font-sans text-base text-taupe mt-4">
              {reviewerCount
                ? `${reviewerCount} reviewers with answer keys`
                : "Reviewers with answer keys"}{" "}
              — drills, code labs, and full worked solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Plans — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          {alreadyUnlocked ? (
            <div className="border border-accent/40 bg-accent/[0.03] p-6">
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">
                Already unlocked
              </p>
              <p className="font-sans text-base text-ink-muted mb-4">
                You already have access to every reviewer in {subject.title}. Nothing
                more to buy.
              </p>
              <Link
                href={backHref}
                className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
              >
                Back to {returnModule?.title ?? subject.title} →
              </Link>
            </div>
          ) : (
            <>
              {/* Signed-out visitors still see the plans. This is the only page
                  that quotes a price, so putting the account wall in front of it
                  asks people to sign up before they know what it costs. The gate
                  routes their tap to sign-in instead of a checkout it cannot
                  complete — /api/subscribe rejects anonymous callers. */}
              {!userId && (
                <div className="border border-ink-faint/30 p-6 mb-6">
                  <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-2">
                    Sign in required
                  </p>
                  <p className="font-sans text-base text-ink-muted mb-4">
                    Create a free account so we can email your receipt and keep this unlock
                    on every device.
                  </p>
                  <Link
                    href={`/login?next=${encodeURIComponent(returnHref)}`}
                    className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
                  >
                    Sign in to unlock →
                  </Link>
                </div>
              )}

              <SubscribeGate
                yearId={yearId}
                subjectId={subjectId}
                yearLabel={year?.label}
                subjectTitle={subject.title}
                returnPath={returnPath}
                signInHref={userId ? undefined : `/login?next=${encodeURIComponent(returnHref)}`}
              />

              <p className="font-sans text-xs text-ink-faint mt-4">
                Paying via GCash/Maya QR? After paying, switch back to this tab — your
                module unlocks automatically.
              </p>

              <p className="font-sans text-xs text-ink-faint mt-2">
                One-time payment via GCash, Maya, or card. No auto-renew — access simply
                ends with the semester. Instant unlock after payment.
              </p>
            </>
          )}

          <div className="mt-10 border-t border-ink-faint/25 pt-6">
            <p className="font-sans text-sm text-ink-faint">
              Buying for your block?{" "}
              <Link
                href="/for-blocks"
                prefetch={true}
                className="text-ink hover:text-accent transition-colors underline underline-offset-2"
              >
                See block pricing →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
