import { describe, it, expect } from "vitest";
import {
  TERM_CALENDAR,
  phaseFor,
  phaseForRange,
  type TermWindow,
} from "./academicCalendar";

// Synthetic calendar. The shipped TERM_CALENDAR is empty by design; these
// windows exist only to test the lookup.
const sample: readonly TermWindow[] = [
  { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
  { phase: "midterms", startPhDate: "2026-09-21", endPhDate: "2026-09-27" },
  { phase: "break", startPhDate: "2026-12-20", endPhDate: "2027-01-04" },
];

describe("TERM_CALENDAR", () => {
  it("ships empty so no exam date is ever invented", () => {
    expect(TERM_CALENDAR).toEqual([]);
  });
});

describe("phaseFor", () => {
  it("returns unknown for every date while the shipped calendar is empty", () => {
    expect(phaseFor("2026-08-08")).toBe("unknown");
  });

  it("finds the phase covering a date", () => {
    expect(phaseFor("2026-08-08", sample)).toBe("classes");
    expect(phaseFor("2026-09-24", sample)).toBe("midterms");
  });

  it("treats both window ends as inclusive", () => {
    expect(phaseFor("2026-08-01", sample)).toBe("classes");
    expect(phaseFor("2026-09-20", sample)).toBe("classes");
  });

  it("returns unknown for a date no window covers", () => {
    expect(phaseFor("2026-10-15", sample)).toBe("unknown");
  });

  it("handles a window that spans a year boundary", () => {
    expect(phaseFor("2026-12-31", sample)).toBe("break");
    expect(phaseFor("2027-01-02", sample)).toBe("break");
  });
});

describe("phaseForRange", () => {
  it("returns unknown and unmixed when nothing in the range is covered", () => {
    expect(phaseForRange("2026-10-01", "2026-10-07", sample)).toEqual({
      phase: "unknown",
      mixed: false,
    });
  });

  it("returns unknown for any range against the empty shipped calendar", () => {
    expect(phaseForRange("2026-08-01", "2026-08-07")).toEqual({
      phase: "unknown",
      mixed: false,
    });
  });

  it("reports a single phase when the whole range sits inside one window", () => {
    expect(phaseForRange("2026-08-05", "2026-09-10", sample)).toEqual({
      phase: "classes",
      mixed: false,
    });
  });

  it("both endpoints in gaps with a window fully enclosed between them", () => {
    // Query starts and ends in uncovered periods, with both classes and
    // midterms windows fully enclosed between them. Endpoint-only sampling
    // would return { phase: "unknown", mixed: false } because both endpoints
    // (2026-07-01 and 2026-10-15) are uncovered. Full scanning detects the
    // enclosed windows inside.
    expect(phaseForRange("2026-07-01", "2026-10-15", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("two adjacent same-phase windows contiguously covering the range", () => {
    // Two classes windows back-to-back (2026-08-01 to 2026-09-20 and
    // a hypothetical continuation). This tests that adjacent windows
    // (one ends on day N, next starts on day N+1) are not treated as
    // having a gap between them. Without the dayAfter helper, this
    // would spuriously report mixed: true.
    const adjacentWindows: readonly TermWindow[] = [
      { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
      { phase: "classes", startPhDate: "2026-09-21", endPhDate: "2026-10-31" },
    ];
    expect(phaseForRange("2026-08-15", "2026-09-25", adjacentWindows)).toEqual({
      phase: "classes",
      mixed: false,
    });
  });

  it("calendar declared out of order returns chronologically first phase", () => {
    // Calendar windows are declared out of chronological order (midterms before
    // classes), but both overlap the query range. The fix ensures we use
    // chronologically-sorted windows to find the first known phase (classes,
    // which starts 2026-08-01), not declaration order (midterms, declared first).
    const outOfOrder: readonly TermWindow[] = [
      { phase: "midterms", startPhDate: "2026-09-21", endPhDate: "2026-09-27" },
      { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
    ];
    // Query spans both windows; there is a gap at the end (2026-09-28 to 2026-10-05).
    // Both phases present, so mixed: true. Returned phase is "classes" because it is
    // chronologically first (starts 2026-08-01), despite being declared second.
    expect(phaseForRange("2026-07-25", "2026-10-05", outOfOrder)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("exact 1-day tail gap is detected (regression for Bug 1)", () => {
    // Query ends exactly 1 day after the last window. This is an uncovered day,
    // so "unknown" must be in the phase set and mixed must be true.
    // Bug 1 used dayAfter() on the tail check, which swallowed this exact case.
    expect(
      phaseForRange("2026-08-05", "2026-09-21", [
        {
          phase: "classes",
          startPhDate: "2026-08-01",
          endPhDate: "2026-09-20",
        },
      ])
    ).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("genuine gap between windows triggers mixed with unknown", () => {
    // Query spans multiple windows with a real multi-day gap between them.
    // The gap ensures "unknown" is added to the phase set, triggering mixed: true.
    expect(phaseForRange("2026-09-15", "2026-09-30", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("flags a range that straddles two phases via endpoints", () => {
    // Range spans from inside classes into midterms. Endpoint sampling
    // would already catch this, but we test it for completeness.
    expect(phaseForRange("2026-09-18", "2026-09-24", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });
});
