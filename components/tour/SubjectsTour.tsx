"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const SUBJECTS_STEPS: TourStep[] = [
  {
    id: "years",
    target: "subjects-years",
    title: "Pick your year",
    body: "Choose a year level to see the subjects inside it.",
  },
  {
    id: "stats",
    target: "subjects-stats",
    title: "See what's inside",
    body: "Each card shows how many subjects are in each semester, plus how many students are already reading.",
  },
  {
    id: "search",
    target: "subjects-search",
    title: "Search modules",
    body: "Already know what you're after? Jump straight to it.",
  },
];

/**
 * Mounts the "Subjects" dashboard-shell tour (`tourId: "subjects"`) for
 * `/year`. The caller only renders this when the dashboard shell is showing
 * (`showNavRail` true) — anon visitors reaching `/year` from the public
 * landing page already saw the landing tour (#60) and should not see this
 * one too.
 */
export function SubjectsTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("subjects", SUBJECTS_STEPS);

  if (!active) return null;

  return (
    <TourOverlay
      steps={SUBJECTS_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
