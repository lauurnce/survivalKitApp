"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon } from "./ProIcons";

/** How long the post-payment confirmation stays on screen. */
const DISMISS_MS = 6000;

function Toast() {
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();

  // Read the marker once on mount and run a purely local timer — the
  // subscription hook's poll/refresh cycle is none of this toast's business.
  // reloadWithoutPaymentMarker() scrubs ?payment=success via a full page load,
  // so a fresh mount sees no marker and the toast cannot resurrect.
  useEffect(() => {
    if (searchParams.get("payment") !== "success") return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 border border-amber-300/60 bg-paper px-4 py-3 shadow-lg dark:border-amber-300/25"
    >
      <CheckIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="font-sans text-sm text-ink">
        Payment successful — module unlocked!
      </p>
    </div>
  );
}

// useSearchParams() must sit under a Suspense boundary per Next.js 15; the
// wrapper lets server pages mount <UnlockSuccessToast /> directly.
export function UnlockSuccessToast() {
  return (
    <Suspense fallback={null}>
      <Toast />
    </Suspense>
  );
}
