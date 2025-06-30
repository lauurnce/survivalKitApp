"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useSubscriptionStatus, type SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

/**
 * Who may print this lesson.
 * - "loading": not known yet; never print, never show a prompt.
 * - "signed-out": sign up / log in first.
 * - "unpaid": signed in, not entitled to this subject.
 * - "entitled": a subject plan for this subject, or a year plan for its year.
 */
export type PrintAccess = "loading" | "signed-out" | "unpaid" | "entitled";

type StatusView = Pick<SubscriptionStatus, "subscribed" | "polling" | "pollTimedOut">;

export function printAccessFrom(
  session: { ready: boolean; signedIn: boolean },
  status: StatusView | null,
  paymentReturn: boolean,
): PrintAccess {
  if (!session.ready) return "loading";
  if (!session.signedIn) return "signed-out";
  if (!status || status.subscribed === null) return "loading";
  if (status.subscribed) return "entitled";
  // Back from checkout (?payment=success): the webhook may still be in flight
  // and the shared store polls for it. "Not entitled" is only an answer once
  // that poll has given up.
  if (status.polling || (paymentReturn && !status.pollTimedOut)) return "loading";
  return "unpaid";
}

// Mounted only while a signed-in reader's entitlement is undecided or locked.
// It unmounts once entitlement is confirmed: useSubscriptionStatus reads "every
// listener gone" as "the unlock landed" after a payment, and a listener held
// for the life of the page would make it fall back to a full reload.
function SubscriptionProbe({
  yearId,
  subjectId,
  onStatus,
}: {
  yearId: string;
  subjectId: string;
  onStatus: (status: StatusView) => void;
}) {
  const { subscribed, polling, pollTimedOut } = useSubscriptionStatus(yearId, subjectId);
  useEffect(() => {
    onStatus({ subscribed, polling, pollTimedOut });
  }, [subscribed, polling, pollTimedOut, onStatus]);
  return null;
}

function isPaymentReturn(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment") === "success";
}

/**
 * The reader's print access for one subject, plus the element that keeps it
 * current — render `probe` somewhere in the caller's tree.
 *
 * The reader page is prerendered once for every visitor, so none of this is
 * known on the server. A signed-out reader is never asked about, which also
 * spares /api/subscription-status a request per anonymous page view; paying
 * requires an account (app/api/subscribe), so a signed-out reader has nothing
 * to be entitled to.
 */
export function usePrintAccess(yearId: string, subjectId: string): { access: PrintAccess; probe: React.ReactNode } {
  const session = useSession();
  const [status, setStatus] = useState<StatusView | null>(null);
  const [paymentReturn] = useState(isPaymentReturn);
  const access = printAccessFrom(session, status, paymentReturn);
  const probe =
    session.ready && session.signedIn && access !== "entitled" ? (
      <SubscriptionProbe yearId={yearId} subjectId={subjectId} onStatus={setStatus} />
    ) : null;
  return { access, probe };
}
