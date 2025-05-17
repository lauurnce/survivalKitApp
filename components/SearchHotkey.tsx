"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** The /search page's input (components/SearchClient.tsx). */
export const SEARCH_INPUT_SELECTOR = "[data-search-input]";

// Global keyboard shortcut: "/" or Cmd/Ctrl+K opens search from any page.
// Ignored while typing in a field so it never eats real input.
export function SearchHotkey() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      const slashPressed = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      const cmdK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);

      if ((slashPressed && !typing) || cmdK) {
        e.preventDefault();
        if (pathname === "/search") {
          // Already here: put the cursor back in the box (QA FL-13). It used
          // to return early, so "/" and Cmd/Ctrl+K did nothing on /search.
          const input = document.querySelector<HTMLInputElement>(SEARCH_INPUT_SELECTOR);
          input?.focus();
          input?.select();
          return;
        }
        router.push("/search");
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router, pathname]);

  return null;
}
