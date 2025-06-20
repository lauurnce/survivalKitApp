"use client";

import { Fragment, useEffect, useState } from "react";
import { SectionRenderer } from "@/components/SectionRenderer";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useShowUpsell } from "@/hooks/useShowUpsell";
import type { TopologyData } from "@/lib/topology/types";

export interface ReaderSection {
  id: string;
  kind: string;
  heading: string;
  body_md: string;
  sort_order: number;
  ide_language?: "python" | "sql" | "java" | "c" | null;
  starter_code?: string | null;
  topology_data?: TopologyData | null;
}

interface Props {
  yearId: string;
  subjectId: string;
  moduleId: string;
  subjectTitle: string;
  /**
   * The locked view, as prerendered for everyone: content sections, activity
   * headings with empty bodies, and the free sample in full.
   */
  sections: ReaderSection[];
  /** True only when UNLOCK_ALL is set for the whole (non-production) build. */
  unlockAll: boolean;
  freeSectionIds: string[];
  reviewerCount: number;
  /** The paywall teaser, shown above the sections while the reader is locked. */
  teaser?: React.ReactNode;
  /**
   * Shown between the lesson's notes and its reviewers (before the first
   * activity, or at the end when there is none) — the lesson's quick check.
   */
  afterContent?: React.ReactNode;
}

// Renders the module's sections and, for a subscriber, swaps the gated
// activity bodies in after hydration.
//
// The reader page is prerendered and CDN-cached, so its HTML can't depend on
// who is reading: paid bodies are never in it. Once the shared subscription
// status (one /api/subscription-status request per page, also driving the
// teaser and locked strips) says this reader is subscribed — on load, or when
// the post-payment poll confirms — the full bodies come from
// /api/subscription-status?moduleId=…, which re-checks the entitlement
// server-side.
export function ModuleSections({
  yearId,
  subjectId,
  moduleId,
  subjectTitle,
  sections,
  unlockAll,
  freeSectionIds,
  reviewerCount,
  teaser,
  afterContent,
}: Props) {
  const [unlocked, setUnlocked] = useState<ReaderSection[] | null>(null);
  // Every reader page watches the status — including a subject's first
  // module, whose reviewers are all free sample and so has nothing to fetch:
  // a subscriber there must still lose the "That was the free sample" card.
  const showUpsell = useShowUpsell(yearId, subjectId) && !unlockAll;

  const hasLockedActivities =
    !unlockAll && sections.some((s) => s.kind === "activity" && !freeSectionIds.includes(s.id));
  const isUnlocked = unlockAll || unlocked !== null;

  const shown = unlocked
    ? [
        ...sections.filter((s) => s.kind !== "activity"),
        ...unlocked,
      ].sort((a, b) => a.sort_order - b.sort_order)
    : sections;

  const firstActivity = shown.findIndex((s) => s.kind === "activity");
  const slotAt = firstActivity === -1 ? shown.length : firstActivity;

  return (
    <>
      {/* Watching the status keeps a listener on the shared store, so it
          unmounts as soon as the bodies are in — that, plus the teaser and
          locked strips disappearing, tells the store the unlock landed and
          stops its refresh/reload fallback. */}
      {hasLockedActivities && !isUnlocked && (
        <UnlockWatcher
          yearId={yearId}
          subjectId={subjectId}
          moduleId={moduleId}
          onUnlocked={setUnlocked}
        />
      )}
      {!isUnlocked && teaser && <div className="print:hidden">{teaser}</div>}
      {shown.map((section, i) => (
        <Fragment key={section.id}>
          {i === slotAt && afterContent}
          <SectionRenderer
            section={section}
            index={i}
            moduleId={moduleId}
            yearId={yearId}
            subjectId={subjectId}
            unlockAll={isUnlocked}
            subjectTitle={subjectTitle}
            freeSectionIds={freeSectionIds}
            reviewerCount={reviewerCount}
            showUpsell={showUpsell}
          />
        </Fragment>
      ))}
      {slotAt === shown.length && afterContent}
    </>
  );
}

/** Delay before the one retry of a failed paid-bodies request. */
export const BODIES_RETRY_MS = 2000;

export async function fetchUnlockedActivities(
  yearId: string,
  subjectId: string,
  moduleId: string,
): Promise<ReaderSection[] | null> {
  try {
    const params = new URLSearchParams({ yearId, subjectId, moduleId });
    const res = await fetch(`/api/subscription-status?${params.toString()}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { subscribed?: boolean; sections?: ReaderSection[] };
    return data.subscribed === true && Array.isArray(data.sections) ? data.sections : null;
  } catch {
    return null;
  }
}

function UnlockWatcher({
  yearId,
  subjectId,
  moduleId,
  onUnlocked,
}: {
  yearId: string;
  subjectId: string;
  moduleId: string;
  onUnlocked: (sections: ReaderSection[]) => void;
}) {
  const { subscribed } = useSubscriptionStatus(yearId, subjectId);

  useEffect(() => {
    if (subscribed !== true) return;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | null = null;
    // The status said yes, so the bodies request runs the same check; one
    // retry covers a dropped request or a replica that has not caught up with
    // a payment that landed seconds ago.
    const load = (attempt: number) => {
      void fetchUnlockedActivities(yearId, subjectId, moduleId).then((full) => {
        if (cancelled) return;
        if (full) onUnlocked(full);
        else if (attempt === 0) retry = setTimeout(() => load(1), BODIES_RETRY_MS);
      });
    };
    load(0);
    return () => {
      cancelled = true;
      if (retry !== null) clearTimeout(retry);
    };
  }, [subscribed, yearId, subjectId, moduleId, onUnlocked]);

  // While this reader might still be a subscriber whose bodies are on their
  // way, say so for the return-and-print flow (lib/printReady.ts). Gone once
  // the status says "not subscribed" or the bodies land (this unmounts).
  return subscribed === false ? null : <span hidden data-reader-unlock="pending" />;
}
