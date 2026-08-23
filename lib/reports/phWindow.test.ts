import { describe, it, expect } from "vitest";
import {
  phMonthKey,
  phMonthStartUtc,
  phDayOfMonth,
  phDaysInMonth,
  daysAgo,
  inWindow,
} from "./phWindow";

describe("phMonthKey", () => {
  it("uses the Manila calendar month, not the UTC one", () => {
    // 2026-07-31T16:00:00Z is 2026-08-01T00:00 in Manila.
    expect(phMonthKey(new Date("2026-07-31T16:00:00.000Z"))).toBe("2026-08");
  });

  it("stays in the earlier month one second before the boundary", () => {
    expect(phMonthKey(new Date("2026-07-31T15:59:59.000Z"))).toBe("2026-07");
  });

  it("agrees with UTC in the middle of a month", () => {
    expect(phMonthKey(new Date("2026-08-15T03:00:00.000Z"))).toBe("2026-08");
  });

  it("rolls the year over correctly", () => {
    expect(phMonthKey(new Date("2026-12-31T16:00:00.000Z"))).toBe("2027-01");
  });
});

describe("phMonthStartUtc", () => {
  it("returns 16:00 UTC on the last day of the previous UTC month", () => {
    const start = phMonthStartUtc(new Date("2026-08-08T05:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-07-31T16:00:00.000Z");
  });

  it("is idempotent when called on the boundary instant itself", () => {
    const boundary = new Date("2026-07-31T16:00:00.000Z");
    expect(phMonthStartUtc(boundary).toISOString()).toBe(boundary.toISOString());
  });
});

describe("phDayOfMonth", () => {
  it("is 1 at the Manila month boundary", () => {
    expect(phDayOfMonth(new Date("2026-07-31T16:00:00.000Z"))).toBe(1);
  });

  it("is the last day one second earlier", () => {
    expect(phDayOfMonth(new Date("2026-07-31T15:59:59.000Z"))).toBe(31);
  });
});

describe("phDaysInMonth", () => {
  it("counts 31 for August", () => {
    expect(phDaysInMonth(new Date("2026-08-08T05:00:00.000Z"))).toBe(31);
  });

  it("counts 30 for September", () => {
    expect(phDaysInMonth(new Date("2026-09-08T05:00:00.000Z"))).toBe(30);
  });

  it("counts 28 for a non-leap February", () => {
    expect(phDaysInMonth(new Date("2026-02-08T05:00:00.000Z"))).toBe(28);
  });

  it("counts 29 for a leap February", () => {
    expect(phDaysInMonth(new Date("2028-02-08T05:00:00.000Z"))).toBe(29);
  });
});

describe("daysAgo", () => {
  it("subtracts whole days from the instant", () => {
    expect(daysAgo(new Date("2026-08-08T05:00:00.000Z"), 7).toISOString()).toBe(
      "2026-08-01T05:00:00.000Z"
    );
  });

  it("returns the same instant for zero days", () => {
    const now = new Date("2026-08-08T05:00:00.000Z");
    expect(daysAgo(now, 0).toISOString()).toBe(now.toISOString());
  });
});

describe("inWindow", () => {
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-08T00:00:00.000Z");

  it("includes the lower bound", () => {
    expect(inWindow("2026-08-01T00:00:00.000Z", from, to)).toBe(true);
  });

  it("excludes the upper bound so adjacent windows never double-count", () => {
    expect(inWindow("2026-08-08T00:00:00.000Z", from, to)).toBe(false);
  });

  it("excludes an instant before the window", () => {
    expect(inWindow("2026-07-31T23:59:59.000Z", from, to)).toBe(false);
  });

  it("returns false for an unparseable timestamp rather than throwing", () => {
    expect(inWindow("not a date", from, to)).toBe(false);
  });
});
