"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TourStep } from "@/lib/tour/useTour";

export interface TourOverlayProps {
  /** Same array passed into `useTour` — this component only reads it. */
  steps: TourStep[];
  stepIndex: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const HIGHLIGHT_PADDING = 8;
const CARD_WIDTH = 320; // matches Tailwind's max-w-xs (20rem)
const CARD_GAP = 16;
const VIEWPORT_MARGIN = 16;

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Presentational overlay for `useTour`: dims the page, highlights the
 * current step's target element, and shows a tooltip card with copy,
 * step-dot progress, and Back/Next/Skip controls. Knows nothing about any
 * particular tour's content — every tour built on `useTour` renders through
 * this same component.
 *
 * A step with no `target` (an intro/closing card) renders centered with no
 * highlight. A step whose `target` isn't found in the DOM this visit skips
 * itself by calling `next()` — the caller never has to special-case it.
 */
export function TourOverlay({ steps, stepIndex, totalSteps, next, prev, skip }: TourOverlayProps) {
  const step = steps[stepIndex] ?? null;
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [missing, setMissing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Runs before paint so a step whose target isn't rendered never flashes a
  // centered card before it skips itself.
  useLayoutEffect(() => {
    if (!step?.target) {
      // An unanchored step (welcome/closing card) has no DOM element to
      // measure — this can only be known once the effect runs.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRect(null);
      setMissing(false);
      return;
    }

    const target = step.target;

    function measure() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (!el) {
        setRect(null);
        setMissing(true);
        return;
      }
      setMissing(false);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  // A target absent from the DOM this visit (no popular modules yet, etc.)
  // moves the tour past that step instead of stalling it.
  useEffect(() => {
    if (missing) next();
    // Only the "did this step's target turn out missing" transition should
    // fire this — not every identity change of `next` (it's recreated each
    // time stepIndex advances).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing]);

  useEffect(() => {
    const dialog = cardRef.current;
    if (!dialog) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [skip]);

  // Sends focus into the card on mount and on every step change, so Tab
  // reaches Skip/Back/Next without the reader having to hunt for them.
  useEffect(() => {
    if (missing) return;
    const first = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();
  }, [stepIndex, missing]);

  if (!step || missing) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const cardStyle = cardPosition(rect);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60"
        aria-hidden="true"
        onClick={skip}
      />

      {/* Highlight ring around the target, when there is one */}
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-xl ring-2 ring-accent transition-[top,left,width,height] duration-200"
          style={{
            top: rect.top - HIGHLIGHT_PADDING,
            left: rect.left - HIGHLIGHT_PADDING,
            width: rect.width + HIGHLIGHT_PADDING * 2,
            height: rect.height + HIGHLIGHT_PADDING * 2,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-body"
        className="absolute flex w-[calc(100%-2rem)] max-w-xs flex-col gap-4 rounded-xl border border-taupe/30 bg-paper p-6 shadow-lg"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={skip}
            className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:text-accent"
          >
            Skip
          </button>
        </div>

        <div>
          <h2 id="tour-step-title" className="font-serif text-lg text-ink mb-1">
            {step.title}
          </h2>
          <p id="tour-step-body" className="font-sans text-sm text-ink-muted leading-relaxed">
            {step.body}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === stepIndex ? "bg-accent" : "bg-ink-faint/30"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={prev}
                className="rounded-xl px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-xl bg-accent px-4 py-1.5 font-mono text-label-sm uppercase tracking-[0.12em] text-paper transition-colors duration-150 hover:bg-ink"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cardPosition(rect: TargetRect | null): React.CSSProperties {
  if (typeof window === "undefined") return { top: VIEWPORT_MARGIN, left: VIEWPORT_MARGIN };

  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const placeBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove;

  const left = Math.min(
    Math.max(rect.left, VIEWPORT_MARGIN),
    window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
  );

  return placeBelow
    ? { top: rect.top + rect.height + HIGHLIGHT_PADDING + CARD_GAP, left }
    : { bottom: window.innerHeight - rect.top + HIGHLIGHT_PADDING + CARD_GAP, left };
}
