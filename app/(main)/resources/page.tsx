import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { signOutAction } from "../../(auth)/actions";
import { NavRail } from "@/components/dashboard/NavRail";
import { SubjectQuizList } from "@/components/resources/SubjectQuizList";
import { ResourcesTour } from "@/components/tour/ResourcesTour";

// Session-aware (the review quiz is gated on sign-in) but still public —
// anonymous visitors are never redirected away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources",
};

interface ResourceCard {
  kicker: string;
  title: string;
  description: string;
  href: string;
  tourTarget: string;
}

const CARDS: ResourceCard[] = [
  {
    kicker: "Practice",
    title: "Code playground",
    description: "Run Python, SQL, Java, and C right in your browser.",
    href: "/playground",
    tourTarget: "resources-playground",
  },
  {
    kicker: "Find",
    title: "Search the kit",
    description: "Find any lesson, module, or topic by keyword.",
    href: "/search",
    tourTarget: "resources-search",
  },
];

export default async function ResourcesPage() {
  const userId = await getCurrentUserId();
  // Same dashboard shell as Profile/Dashboard. Anonymous visitors still see
  // the page — the rail renders with zeroed progress until they sign in.
  const overview = userId
    ? await getAccountOverview(userId)
    : { overallDone: 0, overallTotal: 0 };

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <ResourcesTour userId={userId} />
      <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          {userId && (
            <form action={signOutAction}>
              <button className="text-xs text-ink-muted underline">Log out</button>
            </form>
          )}
        </div>

        <main className="mx-auto max-w-wide px-4 sm:px-8 py-6 space-y-10">
          <header className="space-y-2">
            <p className="label-sm">Study tools</p>
            <h1 className="font-serif text-display-md text-ink">Resources</h1>
            <p className="text-ink-muted">Run code and quiz yourself on the modules you&apos;ve finished.</p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            {CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                prefetch={true}
                data-tour={card.tourTarget}
                className="rounded-xl border border-taupe/30 p-6 hover:border-accent/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <p className="label-sm">{card.kicker}</p>
                <h2 className="font-serif text-lg text-ink mt-1">{card.title}</h2>
                <p className="text-sm text-ink-muted mt-2">{card.description}</p>
              </Link>
            ))}
          </div>

          <section className="space-y-3" data-tour="resources-quiz">
            <div>
              <p className="label-sm">Review</p>
              <h2 className="font-serif text-lg text-ink">Quiz yourself on finished subjects</h2>
            </div>
            {userId ? (
              <SubjectQuizList />
            ) : (
              <div className="rounded-xl border border-taupe/30 p-6 space-y-3">
                <p className="text-sm text-ink-muted">
                  Sign in to quiz yourself on the subjects you&apos;ve completed modules in.
                </p>
                <Link
                  href="/login?next=/resources"
                  prefetch={true}
                  className="inline-block text-sm text-accent underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Sign in &rarr;
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
