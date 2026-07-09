import { describe, it, expect } from "vitest";
import { isUuid } from "./validation";

describe("isUuid", () => {
  it("accepts a well-formed lowercase UUID", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("accepts a well-formed uppercase UUID", () => {
    expect(isUuid("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects a string with the wrong length", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-44665544000")).toBe(false);
  });

  it("rejects a string missing dashes", () => {
    expect(isUuid("550e8400e29b41d4a716446655440000")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isUuid("")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isUuid(null)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(123)).toBe(false);
    expect(isUuid({})).toBe(false);
  });
});
