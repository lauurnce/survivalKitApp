"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";
import { isReturnLandingVisit } from "@/lib/tour/landingVisit";

const LANDING_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "New here?",
    body: "Take a 30-second look around before you dive in.",
  },
  {
    id: "start",
    target: "landing-start",
    title: "Start with CP1",
    body: "First year? Jump straight into Computer Programming 1, Lesson 1 — its reviewers are free.",
  },
  {
    id: "subjects",
    target: "landing-subjects",
    title: "Every subject",
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

const TOUR_OPTIONS = { shouldStart: isReturnLandingVisit };

/**
 * Mounts the newcomer tour for the landing page (`tourId: "landing"`). It
 * never starts on a device's first load of `/`, where on a phone it would
 * cover the hero; it starts on the next visit instead (see
 * `lib/tour/landingVisit.ts`). Takes no props — the popular-modules step
 * skips itself automatically via `TourOverlay` when that section isn't
 * rendered (no reads yet on a fresh install), same as any other tour built
 * on `useTour`.
 */
export function LandingTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("landing", LANDING_STEPS, TOUR_OPTIONS);

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
