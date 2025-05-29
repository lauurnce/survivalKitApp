"use client";

import { useEffect, useRef, useState } from "react";
import { logEvent } from "@/lib/analytics";
import { minutesLeft, newMilestones, type Milestone } from "@/lib/lesson/progress";
import { LESSON_BODY_ID, useInView, useLessonProgress } from "@/hooks/useLessonProgress";
import { NextLessonLink, type NextLessonTarget } from "./NextLessonLink";

/** DOM id of the page's own end-of-lesson "Up next" block. */
export const LESSON_END_ID = "lesson-next";

/** The sticky next-lesson bar appears from here on. */
export const NEXT_BAR_FROM = 0.6;

interface Props {
  moduleId: string;
  subjectId: string;
  yearId: string;
  /** Whole-lesson reading estimate, for "N min left". */
  totalMinutes: number;
  next: NextLessonTarget | null;
}

// Client chrome around a lesson: a reading-progress line at the top, a
// sticky "Next lesson" bar once the reader is most of the way through, and
// the lesson_halfway / lesson_end events that finally say how far readers
// get (section_view fires on mount, so it never could).
//
// The next bar hides while the page's own "Up next" block is on screen — that
// is also where Mark done and its snackbar live (bottom-6), so the two never
// stack. It sits at bottom-0, below the sign-up toast's bottom-24.
export function LessonEngagement({ moduleId, subjectId, yearId, totalMinutes, next }: Props) {
  const fraction = useLessonProgress(LESSON_BODY_ID);
  const endInView = useInView(LESSON_END_ID);
  const reached = useRef(new Set<Milestone>());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    for (const m of newMilestones(fraction, reached.current)) {
      reached.current.add(m);
      void logEvent(m === "halfway" ? "lesson_halfway" : "lesson_end", {
        module_id: moduleId,
        subject_id: subjectId,
        year_id: yearId,
      });
    }
  }, [fraction, moduleId, subjectId, yearId]);

  const showNext = next !== null && !dismissed && fraction >= NEXT_BAR_FROM && !endInView;
  const left = minutesLeft(totalMinutes, fraction);
  const pct = Math.round(fraction * 100);

  return (
    <div className="print:hidden">
      <div
        role="progressbar"
        aria-label="Lesson progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="fixed top-0 inset-x-0 z-50 h-[3px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-accent origin-left transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>

      {showNext && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-ink-faint bg-paper/95 backdrop-blur-sm">
          <div className="max-w-wide mx-auto flex items-center gap-3 px-4 py-2 md:px-6">
            <NextLessonLink
              {...next}
              moduleId={moduleId}
              subjectId={subjectId}
              yearId={yearId}
              className="group flex min-h-11 flex-1 items-center justify-between gap-3 min-w-0"
            >
              <span className="min-w-0">
                <span className="block font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted">
                  {left > 0 ? `${left} min left · Up next` : "Up next"}
                </span>
                <span className="block truncate font-sans text-sm font-semibold text-ink">
                  {next.title}
                </span>
              </span>
              <span aria-hidden className="text-accent text-xl shrink-0 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </NextLessonLink>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Hide next lesson bar"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted hover:text-ink"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
