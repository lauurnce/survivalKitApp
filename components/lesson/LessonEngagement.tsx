"use client";

import { useEffect, useRef, useState } from "react";
import { logEvent } from "@/lib/analytics";
import { END_AT, minutesLeft, newMilestones, scrollYForFraction, type Milestone } from "@/lib/lesson/progress";
import { clearPosition, loadPosition, savePosition, RESUME_MIN, type SavedPosition } from "@/lib/lesson/resume";
import { SECTION_ANCHOR_PREFIX } from "@/lib/lesson/anchors";
import { LESSON_BODY_ID, useInView, useLessonProgress } from "@/hooks/useLessonProgress";
import { NextLessonLink, type NextLessonTarget } from "./NextLessonLink";

/** DOM id of the page's own end-of-lesson "Up next" block. */
export const LESSON_END_ID = "lesson-next";

/** The sticky next-lesson bar appears from here on. */
export const NEXT_BAR_FROM = 0.6;

/** How long the reader must rest before their position is saved. */
const SAVE_DELAY_MS = 800;

/** Heading of the section at the top third of the viewport, if any. */
function headingInView(): string | null {
  const sections = document.querySelectorAll<HTMLElement>(`section[id^="${SECTION_ANCHOR_PREFIX}"]`);
  let current: HTMLElement | null = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight / 3) current = section;
  }
  return current?.querySelector("h2")?.textContent?.trim() || null;
}

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
// It also remembers where the reader stopped. A third of a lesson's readers
// open it more than once, and every return used to start at the top; now a
// return visit that lands at the top offers "Pick up where you left off".
// Positions are only saved once the reader is past RESUME_MIN, so simply
// reopening the page never overwrites the place they had reached.
//
// The next bar hides while the page's own "Up next" block is on screen — that
// is also where Mark done and its snackbar live (bottom-6), so the two never
// stack. It sits at bottom-0, below the sign-up toast's bottom-24.
export function LessonEngagement({ moduleId, subjectId, yearId, totalMinutes, next }: Props) {
  const fraction = useLessonProgress(LESSON_BODY_ID);
  const endInView = useInView(LESSON_END_ID);
  const reached = useRef(new Set<Milestone>());
  const [dismissed, setDismissed] = useState(false);
  const [resume, setResume] = useState<SavedPosition | null>(null);

  // Offer the saved position once, on arrival — unless the link already
  // points somewhere specific (#sec-…).
  useEffect(() => {
    if (window.location.hash) return;
    const saved = loadPosition(moduleId);
    // localStorage only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setResume(saved);
  }, [moduleId]);

  // Remember the position after the reader rests; forget it once finished.
  useEffect(() => {
    if (fraction >= END_AT) {
      clearPosition(moduleId);
      return;
    }
    if (fraction < RESUME_MIN) return;
    const timer = setTimeout(() => savePosition(moduleId, fraction, headingInView()), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [fraction, moduleId]);

  function jumpToSaved() {
    const body = document.getElementById(LESSON_BODY_ID);
    if (!resume || !body) return;
    const rect = body.getBoundingClientRect();
    window.scrollTo({
      top: scrollYForFraction(resume.fraction, {
        viewportHeight: window.innerHeight,
        top: rect.top + window.scrollY,
        height: rect.height,
      }),
      behavior: "smooth",
    });
    void logEvent("lesson_resume", { module_id: moduleId, subject_id: subjectId, year_id: yearId });
    setResume(null);
  }

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

  // The chip is for a reader who landed at the top; scrolling on their own
  // answers the question.
  const showResume = resume !== null && fraction < RESUME_MIN;
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

      {showResume && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4">
          <div className="flex max-w-full items-center gap-1 border border-ink-faint bg-paper shadow-lg">
            <button
              type="button"
              onClick={jumpToSaved}
              className="flex min-h-11 min-w-0 items-center gap-2 px-4 py-2 text-left font-sans text-sm text-ink hover:text-accent"
            >
              <span className="min-w-0">
                <span className="block font-semibold">Pick up where you left off</span>
                {resume.heading && (
                  <span className="block truncate text-ink-muted">{resume.heading}</span>
                )}
              </span>
              <span aria-hidden className="text-accent shrink-0">↓</span>
            </button>
            <button
              type="button"
              onClick={() => setResume(null)}
              aria-label="Start from the top"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted hover:text-ink"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
        </div>
      )}

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
