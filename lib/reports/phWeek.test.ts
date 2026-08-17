import { describe, it, expect } from "vitest";
import { phDate, phDayStartUtc, phWeekWindows } from "./phWeek";

describe("phDate", () => {
  it("returns the Manila calendar date for an afternoon UTC instant", () => {
    expect(phDate(new Date("2026-08-08T10:00:00.000Z"))).toBe("2026-08-08");
  });

  it("rolls forward to the next PH day once UTC passes 16:00", () => {
    // 16:00Z is midnight in Manila. UTC still says the 8th; PH says the 9th.
    expect(phDate(new Date("2026-08-08T16:00:00.000Z"))).toBe("2026-08-09");
  });

  it("does not roll forward one second early", () => {
    expect(phDate(new Date("2026-08-08T15:59:59.999Z"))).toBe("2026-08-08");
  });
});

describe("phDayStartUtc", () => {
  it("maps a PH calendar date to the UTC instant of its midnight", () => {
    expect(phDayStartUtc("2026-08-08")).toBe("2026-08-07T16:00:00.000Z");
  });

  it("round-trips with phDate", () => {
    const start = phDayStartUtc("2026-01-01");
    expect(phDate(new Date(start))).toBe("2026-01-01");
  });
});

describe("phWeekWindows", () => {
  const now = new Date("2026-08-08T10:00:00.000Z"); // PH: 2026-08-08 18:00

  it("returns the two most recent complete PH weeks, newest first", () => {
    const [current, previous] = phWeekWindows(now, 2);

    expect(current.sinceIso).toBe("2026-07-31T16:00:00.000Z");
    expect(current.untilIso).toBe("2026-08-07T16:00:00.000Z");
    expect(current.label).toBe("2026-08-01 → 2026-08-07");

    expect(previous.sinceIso).toBe("2026-07-24T16:00:00.000Z");
    expect(previous.untilIso).toBe("2026-07-31T16:00:00.000Z");
    expect(previous.label).toBe("2026-07-25 → 2026-07-31");
  });

  it("excludes today, so a partial day is never compared against a whole one", () => {
    const [current] = phWeekWindows(now, 1);
    expect(current.untilIso).toBe(phDayStartUtc(phDate(now)));
  });

  it("windows abut exactly with no gap and no overlap", () => {
    const [current, previous] = phWeekWindows(now, 2);
    expect(previous.untilIso).toBe(current.sinceIso);
  });

  it("returns as many windows as asked for", () => {
    expect(phWeekWindows(now, 8)).toHaveLength(8);
  });

  it("defaults to two windows", () => {
    expect(phWeekWindows(now)).toHaveLength(2);
  });

  it("is stable across a UTC day boundary that PH has already crossed", () => {
    // 20:00Z on the 8th is 04:00 on the 9th in Manila. The current window must
    // end at PH midnight of the 9th, not the 8th.
    const [current] = phWeekWindows(new Date("2026-08-08T20:00:00.000Z"), 1);
    expect(current.untilIso).toBe("2026-08-08T16:00:00.000Z");
    expect(current.label).toBe("2026-08-02 → 2026-08-08");
  });
});
