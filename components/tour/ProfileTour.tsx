"use client";

import { useTour, type TourStep } from "@/lib/tour/useTour";
import { TourOverlay } from "@/components/tour/TourOverlay";

const PROFILE_STEPS: TourStep[] = [
  {
    id: "profile-card",
    target: "profile-card",
    title: "Your account",
    body: "Your major, university, school type, and when you joined — all in one place.",
  },
  {
    id: "profile-danger",
    target: "profile-danger",
    title: "Danger zone",
    body: "This is where irreversible actions live, like deleting your account for good.",
  },
];

/**
 * Mounts the first-time-visitor tour for the profile page (`tourId:
 * "profile"`). Takes no props. Two steps only — `ProfileCard` and
 * `DangerZone` are genuinely the only two distinct features on this page.
 */
export function ProfileTour() {
  const { active, stepIndex, totalSteps, next, prev, skip } = useTour("profile", PROFILE_STEPS);

  if (!active) return null;

  return (
    <TourOverlay
      steps={PROFILE_STEPS}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      next={next}
      prev={prev}
      skip={skip}
    />
  );
}
