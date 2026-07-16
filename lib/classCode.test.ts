import { describe, it, expect } from "vitest";
import { generateClassCode, isValidClassCodeShape, CODE_ALPHABET } from "./classCode";

describe("generateClassCode", () => {
  it("produces a 6-character code using only alphabet characters", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateClassCode();
      expect(code).toHaveLength(6);
      expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
    }
  });
});

describe("isValidClassCodeShape", () => {
  it("accepts a valid 6-char alphabet code, case-insensitively", () => {
    expect(isValidClassCodeShape("ABC234")).toBe(true);
    expect(isValidClassCodeShape("abc234")).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidClassCodeShape("AB")).toBe(false);
    expect(isValidClassCodeShape("ABC2345")).toBe(false);
  });

  it("rejects SQL wildcard characters even at length 6", () => {
    expect(isValidClassCodeShape("%%%%%%")).toBe(false);
    expect(isValidClassCodeShape("AB__EF")).toBe(false);
  });

  it("rejects excluded ambiguous characters (0, O, 1, I, L)", () => {
    expect(isValidClassCodeShape("ABC0EF")).toBe(false);
    expect(isValidClassCodeShape("ABCOEF")).toBe(false);
    expect(isValidClassCodeShape("ABC1EF")).toBe(false);
    expect(isValidClassCodeShape("ABCIEF")).toBe(false);
    expect(isValidClassCodeShape("ABCLEF")).toBe(false);
  });
});
