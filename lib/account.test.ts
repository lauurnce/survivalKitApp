import { describe, it, expect } from "vitest";
import { completionPercentage, isUnlockedBy, type ActiveSub } from "./account";

const NOW = new Date().toISOString();

function mkSub(s: Omit<ActiveSub, "created_at">): ActiveSub {
  return { ...s, created_at: NOW };
}

describe("completionPercentage", () => {
  it("is 0 when total is 0", () => expect(completionPercentage(0, 0)).toBe(0));
  it("rounds to nearest integer percent", () => expect(completionPercentage(2, 3)).toBe(67));
  it("caps at 100", () => expect(completionPercentage(5, 4)).toBe(100));
});

describe("isUnlockedBy", () => {
  const YEAR = "year-1", OTHER_YEAR = "year-2";
  const SUBJ = "subj-1", OTHER_SUBJ = "subj-2";

  it("is false with no subscriptions", () => {
    expect(isUnlockedBy([], YEAR, SUBJ)).toBe(false);
  });

  it("year-level plan (subject_id null) unlocks any subject in that year", () => {
    const subs = [mkSub({ year_id: YEAR, subject_id: null })];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(true);
  });

  it("year-level plan does not unlock a different year", () => {
    const subs = [mkSub({ year_id: YEAR, subject_id: null })];
    expect(isUnlockedBy(subs, OTHER_YEAR, SUBJ)).toBe(false);
  });

  it("subject-level plan unlocks only its own subject", () => {
    const subs = [mkSub({ year_id: YEAR, subject_id: SUBJ })];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(false);
  });

  it("matches the right plan among several", () => {
    const subs = [
      mkSub({ year_id: OTHER_YEAR, subject_id: null }),
      mkSub({ year_id: YEAR, subject_id: OTHER_SUBJ }),
    ];
    expect(isUnlockedBy(subs, YEAR, SUBJ)).toBe(false);
    expect(isUnlockedBy(subs, YEAR, OTHER_SUBJ)).toBe(true);
    expect(isUnlockedBy(subs, OTHER_YEAR, SUBJ)).toBe(true);
  });
});
