"use client";

import { useEffect, useState } from "react";
import { lessonFraction } from "@/lib/lesson/progress";

/** DOM id of the reader's <article>, the body progress is measured against. */
export const LESSON_BODY_ID = "lesson-body";

/**
 * The reader's 0–1 progress through the element with `targetId`, updated at
 * most once per animation frame while scrolling or resizing. Re-measures the
 * element every time, because the body grows when a subscriber's reviewers
 * load in after hydration.
 */
export function useLessonProgress(targetId: string = LESSON_BODY_ID): number {
  const [fraction, setFraction] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setFraction(
        lessonFraction({
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
          top: rect.top + window.scrollY,
          height: rect.height,
        })
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetId]);

  return fraction;
}

/** Whether the element with `targetId` is on screen (false if unsupported). */
export function useInView(targetId: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetId]);

  return inView;
}
