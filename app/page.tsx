import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col justify-between px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />

      {/* Header label */}
      <div>
        <span className="label">BSIT Survival Kit</span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="label mb-6">§ 00 — Welcome</p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs —
          organized by year and subject. Pick up where you left off.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 border border-ink text-ink font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink hover:text-paper transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="label-sm">For BSIT students</span>
        <span className="label-sm text-accent">Free to read</span>
      </div>
    </main>
  );
}
