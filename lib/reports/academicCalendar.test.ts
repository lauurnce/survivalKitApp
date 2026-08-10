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

  it("calendar declared out of order with unknown start and two phases", () => {
    // Calendar windows are declared out of chronological order. Start is
    // unknown (in a gap), and two phases are enclosed. The fix ensures we
    // use chronologically-sorted windows to find the first known phase,
    // not declaration order.
    const outOfOrder: readonly TermWindow[] = [
      { phase: "finals", startPhDate: "2026-10-15", endPhDate: "2026-10-25" },
      { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
      { phase: "midterms", startPhDate: "2026-09-21", endPhDate: "2026-09-27" },
    ];
    // Query range starts in a gap (after midterms, before finals) and spans
    // to include finals. Both phases are present, start is unknown.
    expect(phaseForRange("2026-10-01", "2026-10-30", outOfOrder)).toEqual({
      phase: "finals",
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
