import { describe, it, expect } from "vitest";
import { AVERAGE_RATING, RATING_SCALE, UNIVERSITY_FLOOR, socialProofLine } from "./socialProof";

describe("socialProofLine", () => {
  it("states the rating and the university reach", () => {
    expect(socialProofLine()).toBe("Students rate it 4.7/5 · Used at 8+ universities");
  });

  it("keeps the rating inside its scale", () => {
    expect(AVERAGE_RATING).toBeGreaterThan(0);
    expect(AVERAGE_RATING).toBeLessThanOrEqual(RATING_SCALE);
  });

  it("never shows a buyer or payment count", () => {
    expect(socialProofLine()).not.toMatch(/buy|bought|paid|purchase|unlock/i);
  });

  it("only uses whole-number floors for reach", () => {
    expect(Number.isInteger(UNIVERSITY_FLOOR)).toBe(true);
  });
});
