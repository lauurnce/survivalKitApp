"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const LANDING_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "New here?",
    body: "Take a 30-second look around before you dive in.",
  },
  {
    id: "subjects",
    target: "landing-subjects",
    title: "Start here",
    body: "Browse every year and subject to find your modules.",
  },
  {
    id: "search",
    target: "landing-search",
    title: "Search modules",
    body: "Already know what you're after? Jump straight to it.",
  },
  {
    id: "popular",
    target: "landing-popular",
    title: "Popular right now",
    body: "See what other students are reading most.",
  },
  {
    id: "login",
    target: "landing-login",
    title: "Save your progress",
    body: "Log in or create a free account to track what you've read.",
  },
];

/**
 * Mounts the first-time-visitor tour for the landing page (`tourId:
 * "landing"`). Takes no props — the popular-modules step skips itself
 * automatically via `TourOverlay` when that section isn't rendered (no
 * reads yet on a fresh install), same as any other tour built on `useTour`.
 */
export function LandingTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("landing", LANDING_STEPS);

  if (!active) return null;

  return (
    <TourOverlay
      steps={LANDING_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
