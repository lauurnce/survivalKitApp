"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

// Same queuing gtag.js itself uses: push the arguments array onto
// window.dataLayer rather than calling window.gtag directly. gtag.js loads
// with strategy="afterInteractive" (async), so calling window.gtag on mount
// would race its load — pushing to the queue works whether or not the
// script has finished loading yet, since gtag.js drains the queue itself
// once it arrives.
function pushToDataLayer(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function PageviewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;
    pushToDataLayer("event", "page_view", { page_path, send_to: gaId });
  }, [pathname, searchParams, gaId]);

  return null;
}

interface Props {
  /** GA4 measurement ID, e.g. "G-XXXXXXX". Empty/undefined disables analytics entirely. */
  gaId: string | undefined;
  /** Per-request CSP nonce from proxy.ts, forwarded through app/layout.tsx. */
  nonce?: string;
}

// GA4 wiring. `gtag('config', gaId, { send_page_view: false })` disables
// gtag.js's own automatic pageview so the single PageviewTracker effect
// below is the one source of truth for both the first load and every
// client-side (App Router) route change — otherwise the first pageview
// would be double-counted.
//
// gtag.js is not pinned with Subresource Integrity: Google serves it from a
// CDN that updates without notice and does not publish stable hashes for it
// (the officially documented snippet has never included SRI) — pinning a
// hash here would just break analytics silently on Google's next update.
export function GoogleAnalytics({ gaId, nonce }: Props) {
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker gaId={gaId} />
      </Suspense>
    </>
  );
}
