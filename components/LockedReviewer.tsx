"use client";

import Link from "next/link";
import { logEvent } from "@/lib/analytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { buildUnlockHref } from "@/lib/subscribeRedirect";

interface Props {
  yearId: string;
  subjectId: string;
  /** The module path this strip sits on — where payment returns the reader. */
  from: string;
}

// One line per locked reviewer. Pricing lives on /unlock and nowhere else, so a
// module with three gated reviewers costs three lines instead of three copies
// of the plan table.
export function LockedReviewer({ yearId, subjectId, from }: Props) {
  const { polling, unlocked, pollTimedOut } = useSubscriptionStatus(yearId, subjectId);

  function handleClick() {
    void logEvent("unlock_click", { year_id: yearId, subject_id: subjectId });
  }

  return (
    <div className="border border-ink-faint/30 p-5 flex flex-wrap items-center gap-4">
      <span className="text-base opacity-50 shrink-0" aria-hidden="true">
        🔒
      </span>
      <div className="flex-1 min-w-56">
        <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
          Reviewer — locked
        </p>
        <p className="font-sans text-sm text-ink-muted">
          Drills, code labs, and full solutions.
        </p>
      </div>
      {polling || unlocked ? (
        <p className="font-sans text-sm text-ink-muted">
          Payment received — unlocking access…
        </p>
      ) : pollTimedOut ? (
        <p className="font-sans text-sm text-ink-muted">
          Your payment is still processing. Refresh this page in a moment.
        </p>
      ) : (
        <Link
          href={buildUnlockHref({ yearId, subjectId, from })}
          onClick={handleClick}
          className="bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150 shrink-0"
        >
          Unlock →
        </Link>
      )}
    </div>
  );
}
