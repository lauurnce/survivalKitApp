import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PageTracker event="enter" />

      {/* Header strip — cream */}
      <div className="bg-paper px-6 py-5 md:px-16 border-b border-navy/10">
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero — dark navy */}
      <div className="flex-1 bg-navy px-6 py-20 md:px-16 flex flex-col justify-center">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-paper mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-taupe leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs —
          organized by year and subject. Pick up where you left off.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 border border-paper/30 text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-paper hover:text-navy transition-colors duration-150 w-fit"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Footer strip — cream */}
      <div className="bg-paper px-6 py-5 md:px-16 border-t border-navy/10 flex items-center justify-between">
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
