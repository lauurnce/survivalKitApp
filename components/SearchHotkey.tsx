"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

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
        if (pathname === "/search") return;
        e.preventDefault();
        router.push("/search");
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router, pathname]);

  return null;
}
