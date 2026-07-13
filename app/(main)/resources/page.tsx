import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { ReviewQuiz } from "@/components/account/ReviewQuiz";

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
}

const CARDS: ResourceCard[] = [
  {
    kicker: "Practice",
    title: "Code playground",
    description: "Run Python, SQL, Java, and C right in your browser.",
    href: "/playground",
  },
  {
    kicker: "Find",
    title: "Search the kit",
    description: "Find any lesson, module, or topic in seconds.",
    href: "/search",
  },
];

export default async function ResourcesPage() {
  const userId = await getCurrentUserId();

  return (
    <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
      <header className="space-y-2">
        <p className="label-sm">Study tools</p>
        <h1 className="font-serif text-display-md text-ink">Resources</h1>
        <p className="text-ink-muted">Practice tools to sharpen what you&apos;ve learned.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-taupe/30 p-6 hover:border-accent/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <p className="label-sm">{card.kicker}</p>
            <h2 className="font-serif text-lg text-ink mt-1">{card.title}</h2>
            <p className="text-sm text-ink-muted mt-2">{card.description}</p>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <p className="label-sm">Review</p>
          <h2 className="font-serif text-lg text-ink">Quiz yourself on finished modules</h2>
        </div>
        {userId ? (
          <ReviewQuiz />
        ) : (
          <div className="rounded-xl border border-taupe/30 p-6 space-y-3">
            <p className="text-sm text-ink-muted">
              Sign in to quiz yourself on the modules you&apos;ve finished.
            </p>
            <Link
              href="/login?next=/resources"
              className="inline-block text-sm text-accent underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Sign in &rarr;
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
