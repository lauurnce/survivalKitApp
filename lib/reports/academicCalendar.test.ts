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
  it("reports a single phase when the whole range sits inside one window", () => {
    expect(phaseForRange("2026-08-01", "2026-08-07", sample)).toEqual({
      phase: "classes",
      mixed: false,
    });
  });

  it("flags a range that straddles two phases", () => {
    expect(phaseForRange("2026-09-18", "2026-09-24", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

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

  it("detects a window fully enclosed by the range, touching neither endpoint", () => {
    expect(phaseForRange("2026-08-05", "2026-09-25", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("reports mixed when two distinct phases are both enclosed by the range", () => {
    expect(phaseForRange("2026-08-15", "2026-09-25", sample)).toEqual({
      phase: "classes",
      mixed: true,
    });
  });

  it("reports a single phase when the whole range sits inside one window", () => {
    expect(phaseForRange("2026-08-05", "2026-09-10", sample)).toEqual({
      phase: "classes",
      mixed: false,
    });
  });

  it("handles unknown start with a known end phase", () => {
    expect(phaseForRange("2026-10-01", "2026-12-25", sample)).toEqual({
      phase: "break",
      mixed: true,
    });
  });

  it("returns unknown and unmixed against an empty calendar", () => {
    expect(phaseForRange("2026-08-01", "2026-08-07")).toEqual({
      phase: "unknown",
      mixed: false,
    });
  });
});
