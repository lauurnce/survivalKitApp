import { describe, it, expect } from "vitest";
import { truncateOutput } from "./format";

describe("truncateOutput", () => {
  it("returns short output unchanged", () => {
    expect(truncateOutput("hello", 100)).toEqual({ text: "hello", truncated: false });
  });

  it("truncates output longer than the cap and flags it", () => {
    const big = "x".repeat(50);
    const out = truncateOutput(big, 10);
    expect(out.truncated).toBe(true);
    expect(out.text.startsWith("xxxxxxxxxx")).toBe(true);
    expect(out.text).toContain("output truncated");
  });

  it("treats empty string as not truncated", () => {
    expect(truncateOutput("", 10)).toEqual({ text: "", truncated: false });
  });
});
