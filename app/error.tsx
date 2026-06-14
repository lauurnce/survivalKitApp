"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in Vercel logs for debugging.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="label mb-6">Something went wrong</p>
      <h1 className="font-serif text-display-lg text-ink mb-4">
        We hit a snag.
      </h1>
      <p className="font-sans text-ink-muted mb-10 max-w-prose">
        The page couldn&apos;t load right now. This is usually temporary — try
        again in a moment.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
      >
        Try again
        <span className="text-accent">→</span>
      </button>
    </main>
  );
}
