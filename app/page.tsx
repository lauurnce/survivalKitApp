import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col justify-between px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />

      {/* Header label */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs,
          organized by year and subject. Start wherever you need to.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
    </main>
  );
}
