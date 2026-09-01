"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const DASHBOARD_STEPS: TourStep[] = [
  {
    id: "hero",
    target: "dashboard-hero",
    title: "Your progress at a glance",
    body: "See your current semester and top pick to continue right where you left off.",
  },
  {
    id: "roadmap-summary",
    target: "dashboard-roadmap-summary",
    title: "Academic roadmap",
    body: "Track your activity streak and see what's next on your roadmap.",
  },
  {
    id: "semesters",
    target: "dashboard-semesters",
    title: "Browse by term",
    body: "Every year and semester, organized so you can jump straight to what you need.",
  },
  {
    id: "this-week",
    target: "dashboard-this-week",
    title: "This week",
    body: "Modules picked for you based on where you left off.",
  },
  {
    id: "discounts",
    target: "dashboard-discounts",
    title: "Discount codes",
    body: "Redeem a code or share feedback right from your dashboard.",
  },
];

/**
 * Mounts the first-time-visitor tour for the dashboard (`tourId: "dashboard"`).
 * Takes no props — `AccountPage` already redirects signed-out visitors before
 * this ever renders, so mounting it there is the whole "signed-in only" gate.
 */
export function DashboardTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("dashboard", DASHBOARD_STEPS);

  if (!active) return null;

  return (
    <TourOverlay
      steps={DASHBOARD_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
