"use client";

import { LockOpenIcon } from "./ProIcons";
import { planForSubject, useYearEntitlements } from "@/hooks/useSubscriptionStatus";
import { formatAccessDate } from "@/lib/paidStatus";

// "Unlocked" on a subject row the reader already paid for (subject plan, year
// pass, or class). The subject list is prerendered, so this resolves after
// hydration from one /api/subscription-status?list=subjects request shared by
// every row; it renders nothing until then, and nothing for locked subjects.
export function SubjectUnlockedTag({ yearId, subjectId }: { yearId: string; subjectId: string }) {
  const ents = useYearEntitlements(yearId);
  const plan = planForSubject(ents, subjectId);
  if (!plan) return null;
  const date = plan.until ? formatAccessDate(plan.until) : null;
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-label-sm uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400"
      title={date ? `Access until ${date}` : undefined}
      data-subject-unlocked
    >
      <LockOpenIcon className="h-3 w-3 shrink-0" />
      Unlocked
    </span>
  );
}
