"use client";

import { useEffect, useState } from "react";
import { SectionRenderer } from "@/components/SectionRenderer";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
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
}: Props) {
  const [unlocked, setUnlocked] = useState<ReaderSection[] | null>(null);

  const hasLockedActivities =
    !unlockAll && sections.some((s) => s.kind === "activity" && !freeSectionIds.includes(s.id));
  const isUnlocked = unlockAll || unlocked !== null;

  const shown = unlocked
    ? [
        ...sections.filter((s) => s.kind !== "activity"),
        ...unlocked,
      ].sort((a, b) => a.sort_order - b.sort_order)
    : sections;

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
        <SectionRenderer
          key={section.id}
          section={section}
          index={i}
          moduleId={moduleId}
          yearId={yearId}
          subjectId={subjectId}
          unlockAll={isUnlocked}
          subjectTitle={subjectTitle}
          freeSectionIds={freeSectionIds}
          reviewerCount={reviewerCount}
        />
      ))}
    </>
  );
}

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
    void fetchUnlockedActivities(yearId, subjectId, moduleId).then((full) => {
      if (!cancelled && full) onUnlocked(full);
    });
    return () => {
      cancelled = true;
    };
  }, [subscribed, yearId, subjectId, moduleId, onUnlocked]);

  return null;
}
