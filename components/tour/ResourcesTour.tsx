"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const RESOURCES_STEPS: TourStep[] = [
  {
    id: "playground",
    target: "resources-playground",
    title: "Code playground",
    body: "Run Python, SQL, Java, and C right in your browser — no setup needed.",
  },
  {
    id: "search",
    target: "resources-search",
    title: "Search the kit",
    body: "Already know what you're after? Find any lesson, module, or topic by keyword.",
  },
];

export interface ResourcesTourProps {
  /**
   * Whether the reader is signed in. Resources allows anon access, but this
   * tour only auto-runs for a signed-in user arriving via the dashboard shell
   * — anon visitors either never came through the dashboard or already saw
   * the landing tour (#60), so they never see this one too. `false` mounts
   * nothing.
   */
  signedIn: boolean;
}

/**
 * Mounts the Resources section tour (`tourId: "resources"`). Steps anchor to
 * the Code Playground card and the Search card.
 */
export function ResourcesTour({ signedIn }: ResourcesTourProps) {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("resources", RESOURCES_STEPS);

  if (!signedIn || !active) return null;

  return (
    <TourOverlay
      steps={RESOURCES_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
