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
  // PH: 2026-08-08 18:00, a Saturday — deliberately NOT a Monday, so a
  // regression to trailing-7-days-from-today (issue #33) would resurface as
  // a window not starting on a Monday.
  const now = new Date("2026-08-08T10:00:00.000Z");

  it("returns the two most recently completed Monday-Sunday PH weeks, newest first", () => {
    const [current, previous] = phWeekWindows(now, 2);

    // Aug 8 2026 is a Saturday inside the in-progress Mon Aug 3 - Sun Aug 9
    // week, which is excluded — the most recently COMPLETE week is the one
    // before it, Mon Jul 27 - Sun Aug 2. This is the exact span
    // growth_cohort_agg's Postgres date_trunc('week', ...) would also
    // produce for the same instant — the alignment issue #33 asked for.
    expect(current.sinceIso).toBe(phDayStartUtc("2026-07-27"));
    expect(current.untilIso).toBe(phDayStartUtc("2026-08-03"));
    expect(current.label).toBe("2026-07-27 → 2026-08-02");

    expect(previous.sinceIso).toBe(phDayStartUtc("2026-07-20"));
    expect(previous.untilIso).toBe(phDayStartUtc("2026-07-27"));
    expect(previous.label).toBe("2026-07-20 → 2026-07-26");
  });

  it("starts every window on a Monday", () => {
    for (const w of phWeekWindows(now, 4)) {
      // sinceIso is PH midnight of a Monday, expressed as a UTC instant
      // (16:00 the prior UTC day) — read the weekday off the PH calendar
      // date the label already carries, not off the raw UTC instant.
      const phCalendarDate = w.label.split(" → ")[0];
      expect(new Date(`${phCalendarDate}T00:00:00.000Z`).getUTCDay()).toBe(1); // Monday
    }
  });

  it("excludes the in-progress week even when today is itself a Monday", () => {
    const monday = new Date("2026-08-03T02:00:00.000Z"); // PH: Mon Aug 3, 10:00
    const [current] = phWeekWindows(monday, 1);
    expect(current.untilIso).toBe(phDayStartUtc("2026-08-03"));
    expect(current.label).toBe("2026-07-27 → 2026-08-02");
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
    // 20:00Z on the 8th is 04:00 on the 9th (a Sunday) in Manila — still
    // inside the same in-progress Mon Aug 3 - Sun Aug 9 week as `now` above,
    // so the most recently complete week must come out identical.
    const [current] = phWeekWindows(new Date("2026-08-08T20:00:00.000Z"), 1);
    expect(current.untilIso).toBe(phDayStartUtc("2026-08-03"));
    expect(current.label).toBe("2026-07-27 → 2026-08-02");
  });
});
