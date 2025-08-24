"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TourStep } from "@/lib/tour/useTour";
import {
  HIGHLIGHT_PADDING,
  needsScroll,
  placeCard,
  type Box,
  type CardPlacement,
} from "@/lib/tour/placement";

export interface TourOverlayProps {
  /** Same array passed into `useTour` — this component only reads it. */
  steps: TourStep[];
  stepIndex: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
}

/** A target taller than this share of the viewport scrolls to its top, not its middle. */
const TALL_TARGET_RATIO = 0.5;

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
 *
 * Each anchored step scrolls its target on screen, then places the card
 * beside it — or, when there is no room (small phones, tall sections),
 * docks the card to the top or bottom edge of the viewport. Either way the
 * whole card, and so Skip/Back/Next, stays inside the viewport
 * (`placeCard` in lib/tour/placement.ts).
 */
export function TourOverlay({ steps, stepIndex, totalSteps, next, prev, skip }: TourOverlayProps) {
  const step = steps[stepIndex] ?? null;
  const [rect, setRect] = useState<Box | null>(null);
  const [placement, setPlacement] = useState<CardPlacement | null>(null);
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
    const find = () => document.querySelector<HTMLElement>(`[data-tour="${target}"]`);

    // Bring the target on screen once per step, instantly, before measuring.
    // The card lives in a fixed overlay, so a target left below the fold
    // used to drag the card below the fold with it — out of reach on phones.
    const el = find();
    if (el) {
      const r = el.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      if (needsScroll(r, viewport)) {
        el.scrollIntoView?.({
          block: r.height > viewport.height * TALL_TARGET_RATIO ? "start" : "center",
          inline: "nearest",
          behavior: "instant",
        });
      }
    }

    function measure() {
      const node = find();
      if (!node) {
        setRect(null);
        setMissing(true);
        return;
      }
      setMissing(false);
      const r = node.getBoundingClientRect();
      setRect((prev) =>
        prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height }
      );
    }

    // Scroll/resize can fire many times a frame; one measurement per frame
    // is enough to keep the spotlight on the target.
    let frame = 0;
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }

    measure();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [step]);

  // Place the card from its real rendered size (it is narrower than 20rem on
  // small phones and its height depends on the copy), so the placement can
  // promise the whole card stays inside the viewport.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    function place() {
      if (!card) return;
      const placed = placeCard(
        rect,
        { width: card.offsetWidth, height: card.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight }
      );
      setPlacement((prev) =>
        prev && prev.mode === placed.mode && prev.x === placed.x && prev.y === placed.y ? prev : placed
      );
    }
    place();
    // An unanchored step has no scroll/resize listener above; it still has
    // to re-center when the viewport changes (rotation, URL bar).
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [rect, stepIndex, missing]);

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
    first?.focus({ preventScroll: true });
  }, [stepIndex, missing]);

  if (!step || missing) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop / click-to-skip catcher. Dark itself only when there's no
          target to spotlight — once a target exists, the dimming moves onto
          its own box-shadow below so the target reads at full color instead
          of dark page underneath an accent-colored outline. */}
      <div
        className={`absolute inset-0 ${rect ? "" : "bg-ink/60"}`}
        aria-hidden="true"
        onClick={skip}
      />

      {/* Spotlight: a transparent box whose box-shadow does double duty —
          a thin accent ring right at its edge, then an oversized second
          layer that paints the dimming everywhere beyond that ring. Both
          have to live in the same `boxShadow` value (comma-separated
          layers): a `ring-*` utility class here would also compile to
          `box-shadow` and silently lose to this inline style, which is
          exactly the bug this replaced — the ring rendered, but the target
          underneath it stayed dim. */}
      {rect && (
        <div
          aria-hidden="true"
          data-tour-spotlight="true"
          className="pointer-events-none absolute left-0 top-0 rounded-xl"
          style={{
            // Positioned by transform, never top/left: it follows the target
            // on every scroll frame, and moving layout properties there was
            // counted as layout shift (CLS 2.49 on phones).
            transform: `translate3d(${rect.left - HIGHLIGHT_PADDING}px, ${rect.top - HIGHLIGHT_PADDING}px, 0)`,
            width: rect.width + HIGHLIGHT_PADDING * 2,
            height: rect.height + HIGHLIGHT_PADDING * 2,
            boxShadow:
              "0 0 0 2px rgb(var(--color-accent)), 0 0 0 9999px rgb(var(--color-ink) / 0.6)",
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
        data-tour-card={placement?.mode ?? "pending"}
        className="absolute left-0 top-0 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xs flex-col gap-4 overflow-y-auto rounded-xl border border-taupe/30 bg-paper p-6 shadow-lg"
        style={
          placement
            ? { transform: `translate3d(${placement.x}px, ${placement.y}px, 0)` }
            : undefined
        }
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
