"use client";

import { useCallback, useEffect, useState } from "react";

export interface TourStep {
  /** Unique step id within the tour — used for React keys only. */
  id: string;
  /**
   * `data-tour="<target>"` value of the element this step anchors to.
   * Omit for an unanchored step (e.g. a welcome/intro card): `TourOverlay`
   * renders it centered with no highlight. A step whose target *is* set but
   * isn't found in the DOM this visit (a section that only renders once
   * there's data for it, say) is skipped automatically instead of stalling
   * the tour.
   */
  target?: string;
  title: string;
  body: string;
}

export interface UseTourResult {
  active: boolean;
  stepIndex: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
}

function storageKey(tourId: string): string {
  return `bsit:tour:${tourId}`;
}

function readDone(tourId: string): boolean {
  try {
    // Presence is the whole signal — the stored value itself is never read.
    return localStorage.getItem(storageKey(tourId)) !== null;
  } catch {
    // Blocked/unavailable storage: fail toward not showing the tour rather
    // than re-showing it on every single load.
    return true;
  }
}

function writeDone(tourId: string): void {
  try {
    localStorage.setItem(storageKey(tourId), "1");
  } catch {
    // Non-fatal — worst case the tour reappears next visit.
  }
}

/**
 * Drives a step-by-step onboarding tour. Pure state + persistence — it knows
 * nothing about rendering or the DOM. Pair it with `TourOverlay` (or a
 * custom presentation) for the visuals.
 *
 * Auto-activates on mount only if `tourId` hasn't already been completed or
 * skipped on this browser, tracked in `localStorage` under
 * `bsit:tour:<tourId>`. `skip()` (and reaching the end via `next()`) marks
 * only *this* `tourId` done — it never touches another tour's key, so
 * several tours (one per dashboard section, say) can each be skipped
 * independently without affecting one another.
 */
export function useTour(tourId: string, steps: TourStep[]): UseTourResult {
  const totalSteps = steps.length;
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (totalSteps === 0) return;
    if (!readDone(tourId)) {
      // localStorage can't be read during render (server/client mismatch),
      // so this one-time "should we even start" check has to live here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(true);
    }
    // Deliberately tourId-only: a later change in step count must not
    // re-run this one-time activation check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const finish = useCallback(() => {
    writeDone(tourId);
    setActive(false);
    setStepIndex(0);
  }, [tourId]);

  const next = useCallback(() => {
    // Reads stepIndex from render scope rather than a setState updater —
    // finish() itself calls setState, and updater functions must stay pure.
    if (stepIndex + 1 >= totalSteps) {
      finish();
      return;
    }
    setStepIndex(stepIndex + 1);
  }, [stepIndex, totalSteps, finish]);

  const prev = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  return { active, stepIndex, totalSteps, next, prev, skip };
}
