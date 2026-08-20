import { describe, it, expect } from "vitest";
import { canonicalProgram, canonicalUniversity } from "./academicPrograms";

describe("canonicalProgram", () => {
  it("collapses the four observed BSIT spellings to one label", () => {
    const variants = [
      "BS Information Technology",
      "BS INFORMATION TECHNOLOGY",
      "BSIT",
      "BS Information technology",
    ];
    const canon = variants.map(canonicalProgram);
    expect(new Set(canon).size).toBe(1);
    expect(canon[0]).toBe("BS Information Technology");
  });

  it("returns an unrecognised program trimmed rather than dropping it", () => {
    expect(canonicalProgram("  BS Marine Biology  ")).toBe("BS Marine Biology");
  });

  it("treats blank input as Not specified", () => {
    expect(canonicalProgram("   ")).toBe("Not specified");
  });
});

describe("canonicalUniversity", () => {
  it("collapses a known alias to the canonical name", () => {
    expect(canonicalUniversity("PUP")).toBe("Polytechnic University of the Philippines");
  });

  it("returns an unknown university trimmed rather than dropping it", () => {
    expect(canonicalUniversity("  Some New College  ")).toBe("Some New College");
  });
});
