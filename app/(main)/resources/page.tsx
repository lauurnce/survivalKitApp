import type { Metadata } from "next";
import Link from "next/link";
import { SessionLogoutButton, SessionNavRail, SignedInOnly } from "@/components/dashboard/SessionShell";
import { ResourcesTour } from "@/components/tour/ResourcesTour";

// Fully static and CDN-cached. Session-aware bits (nav rail progress, log out,
// the tour) resolve client-side; anonymous visitors are never redirected away.

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

export default function ResourcesPage() {
  // Same dashboard shell as Profile/Dashboard. Anonymous visitors still see
  // the page — the rail renders with zeroed progress until they sign in.
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <SignedInOnly>
        <ResourcesTour signedIn />
      </SignedInOnly>
      <SessionNavRail />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          <SessionLogoutButton />
        </div>

        <main className="mx-auto max-w-wide px-4 sm:px-8 py-6 space-y-10">
          <header className="space-y-2">
            <p className="label-sm">Study tools</p>
            <h1 className="font-serif text-display-md text-ink">Resources</h1>
            <p className="text-ink-muted">Run code and find any lesson in the kit.</p>
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
        </main>
      </div>
    </div>
  );
}
