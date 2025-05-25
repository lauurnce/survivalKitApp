"use client";

// On a phone the landing tour's welcome card ("Step 1 of 6") covers the hero,
// and 21% of devices opened `/` and clicked nothing. So the landing tour
// waits: a device's first load of `/` is left alone, and the tour starts on
// a later visit.
//
// The marker deliberately lives OUTSIDE the `bsit:tour:` prefix. The /account
// "Replay tour" button calls resetAllTours(), which clears only that prefix;
// a device that has already been here keeps this marker, so the replayed
// landing tour starts on the very next visit instead of being deferred again.
export const LANDING_SEEN_KEY = "bsit:landing-seen";

// Decided once per page load. React re-runs mount effects in development
// Strict Mode, and a second read would see the marker the first one just
// wrote, showing the tour on a first visit in dev only. A client-side
// navigation back to `/` in the same load keeps the same answer, so "second
// visit" means a later page load.
let decided: boolean | null = null;

/** True on any load of `/` after this device's first. Records the first one. */
export function isReturnLandingVisit(): boolean {
  if (decided !== null) return decided;
  try {
    decided = localStorage.getItem(LANDING_SEEN_KEY) !== null;
    if (!decided) localStorage.setItem(LANDING_SEEN_KEY, "1");
  } catch {
    // Blocked storage can't tell a first visit from a tenth: hold the tour
    // back, the same way useTour treats unreadable storage as "done".
    decided = false;
  }
  return decided;
}

/** Test-only: forget this load's decision so the next call reads storage again. */
export function resetLandingVisitForTests(): void {
  decided = null;
}
