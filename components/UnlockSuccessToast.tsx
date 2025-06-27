"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "./ProIcons";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

/** How long the post-payment confirmation stays on screen. */
const DISMISS_MS = 6000;

interface Props {
  yearId: string;
  subjectId: string;
  subjectTitle?: string;
}

// Post-payment confirmation. It waits for the unlock to be confirmed (the
// shared status flips `unlocked` when the poll — or the first check — sees the
// payment), so it never promises access the webhook has not granted yet. The
// store strips ?payment=success at the same moment, so a reload cannot replay
// it; the ref keeps a re-render from showing it twice.
export function UnlockSuccessToast({ yearId, subjectId, subjectTitle }: Props) {
  const { unlocked } = useSubscriptionStatus(yearId, subjectId);
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (!unlocked || shown.current) return;
    shown.current = true;
    // One-shot reaction to the store confirming the payment.
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [unlocked]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-amber-300/60 bg-paper px-4 py-3 shadow-lg dark:border-amber-300/25"
    >
      <CheckIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="font-sans text-sm text-ink">
        Payment successful — {subjectTitle ?? "this subject"} is unlocked.
      </p>
    </div>
  );
}
