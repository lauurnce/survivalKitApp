import { describe, it, expect } from "vitest";
import { manilaHour, greetingFor, formatManilaDate } from "./manilaTime";

describe("manilaHour", () => {
  it("reads the hour on the Manila clock, not the runtime's", () => {
    // 04:30 UTC is 12:30 in Manila.
    expect(manilaHour(new Date("2026-10-31T04:30:00Z"))).toBe(12);
    // 16:00 UTC is midnight in Manila (h23, not 24).
    expect(manilaHour(new Date("2026-10-31T16:00:00Z"))).toBe(0);
  });
});

describe("greetingFor", () => {
  it("says good afternoon at 12:00-17:59 Manila even though UTC is still morning", () => {
    expect(greetingFor(new Date("2026-10-31T04:00:00Z"))).toBe("Good afternoon"); // 12:00 PHT
    expect(greetingFor(new Date("2026-10-31T07:59:00Z"))).toBe("Good afternoon"); // 15:59 PHT
  });

  it("says good evening from 18:00 Manila", () => {
    expect(greetingFor(new Date("2026-10-31T10:00:00Z"))).toBe("Good evening"); // 18:00 PHT
    expect(greetingFor(new Date("2026-10-31T11:59:00Z"))).toBe("Good evening"); // 19:59 PHT
  });

  it("says good morning from Manila midnight to 11:59", () => {
    expect(greetingFor(new Date("2026-10-30T16:00:00Z"))).toBe("Good morning"); // 00:00 PHT
    expect(greetingFor(new Date("2026-10-31T03:59:00Z"))).toBe("Good morning"); // 11:59 PHT
  });
});

describe("formatManilaDate", () => {
  it("uses the Manila calendar day, so an early-morning PH timestamp isn't a day early", () => {
    // 2026-11-30 23:30 UTC is Dec 1, 07:30 in Manila.
    expect(formatManilaDate("2026-11-30T23:30:00Z")).toBe("December 1, 2026");
  });

  it("supports the short month style", () => {
    expect(formatManilaDate("2026-11-30T23:30:00Z", "short")).toBe("Dec 1, 2026");
  });

  it("supports a date-and-time style so a request from yesterday doesn't read as today", () => {
    expect(formatManilaDate("2026-11-30T23:30:00Z", "dateTime")).toBe("Dec 1, 2026, 7:30 AM");
  });

  it("returns null for an unparseable value", () => {
    expect(formatManilaDate("not a date")).toBeNull();
  });
});
