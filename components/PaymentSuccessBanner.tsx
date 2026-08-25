"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon } from "./ProIcons";

/** How long the post-payment strip stays on screen. */
const DISMISS_MS = 8000;

function Banner({ subtext }: { subtext?: string }) {
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();

  // Read the marker once on mount and run a purely local timer. Pages that
  // are fallback landings (no ?payment=success) render nothing at all.
  // searchParams can be null under partial test mocks — absence means hide.
  useEffect(() => {
    if (searchParams?.get("payment") !== "success") return;
    // One-shot marker read on mount: lazy init from useSearchParams during
    // hydration can't be proven safe under Suspense fallback timing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 border border-amber-300/60 bg-amber-50 px-4 py-2.5 dark:border-amber-300/25 dark:bg-amber-400/10"
    >
      <CheckIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="font-sans text-sm text-ink">Payment successful</p>
        {subtext && <p className="font-sans text-xs text-ink-muted">{subtext}</p>}
      </div>
    </div>
  );
}

// useSearchParams() must sit under a Suspense boundary per Next.js 15; the
// wrapper lets server pages mount <PaymentSuccessBanner /> directly.
export function PaymentSuccessBanner({ subtext }: { subtext?: string }) {
  return (
    <Suspense fallback={null}>
      <Banner subtext={subtext} />
    </Suspense>
  );
}
