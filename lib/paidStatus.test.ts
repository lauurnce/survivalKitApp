import { describe, it, expect } from "vitest";
import { formatAccessDate, paidStatusLine } from "./paidStatus";

describe("formatAccessDate", () => {
  it("formats on the Manila calendar", () => {
    // Midnight Dec 1 in Manila is still Nov 30 in UTC.
    expect(formatAccessDate("2026-11-30T16:00:00.000Z")).toBe("Dec 1, 2026");
    expect(formatAccessDate("2026-12-01T00:00:00+00:00")).toBe("Dec 1, 2026");
  });

  it("returns null for garbage", () => {
    expect(formatAccessDate("not a date")).toBeNull();
  });
});

describe("paidStatusLine", () => {
  const names = { subjectTitle: "Computer Programming 1", yearLabel: "1st Year" };

  it("describes a subject plan with its end date", () => {
    expect(paidStatusLine({ scope: "subject", until: "2026-12-01T00:00:00Z" }, names)).toBe(
      "Unlocked · Computer Programming 1 · access until Dec 1, 2026",
    );
  });

  it("describes a year pass by the year's label", () => {
    expect(paidStatusLine({ scope: "year", until: "2027-01-31T00:00:00Z" }, names)).toBe(
      "1st Year pass · until Jan 31, 2027",
    );
  });

  it("describes a class grant", () => {
    expect(paidStatusLine({ scope: "class", until: "2026-12-15T00:00:00Z" }, names)).toBe(
      "Unlocked via your class · Computer Programming 1 · until Dec 15, 2026",
    );
  });

  it("drops the date when the grant has none", () => {
    expect(paidStatusLine({ scope: "subject", until: null }, names)).toBe("Unlocked · Computer Programming 1");
    expect(paidStatusLine({ scope: "year", until: null }, {})).toBe("Year pass");
  });
});
