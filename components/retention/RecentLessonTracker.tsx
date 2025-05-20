"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseLessonPath, recordRecentLesson, titlesFromDocumentTitle } from "@/lib/retention/recentLessons";

// How long to wait for the reader's <title> after a client-side navigation.
const TITLE_WAIT_MS = 5000;

// Remembers every lesson this device opens, for "Pick up where you left off"
// (components/retention/RecentLessons.tsx). Mounted once in the (main)
// layout and keyed off the URL, so the reader page needs no wiring.
//
// Titles come from the reader's own <title> ("Module · Subject — BSIT
// Survival Kit"). On a client-side navigation Next swaps the title in after
// the URL changes, so this waits for a title in that shape; a 404 never has
// one and is never recorded.
export function RecentLessonTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const route = pathname ? parseLessonPath(pathname) : null;
    if (!route) return;

    let done = false;
    const tryRecord = () => {
      if (done) return;
      const titles = titlesFromDocumentTitle(document.title);
      if (!titles || !titles.subjectTitle) return;
      done = true;
      recordRecentLesson({ ...route, ...titles, visitedAt: Date.now() });
    };

    tryRecord();
    if (done) return;

    const observer = new MutationObserver(tryRecord);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const timer = window.setTimeout(() => observer.disconnect(), TITLE_WAIT_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
