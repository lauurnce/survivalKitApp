import { describe, it, expect } from "vitest";
import { timingSafeEqualStrings } from "./timingSafeEqualStrings";

describe("timingSafeEqualStrings", () => {
  it("is true for identical strings", () => {
    expect(timingSafeEqualStrings("Bearer abc123", "Bearer abc123")).toBe(true);
  });

  it("is false for a different string of the same length", () => {
    expect(timingSafeEqualStrings("Bearer abc123", "Bearer abc124")).toBe(false);
  });

  it("is false, without throwing, for strings of different lengths", () => {
    expect(timingSafeEqualStrings("Bearer abc", "Bearer abc123")).toBe(false);
    expect(timingSafeEqualStrings("Bearer abc123", "Bearer abc")).toBe(false);
  });

  it("compares multi-byte characters by content", () => {
    expect(timingSafeEqualStrings("ñandú", "ñandú")).toBe(true);
    expect(timingSafeEqualStrings("ñandú", "nandu")).toBe(false);
  });

  it.each([
    [null, "x"],
    ["x", null],
    [undefined, "x"],
    ["x", undefined],
    ["", ""],
    ["", "x"],
  ])("fails closed for a missing or empty side (%s, %s)", (a, b) => {
    expect(timingSafeEqualStrings(a, b)).toBe(false);
  });

  it("fails closed for the unset-secret bearer shape", () => {
    // `Bearer ${undefined}` is a real string; the caller must still check the
    // secret is set. The helper alone rejects only a missing header.
    expect(timingSafeEqualStrings(null, "Bearer undefined")).toBe(false);
  });
});
