import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { getAccountOverview } from "@/lib/account";
import { getProfile } from "@/lib/profileStore";
import { signOutAction } from "../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { PaymentSuccessBanner } from "@/components/PaymentSuccessBanner";
import { NavRail } from "@/components/dashboard/NavRail";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { ThisWeekPanel } from "@/components/dashboard/ThisWeekPanel";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { SemesterSections } from "@/components/dashboard/SemesterSections";
import { DiscountCodesSectionWrapper } from "@/components/DiscountCodesSectionWrapper";
import { groupByTerm, deriveCurrentTerm, pickRecommended, roadmapNodes, continueHref } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const [overview, profile] = await Promise.all([
    getAccountOverview(userId),
    getProfile(userId),
  ]);

  // Same identity model as the module pages: device cookie or signed-in user,
  // checked once for the whole page. The dashboard spans every year and
  // subject, so "Pro" here means at least one active grant: the user leg is
  // what getAccountOverview already computed per subject (active, unexpired
  // subscriptions via isUnlockedBy); the device leg covers purchases made
  // before this viewer signed in, which are stored against the device cookie.
  const devUnlockAll = process.env.UNLOCK_ALL === "true";
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
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
  const nodes = roadmapNodes(terms, current);
  const currentKey = current ? `${current.yearId}-${current.semester}` : null;
  // Feedback is module-scoped (the API requires a module UUID), so the empty
  // discount-codes state links into the reader of the recommended next module;
  // ?feedback=1 force-opens the survey there. Nothing unlocked → browse first.
  const feedbackHref = recs[0] ? `${continueHref(recs[0])}?feedback=1` : "/year";

  return (
    <div className="min-h-screen bg-paper lg:flex">
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

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8 min-w-0">
              <RoadmapTimeline nodes={nodes} />
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
