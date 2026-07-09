"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getDeviceId } from "@/lib/device";
import { logEvent } from "@/lib/analytics";

interface Props {
  yearId: string;
  subjectId: string;
  yearLabel?: string;
  subjectTitle?: string;
  /**
   * Where "Unlock reviewers" sends the user. Use "#subscribe" on the module
   * detail page (scrolls to the SubscribeGate); use the first module's URL with
   * a "#subscribe" hash on the modules-list page.
   */
  ctaHref: string;
  /** Number of gated reviewer sections in this subject, when the page knows it. */
  reviewerCount?: number;
}

// Keep prices in sync with PLANS in lib/paymongo.ts (₱99 subject_sem, ₱299 year_sem).
export function PaywallTeaser({ yearId, subjectId, yearLabel, subjectTitle, ctaHref, reviewerCount }: Props) {
  // null = still checking; true = subscribed (render nothing); false = show teaser
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const viewLogged = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Mint the signed device cookie if needed; the server reads identity from
      // that cookie, not from a client-supplied header.
      getDeviceId();
      try {
        const params = new URLSearchParams({ yearId, subjectId });
        const res = await fetch(`/api/subscription-status?${params.toString()}`);
        const data = res.ok ? ((await res.json()) as { subscribed?: boolean }) : { subscribed: false };
        if (cancelled) return;
        setSubscribed(data.subscribed === true);
      } catch {
        if (!cancelled) setSubscribed(false);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [yearId, subjectId]);

  // Fire a one-time view event once we know the teaser is actually shown.
  useEffect(() => {
    if (subscribed === false && !viewLogged.current) {
      viewLogged.current = true;
      logEvent("paywall_teaser_view", { year_id: yearId, subject_id: subjectId });
    }
  }, [subscribed, yearId, subjectId]);

  // Hide while checking, and permanently for already-subscribed users.
  if (subscribed !== false) return null;

  function handleClick() {
    logEvent("paywall_teaser_click", { year_id: yearId, subject_id: subjectId });
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
        The first one&apos;s free. Unlock the rest for{" "}
        <span className="text-ink font-semibold">₱99 until end of semester</span>,
        or all of {yearLabel ?? "this year"} for{" "}
        <span className="text-ink font-semibold">₱299 until end of semester</span>.
      </p>
      <Link
        href={ctaHref}
        onClick={handleClick}
        className="inline-block bg-accent text-paper font-sans text-sm px-4 py-3 hover:bg-ink transition-colors duration-150"
      >
        Unlock reviewers →
      </Link>
    </div>
  );
}
