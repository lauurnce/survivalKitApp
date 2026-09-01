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
  {
    id: "quiz",
    target: "resources-quiz",
    title: "Quiz yourself",
    body: "Test yourself on the subjects you've finished modules in.",
  },
];

export interface ResourcesTourProps {
  /**
   * Real signed-in userId, or `null` for an anonymous visitor. Resources
   * allows anon access, but this tour only auto-runs for a signed-in user
   * arriving via the dashboard shell — anon visitors either never came
   * through the dashboard or already saw the landing tour (#60), so they
   * never see this one too. Passing `null` mounts nothing.
   */
  userId: string | null;
}

/**
 * Mounts the Resources section tour (`tourId: "resources"`). Steps anchor to
 * the Code Playground card, the Search card, and the quiz section — the
 * quiz step's target is the section wrapper, present whether that section
 * renders `<SubjectQuizList />` (signed in) or the sign-in prompt (anon),
 * so the step works either way.
 */
export function ResourcesTour({ userId }: ResourcesTourProps) {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("resources", RESOURCES_STEPS);

  if (!userId || !active) return null;

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
