import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { getAccountOverview, getDashboardData } from "@/lib/account";
import { getProfile } from "@/lib/profileStore";
import { signOutAction } from "../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { PaymentSuccessBanner } from "@/components/PaymentSuccessBanner";
import { NavRail } from "@/components/dashboard/NavRail";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { ThisWeekPanel } from "@/components/dashboard/ThisWeekPanel";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { SemesterSections } from "@/components/dashboard/SemesterSections";
import { DiscountCodesSectionWrapper } from "@/components/DiscountCodesSectionWrapper";
import { PageTracker } from "@/components/PageTracker";
import { groupByTerm, deriveCurrentTerm, pickRecommended, continueHref, formatDurationRemaining } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");

  // Same identity model as the module pages: device cookie or signed-in user,
  // checked once for the whole page. The dashboard spans every year and
  // subject, so "Pro" here means at least one active grant: the user leg is
  // what getAccountOverview already computed per subject (active, unexpired
  // subscriptions via isUnlockedBy); the device leg covers purchases made
  // before this viewer signed in, which are stored against the device cookie.
  // The activity/streak events table is device_id-only (no user_id column),
  // so this same cookie is also how the dashboard finds this viewer's activity.
  const devUnlockAll = process.env.UNLOCK_ALL === "true";
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

  const [overview, profile, dashboardData] = await Promise.all([
    getAccountOverview(userId),
    getProfile(userId),
    getDashboardData(userId, deviceId),
  ]);

  const now = new Date().toISOString();
  const { data: deviceSub } = deviceId
    ? await createServerClient()
        .from("subscriptions")
        .select("id")
        .eq("device_id", deviceId)
        .eq("status", "active")
        .gt("current_period_end", now)
        .limit(1)
        .maybeSingle()
    : { data: null };
  const subscribed =
    devUnlockAll || !!deviceSub || overview.subjects.some((s) => s.unlocked);

  const terms = groupByTerm(overview.years);
  const current = deriveCurrentTerm(terms);
  const recs = pickRecommended(current, 3);
  const currentKey = current ? `${current.yearId}-${current.semester}` : null;
  // Feedback is module-scoped (the API requires a module UUID), so the empty
  // discount-codes state links into the reader of the recommended next module;
  // ?feedback=1 force-opens the survey there. Nothing unlocked → browse first.
  const feedbackHref = recs[0] ? `${continueHref(recs[0])}?feedback=1` : "/year";

  const { roadmap, activity, subscriptions } = dashboardData;

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Every dashboard visit counts toward the activity streak — module
          pages already track "year_select"/"module_open" etc, but landing
          here (e.g. right after login) previously logged nothing at all. */}
      <PageTracker event="enter" />
      <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          <ThemeToggleInline />
          <form action={signOutAction}>
            <button className="text-xs text-ink-muted underline">Log out</button>
          </form>
        </div>

        <main className="px-4 sm:px-8 py-6 mx-auto max-w-[90rem] space-y-8">
          {/* Fallback landing when a paid returnPath was invalid — PayMongo
              redirects here with ?payment=success, read client-side. */}
          <PaymentSuccessBanner subtext="Your purchase is now active on this account." />
          <HeroCard term={current} topPick={recs[0]} profile={profile} pro={subscribed} />

          {/* Simplified Roadmap Section: Activity Graph + Key Highlights */}
          <section aria-labelledby="roadmap-summary-heading" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 id="roadmap-summary-heading" className="label-sm">Academic roadmap</h2>
              <a
                href="/account/roadmap"
                className="text-sm text-accent underline underline-offset-2 hover:text-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                View full roadmap →
              </a>
            </div>

            {/* Compact Activity Graph */}
            <ActivityGraph
              data={activity}
              compact={true}
              showSubscriptionOverlay
              subscriptionItems={subscriptions.map(s => ({
                startedAt: s.startedAt,
                endsAt: s.endsAt,
                progressPct: s.progressPct,
              }))}
            />

            {/* Key Highlights Row */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Current Milestone */}
              <article className="rounded-xl border border-taupe/30 bg-paper p-4">
                <p className="label-sm mb-2">Current focus</p>
                {roadmap.milestones.find(m => m.state === "current") ? (
                  <>
                    <p className="font-serif text-base text-ink">
                      {roadmap.milestones.find(m => m.state === "current")!.label}
                    </p>
                    <p className="text-sm text-ink-muted mt-1">
                      {roadmap.milestones.find(m => m.state === "current")!.completedModules}/{roadmap.milestones.find(m => m.state === "current")!.totalModules} modules
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">No active semester</p>
                )}
              </article>

              {/* Activity Streak */}
              <article className="rounded-xl border border-taupe/30 bg-paper p-4">
                <p className="label-sm mb-2">Activity streak</p>
                <p className="font-serif text-2xl text-accent">{activity.currentStreak}d</p>
                <p className="text-xs text-ink-muted">Longest: {activity.longestStreak}d • {activity.totalActiveDays}/56 days active</p>
              </article>

              {/* Next Unlock / Subscription */}
              <article className="rounded-xl border border-taupe/30 bg-paper p-4">
                <p className="label-sm mb-2">Next milestone</p>
                {subscriptions.length > 0 ? (
                  <>
                    <p className="font-serif text-base text-ink truncate">
                      {subscriptions[0].yearLabel}
                      {subscriptions[0].subjectTitle && ` • ${subscriptions[0].subjectTitle}`}
                    </p>
                    <p className="text-sm text-ink-muted mt-1">
                      {formatDurationRemaining(new Date(), new Date(subscriptions[0].endsAt))} remaining
                    </p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Ends{" "}
                      {new Date(subscriptions[0].endsAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </>
                ) : roadmap.milestones.find(m => m.state === "upcoming") ? (
                  <>
                    <p className="font-serif text-base text-ink truncate">
                      {roadmap.milestones.find(m => m.state === "upcoming")!.label}
                    </p>
                    <p className="text-sm text-ink-muted">Locked — unlock to begin</p>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">All caught up!</p>
                )}
              </article>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8 min-w-0">
              <SemesterSections terms={terms} currentKey={currentKey} />
            </div>
            <ThisWeekPanel recs={recs} />
          </div>

          <section className="border-t border-taupe/20 pt-6">
            <DiscountCodesSectionWrapper feedbackHref={feedbackHref} />
          </section>
        </main>
      </div>
    </div>
  );
}
