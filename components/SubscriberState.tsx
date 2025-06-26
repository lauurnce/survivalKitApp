"use client";

import { ModuleListItem } from "@/components/ModuleListItem";
import { ProAccessBanner } from "@/components/ProAccessBanner";
import { PaidStatusBar } from "@/components/PaidStatusBar";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

// Subscriber-only treatment for the prerendered modules list. The page HTML is
// the same for every visitor, so the paid-status strip and the PRO marking on
// gated modules switch on after hydration, from the shared subscription status
// the PaywallTeaser on the same page already requests.

export function SubscriberProBanner({
  yearId,
  subjectId,
  unlockAll,
  subjectTitle,
  yearLabel,
}: {
  yearId: string;
  subjectId: string;
  unlockAll: boolean;
  subjectTitle: string;
  yearLabel?: string;
}) {
  if (unlockAll) return <ProAccessBanner />;
  return (
    <PaidStatusBar
      yearId={yearId}
      subjectId={subjectId}
      subjectTitle={subjectTitle}
      yearLabel={yearLabel}
      className="mb-8"
    />
  );
}

type ItemProps = Omit<React.ComponentProps<typeof ModuleListItem>, "isPro">;

export function SubscriberModuleList({
  yearId,
  subjectId,
  unlockAll,
  items,
  proModuleIds,
}: {
  yearId: string;
  subjectId: string;
  unlockAll: boolean;
  items: ItemProps[];
  /** Modules that carry gated reviewer content; free modules never wear PRO. */
  proModuleIds: string[];
}) {
  const { subscribed } = useSubscriptionStatus(yearId, subjectId);
  const pro = unlockAll || subscribed === true;
  return (
    <>
      {items.map((item) => (
        <ModuleListItem key={item.moduleId} {...item} isPro={pro && proModuleIds.includes(item.moduleId)} />
      ))}
    </>
  );
}
