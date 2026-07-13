import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { getProfile } from "@/lib/profileStore";
import { signOutAction } from "../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { NavRail } from "@/components/dashboard/NavRail";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { ThisWeekPanel } from "@/components/dashboard/ThisWeekPanel";
import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { SemesterSections } from "@/components/dashboard/SemesterSections";
import { groupByTerm, deriveCurrentTerm, pickRecommended, roadmapNodes } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface Props {
  searchParams: Promise<{ payment?: string }>;
}

export default async function AccountPage({ searchParams }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const [overview, profile] = await Promise.all([
    getAccountOverview(userId),
    getProfile(userId),
  ]);
  const { payment } = await searchParams;
  const paymentSuccess = payment === "success";

  const terms = groupByTerm(overview.years);
  const current = deriveCurrentTerm(terms);
  const recs = pickRecommended(current, 3);
  const nodes = roadmapNodes(terms, current);
  const currentKey = current ? `${current.yearId}-${current.semester}` : null;

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

        {paymentSuccess && (
          <div className="bg-accent/10 border-b border-accent/30 px-6 py-3 flex items-center gap-3">
            <span className="text-accent text-lg">✓</span>
            <div>
              <p className="font-sans text-sm font-medium text-ink">Payment received — your subject is now unlocked.</p>
              <p className="font-sans text-xs text-ink-muted">It may take a few seconds to appear below. Refresh if needed.</p>
            </div>
          </div>
        )}

        <main className="px-4 sm:px-8 py-6 mx-auto max-w-wide space-y-8">
          <HeroCard term={current} topPick={recs[0]} profile={profile} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-8 min-w-0">
              <RoadmapTimeline nodes={nodes} />
              <SemesterSections terms={terms} currentKey={currentKey} />
            </div>
            <ThisWeekPanel recs={recs} />
          </div>
        </main>
      </div>
    </div>
  );
}
