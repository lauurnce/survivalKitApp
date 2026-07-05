"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col justify-between">
      {/* Header */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Content */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-accent mb-6">
          § Server Error
        </p>
        <h1 className="font-serif text-display-lg text-ink mb-6 leading-none">
          Sorry, that didn&apos;t load.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-10">
          Something went wrong on our end, not yours. It&apos;s usually
          temporary, so give it another try and it should be back up shortly.
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
          >
            Try again
            <span className="text-accent">→</span>
          </button>
          <Link
            href="/"
            className="font-sans text-sm uppercase tracking-widest text-ink-muted hover:text-ink transition-colors duration-150"
          >
            Go home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          {error.digest ? `Ref: ${error.digest}` : "Something went wrong"}
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Failed to load
        </span>
      </div>
      </div>
    </main>
  );
}
