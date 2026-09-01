"use client";

import { useRouter } from "next/navigation";
import { resetAllTours } from "@/lib/tour/useTour";

// Clears every section's tour-completion state and lands back on the
// dashboard, where the Dashboard tour (and, as the reader revisits each nav
// item, every other section's tour) auto-activates again from step one.
export function TourReplay() {
  const router = useRouter();

  function handleReplay() {
    resetAllTours();
    router.push("/account");
  }

  return (
    <section className="rounded-xl border border-taupe/30 bg-paper p-5" data-tour="profile-tour-replay">
      <h2 className="label-sm">Guided tour</h2>
      <p className="mt-2 text-xs text-ink-muted">
        Replay the walkthroughs for every section — dashboard, subjects, roadmap, resources, and this page.
      </p>
      <button
        type="button"
        onClick={handleReplay}
        className="mt-3 rounded-lg border border-taupe/50 px-4 py-1.5 text-xs font-medium text-ink hover:bg-ink/[0.04] transition-colors"
      >
        Replay tour
      </button>
    </section>
  );
}
