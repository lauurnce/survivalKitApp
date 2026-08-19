"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logEvent } from "@/lib/analytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { buildUnlockHref } from "@/lib/subscribeRedirect";

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
}

export function PaywallTeaser({ yearId, subjectId, subjectTitle, from, reviewerCount }: Props) {
  const pathname = usePathname();
  const { subscribed } = useSubscriptionStatus(yearId, subjectId);
  const viewLogged = useRef(false);

  // Fire a one-time view event once we know the teaser is actually shown.
  useEffect(() => {
    if (subscribed === false && !viewLogged.current) {
      viewLogged.current = true;
      void logEvent("paywall_teaser_view", { year_id: yearId, subject_id: subjectId });
    }
  }, [subscribed, yearId, subjectId]);

  // Hide while checking, and permanently for already-subscribed users.
  if (subscribed !== false) return null;

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
          ? `${reviewerCount} reviewers with answer keys in ${subjectTitle ?? "this subject"} — drills, code labs, and full solutions.`
          : `Reviewers with answer keys in ${subjectTitle ?? "this subject"} — drills, code labs, and full solutions.`}{" "}
        <span className="text-ink font-semibold">The first one&apos;s free.</span>
      </p>
      <Link
        href={href}
        onClick={handleClick}
        className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
      >
        Unlock reviewers →
      </Link>
      <p className="font-sans text-sm text-ink-faint mt-3">
        Buying for your block?{" "}
        <Link href="/for-blocks" className="text-ink hover:text-accent transition-colors underline underline-offset-2">
          See block pricing →
        </Link>
      </p>
    </div>
  );
}
