"use client";

import { LockOpenIcon } from "./ProIcons";
import { retrySubscriptionCheck, useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { PAYMENT_CONFIRMING_COPY, PAYMENT_PENDING_COPY, paidStatusLine } from "@/lib/paidStatus";

interface Props {
  yearId: string;
  subjectId: string;
  subjectTitle: string;
  /** e.g. "1st Year" — names a year pass. */
  yearLabel?: string;
  /**
   * "dark" sits in the navy page header (module reader), "light" on the cream
   * body (modules list).
   */
  tone?: "dark" | "light";
  className?: string;
}

const TONES = {
  dark: {
    box: "border-amber-300/40 bg-paper/[0.04] text-paper",
    icon: "text-amber-300",
    button: "border-paper/30 text-paper hover:bg-paper/10",
  },
  light: {
    box: "border-amber-300/60 bg-amber-50 text-ink dark:border-amber-300/25 dark:bg-amber-400/10",
    icon: "text-amber-700 dark:text-amber-400",
    button: "border-ink-faint/40 text-ink hover:bg-ink/[0.04]",
  },
} as const;

// The reader's "you already paid" status, so nobody has to click Unlock to
// find out. Renders nothing until the status is known, and nothing for a
// reader without access — the locked view stays as it was.
//
//   paid:      Unlocked · Computer Programming 1 · access until Dec 1, 2026
//   year pass: 1st Year pass · until Jan 31, 2027
//   returning: Payment received — unlocking…
//   slow hook: Payment received — your access is being confirmed, … [Check again]
export function PaidStatusBar({
  yearId,
  subjectId,
  subjectTitle,
  yearLabel,
  tone = "light",
  className = "",
}: Props) {
  const { subscribed, polling, pollTimedOut, plan } = useSubscriptionStatus(yearId, subjectId);
  const t = TONES[tone];
  const box = `flex flex-wrap items-center gap-x-3 gap-y-2 border px-4 py-2.5 ${t.box} ${className}`;

  if (subscribed === true) {
    const line = plan
      ? paidStatusLine(plan, { subjectTitle, yearLabel })
      : `Unlocked · ${subjectTitle}`;
    return (
      <div className={box} data-paid-status="paid">
        <LockOpenIcon className={`h-4 w-4 shrink-0 ${t.icon}`} />
        <p className="font-sans text-sm">{line}</p>
      </div>
    );
  }

  if (polling) {
    return (
      <div className={box} role="status" aria-live="polite" data-paid-status="pending">
        <span className={`h-2 w-2 shrink-0 rounded-full bg-current animate-pulse ${t.icon}`} aria-hidden="true" />
        <p className="font-sans text-sm">{PAYMENT_PENDING_COPY}</p>
      </div>
    );
  }

  if (pollTimedOut) {
    return (
      <div className={box} role="status" aria-live="polite" data-paid-status="confirming">
        <p className="font-sans text-sm flex-1 min-w-48">{PAYMENT_CONFIRMING_COPY}</p>
        <button
          type="button"
          onClick={() => retrySubscriptionCheck(yearId, subjectId)}
          className={`border px-3 py-1.5 font-sans text-sm transition-colors duration-150 ${t.button}`}
        >
          Check again
        </button>
      </div>
    );
  }

  return null;
}
