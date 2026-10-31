import { describe, it, expect } from "vitest";
import {
  TERM_CALENDAR,
  isEstimate,
  rangeIncludesEstimate,
  phaseFor,
  phaseForRange,
  type TermWindow,
} from "./academicCalendar";

// Synthetic calendar, independent of the shipped one, so the lookup tests do
// not move every time the owner edits real dates.
const sample: readonly TermWindow[] = [
  { phase: "classes", startPhDate: "2026-08-01", endPhDate: "2026-09-20" },
  { phase: "midterms", startPhDate: "2026-09-21", endPhDate: "2026-09-27" },
  { phase: "break", startPhDate: "2026-12-20", endPhDate: "2027-01-04" },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe("TERM_CALENDAR", () => {
  it("uses valid ISO dates with start <= end", () => {
    for (const w of TERM_CALENDAR) {
      expect(w.startPhDate).toMatch(ISO);
      expect(w.endPhDate).toMatch(ISO);
      expect(Number.isNaN(Date.parse(w.startPhDate))).toBe(false);
      expect(w.startPhDate <= w.endPhDate).toBe(true);
    }
  });

  it("is sorted, non-overlapping, and gap-free, so no week reads as mixed by accident", () => {
    for (let i = 1; i < TERM_CALENDAR.length; i++) {
      const prev = TERM_CALENDAR[i - 1]!;
      const next = TERM_CALENDAR[i]!;
      const dayAfterPrev = new Date(Date.parse(prev.endPhDate) + 86_400_000).toISOString().slice(0, 10);
      expect(next.startPhDate).toBe(dayAfterPrev);
    }
  });

  it("cites a source on every window", () => {
    for (const w of TERM_CALENDAR) expect(w.note?.length ?? 0).toBeGreaterThan(0);
  });

  it("places the Dec 9–19 finals window, flagged as partly estimated", () => {
    expect(phaseFor("2026-12-09")).toBe("finals");
    expect(phaseFor("2026-12-19")).toBe("finals");
    const finals = TERM_CALENDAR.find((w) => w.phase === "finals")!;
    expect(isEstimate(finals)).toBe(true);
  });

  it("covers the Aug-10 wave from first day of classes through the Aug 2027 freshman wave", () => {
    expect(phaseFor("2026-08-09")).toBe("unknown");
    expect(phaseFor("2026-08-10")).toBe("classes");
    expect(phaseFor("2026-10-07")).toBe("midterms");
    expect(phaseFor("2026-12-25")).toBe("break");
    expect(phaseFor("2027-01-05")).toBe("classes");
    expect(phaseFor("2027-03-03")).toBe("midterms");
    expect(phaseFor("2027-05-14")).toBe("finals");
    expect(phaseFor("2027-07-01")).toBe("break");
    expect(phaseFor("2027-08-17")).toBe("classes");
    expect(phaseFor("2027-10-04")).toBe("unknown");
  });

  it("marks every projected 2nd-sem and AY 2027–28 window as an estimate", () => {
    for (const w of TERM_CALENDAR.filter((w) => w.startPhDate >= "2027-01-05")) {
      // The Jan 5 classes window has a confirmed start but a projected end.
      expect(isEstimate(w), `${w.startPhDate} ${w.phase}`).toBe(true);
    }
  });

  it("covers a date 30 days out, so a weekly report always has a phase to read", () => {
    // Real clock on purpose, like the term-schedule tripwire in lib/terms.test.ts.
    const ph = new Date(Date.now() + 8 * 3600_000 + 30 * 86_400_000).toISOString().slice(0, 10);
    expect(phaseFor(ph), `TERM_CALENDAR ends before ${ph}; extend it`).not.toBe("unknown");
  });

  it("reports a week straddling finals and the break as mixed", () => {
    expect(phaseForRange("2026-12-14", "2026-12-20")).toEqual({ phase: "finals", mixed: true });
  });
});

describe("isEstimate", () => {
  it("is true only for windows whose note carries the marker", () => {
    expect(isEstimate({ phase: "finals", startPhDate: "2026-12-01", endPhDate: "2026-12-02", note: "ESTIMATE" })).toBe(true);
    expect(isEstimate({ phase: "finals", startPhDate: "2026-12-01", endPhDate: "2026-12-02", note: "confirmed" })).toBe(false);
    expect(isEstimate({ phase: "finals", startPhDate: "2026-12-01", endPhDate: "2026-12-02" })).toBe(false);
  });
});

describe("phaseFor", () => {
  it("returns unknown for a date before the shipped calendar starts", () => {
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

  it("returns unknown for a range wholly before the shipped calendar", () => {
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

describe("rangeIncludesEstimate", () => {
  it("flags a range touching an estimated window and nothing else", () => {
    expect(rangeIncludesEstimate("2026-12-14", "2026-12-20")).toBe(true);
    expect(rangeIncludesEstimate("2026-08-10", "2026-08-16")).toBe(false);
    expect(rangeIncludesEstimate("2026-09-01", "2026-09-07", sample)).toBe(false);
  });
});
