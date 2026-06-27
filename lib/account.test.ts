import { describe, it, expect } from "vitest";
import { pct, isUnlockedBy } from "./account";

describe("pct", () => {
  it("is 0 when total is 0", () => expect(pct(0, 0)).toBe(0));
  it("rounds to nearest integer percent", () => expect(pct(2, 3)).toBe(67));
  it("caps at 100", () => expect(pct(5, 4)).toBe(100));
});

describe("isUnlockedBy", () => {
  const YEAR = "year-1", OTHER_YEAR = "year-2";
  const SUBJ = "subj-1", OTHER_SUBJ = "subj-2";

  it("is false with no subscriptions", () => {
    expect(isUnlockedBy([], YEAR, SUBJ)).toBe(false);
  });

  it("year-level plan (subject_id null) unlocks any subject in that year", () => {
    const subs = [{ year_id: YEAR, subject_id: null }];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(true);
  });

  it("year-level plan does not unlock a different year", () => {
    const subs = [{ year_id: YEAR, subject_id: null }];
    expect(isUnlockedBy(subs, OTHER_YEAR, SUBJ)).toBe(false);
  });

  it("subject-level plan unlocks only its own subject", () => {
    const subs = [{ year_id: YEAR, subject_id: SUBJ }];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(false);
  });

  it("matches the right plan among several", () => {
    const subs = [
      { year_id: OTHER_YEAR, subject_id: null },
      { year_id: YEAR, subject_id: OTHER_SUBJ },
    ];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(false);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, OTHER_YEAR, SUBJ)).toBe(true);
  });
});
