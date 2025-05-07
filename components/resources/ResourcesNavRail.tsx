"use client";

import { useEffect, useRef } from "react";
import { SessionNavRail } from "@/components/dashboard/SessionShell";

// Below lg the rail is a horizontal tab strip at the very top of the page,
// where the fixed TopBar (theme toggle + Log in / account) sits over its right
// end. The right padding keeps the strip's scroll area clear of the TopBar,
// and the active tab is scrolled into view so the page shows where you are
// (QA DS-09). From lg up the wrapper drops out of layout (`lg:contents`) and
// the rail is the usual sticky sidebar.
export function ResourcesNavRail() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const active = ref.current?.querySelector<HTMLElement>('[aria-current="page"]');
    // `nearest` vertically so the page itself never jumps.
    active?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  return (
    <div ref={ref} data-testid="resources-rail" className="pr-40 border-b border-taupe/30 [&>nav]:border-b-0 lg:contents">
      <SessionNavRail />
    </div>
  );
}
