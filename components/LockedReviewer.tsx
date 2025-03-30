"use client";

import { ButtonLink } from "@/components/ui/Button";
import { ProBadge } from "./ProBadge";
import { LockIcon } from "./ProIcons";
import { logEvent } from "@/lib/analytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useShowUpsell } from "@/hooks/useShowUpsell";
import { PAYMENT_PENDING_COPY } from "@/lib/paidStatus";
import { buildUnlockHref } from "@/lib/subscribeRedirect";

interface Props {
  yearId: string;
  subjectId: string;
  /** The module path this strip sits on — where payment returns the reader. */
  from: string;
}

// One line per locked reviewer. The plan table lives on /unlock (the teaser at
// the top of the page quotes the "from" price once), so a module with three
// gated reviewers costs three lines instead of three copies of the plan table.
export function LockedReviewer({ yearId, subjectId, from }: Props) {
  return (
    <div className="border border-ink-faint/30 p-5 flex flex-wrap items-center gap-4">
      <LockIcon className="h-4 w-4 text-ink-faint shrink-0" />
      <div className="flex-1 min-w-56">
        <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1 flex items-center gap-2">
          <ProBadge />
          Reviewer — locked
        </p>
        <p className="font-sans text-sm text-ink-muted">
          Part of this subject&apos;s paid reviewers.
        </p>
      </div>
      <LockedCta yearId={yearId} subjectId={subjectId} from={from} />
    </div>
  );
}

export interface LockedGroupItem {
  id: string;
  heading: string;
  /** Position in the module, for the same "05" numbering the sections use. */
  index: number;
  /** In-page anchor id, so LessonOverview's topic links still land. */
  anchorId: string;
}

// A run of consecutive locked reviewers as one card: the count, their titles,
// and a single CTA. An Exam Prep module used to stack eight identical blurred
// blocks, each with its own orange button (QA DS-14).
export function LockedReviewerGroup({
  yearId,
  subjectId,
  from,
  items,
}: Props & { items: LockedGroupItem[] }) {
  return (
    <section className="print-section border border-ink-faint/30 p-5 md:p-6" data-kind="activity" data-locked-group={items.length}>
      <div className="flex flex-wrap items-start gap-4">
        <LockIcon className="mt-0.5 h-4 w-4 text-ink-faint shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted mb-1 flex items-center gap-2">
            <ProBadge />
            {items.length} reviewers locked
          </p>
          <p className="font-sans text-sm text-ink-muted">
            Part of this subject&apos;s paid reviewers.
            <span className="hidden print:inline"> Not included in this printout.</span>
          </p>
        </div>
      </div>
      <ol className="mt-5 space-y-2 border-t border-ink-faint/30 pt-4">
        {items.map((item) => (
          <li key={item.id} id={item.anchorId} className="flex items-baseline gap-4 scroll-mt-20">
            <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted shrink-0">
              {String(item.index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 [overflow-wrap:anywhere] font-serif text-lg text-ink">{item.heading}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 print:hidden">
        <LockedCta yearId={yearId} subjectId={subjectId} from={from} label="Unlock all reviewers →" />
      </div>
    </section>
  );
}

// The one action a locked surface offers, matching the reader's payment state:
// the unlock link, or what is happening to a payment already made.
function LockedCta({ yearId, subjectId, from, label = "Unlock →" }: Props & { label?: string }) {
  const { subscribed, polling, unlocked, pollTimedOut } = useSubscriptionStatus(yearId, subjectId);
  const showUpsell = useShowUpsell(yearId, subjectId);

  function handleClick() {
    void logEvent("unlock_click", { year_id: yearId, subject_id: subjectId });
  }

  if (showUpsell) {
    return (
      <ButtonLink
        href={buildUnlockHref({ yearId, subjectId, from })}
        onClick={handleClick}
        className="shrink-0"
      >
        {label}
      </ButtonLink>
    );
  }
  if (polling || unlocked) return <p className="font-sans text-sm text-ink-muted">{PAYMENT_PENDING_COPY}</p>;
  if (pollTimedOut) return <p className="font-sans text-sm text-ink-muted">Payment received — confirming access…</p>;
  // Access confirmed; the full reviewer replaces this in a moment.
  if (subscribed === true) return <p className="font-sans text-sm text-ink-muted">Unlocked — loading reviewer…</p>;
  return null;
}
