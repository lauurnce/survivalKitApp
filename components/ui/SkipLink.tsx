"use client";

import type { MouseEvent } from "react";

// "Skip to content" (QA PF-05). #content wraps everything the route renders,
// and in the (main) group that starts with the fixed TopBar, so following
// the plain hash left the next Tab on the TopBar's controls. With JavaScript
// the link focuses the page's <main> instead; without it, it still jumps to
// #content.
export function SkipLink() {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    const root = document.getElementById("content");
    const target = root?.querySelector<HTMLElement>("main") ?? root;
    if (!target) return;
    e.preventDefault();
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus();
    target.scrollIntoView?.({ block: "start" });
  }

  return (
    <a
      href="#content"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-[calc(1rem+env(safe-area-inset-top))] focus:left-[calc(1rem+env(safe-area-inset-left))] focus:z-[60] focus:bg-inverse focus:text-on-inverse focus:px-4 focus:py-2 font-sans text-sm"
    >
      Skip to content
    </a>
  );
}
