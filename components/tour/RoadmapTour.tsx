"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const ROADMAP_STEPS: TourStep[] = [
  {
    id: "journey",
    target: "roadmap-journey",
    title: "Your journey",
    body: "See when you started and how much of the program you've completed overall.",
  },
  {
    id: "activity",
    target: "roadmap-activity",
    title: "Activity & progress",
    body: "Track your reading streak and daily activity over the last 8 weeks.",
  },
  {
    id: "subscriptions",
    target: "roadmap-subscriptions",
    title: "Active subscriptions",
    body: "Check how much time is left on each subject or year you've unlocked.",
  },
  {
    id: "timeline",
    target: "roadmap-timeline",
    title: "Detailed timeline",
    body: "Expand any semester to see its subjects, modules, and unlock status.",
  },
  {
    id: "graduation",
    target: "roadmap-graduation",
    title: "The finish line",
    body: "Complete every semester to reach graduation.",
  },
];

/**
 * Mounts the first-time-visitor tour for the roadmap page (`tourId:
 * "roadmap"`). Takes no props — the subscriptions step skips itself
 * automatically via `TourOverlay` when nothing's unlocked yet, same as any
 * other tour built on `useTour`.
 */
export function RoadmapTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("roadmap", ROADMAP_STEPS);

  if (!active) return null;

  return (
    <TourOverlay
      steps={ROADMAP_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
