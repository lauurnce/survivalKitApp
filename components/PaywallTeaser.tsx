"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logEvent } from "@/lib/analytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useShowUpsell } from "@/hooks/useShowUpsell";
import { buildUnlockHref } from "@/lib/subscribeRedirect";
import { socialProofLine } from "@/lib/socialProof";

interface Props {
  yearId: string;
  subjectId: string;
  subjectTitle?: string;
  /**
   * Module path payment should return the reader to. Defaults to the current
   * path, which is already a module route on the reader page; the modules-list
   * page passes its first module instead, since its own path is not one.
   */
  from?: string;
  /** Number of gated reviewer sections in this subject, when the page knows it. */
  reviewerCount?: number;
  /**
   * Cheapest plan that unlocks this subject, computed server-side from PLANS
   * (lib/pricing.ts). Omitted, the teaser quotes no price rather than guess.
   */
  fromPrice?: { amountLabel: string; term: string };
}

export function PaywallTeaser({ yearId, subjectId, subjectTitle, from, reviewerCount, fromPrice }: Props) {
  const pathname = usePathname();
  const { subscribed } = useSubscriptionStatus(yearId, subjectId);
  // Also false while a payment is being confirmed — the poll runs with
  // subscribed: false, and a reader who just paid must not be re-sold.
  const showUpsell = useShowUpsell(yearId, subjectId);
  const visible = subscribed === false && showUpsell;
  const viewLogged = useRef(false);

  // Fire a one-time view event once we know the teaser is actually shown.
  useEffect(() => {
    if (visible && !viewLogged.current) {
      viewLogged.current = true;
      void logEvent("paywall_teaser_view", { year_id: yearId, subject_id: subjectId });
    }
  }, [visible, yearId, subjectId]);

  // Hide while checking, while a payment is confirming, and permanently for
  // already-subscribed users.
  if (!visible) return null;

  // /unlock is the single pricing entry point — there is deliberately no way
  // for a caller to point this CTA somewhere else.
  const href = buildUnlockHref({ yearId, subjectId, from: from ?? pathname });

  function handleClick() {
    void logEvent("paywall_teaser_click", { year_id: yearId, subject_id: subjectId });
  }

  return (
    <div className="border border-accent/40 bg-accent/[0.03] p-5 mb-10">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">
        Reviewers with Answer Keys
      </p>
      <p className="font-sans text-base text-ink-muted mb-4">
        {reviewerCount
          ? `${reviewerCount} reviewers with answer keys in ${subjectTitle ?? "this subject"} — practice exercises and full worked solutions.`
          : `Reviewers with answer keys in ${subjectTitle ?? "this subject"} — practice exercises and full worked solutions.`}{" "}
        <span className="text-ink font-semibold">The first set is free to try.</span>
      </p>
      {fromPrice && (
        <p className="font-sans text-base text-ink-muted mb-4">
          From <span className="text-ink font-semibold">{fromPrice.amountLabel}</span> — unlocks
          every reviewer in {subjectTitle ?? "this subject"} {fromPrice.term}.
        </p>
      )}
      <p className="font-mono text-label-sm text-ink-faint mb-4">{socialProofLine()}</p>
      <Link
        href={href}
        onClick={handleClick}
        className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
      >
        Unlock reviewers →
      </Link>
    </div>
  );
}
