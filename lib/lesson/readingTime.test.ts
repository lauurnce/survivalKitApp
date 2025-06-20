import { describe, it, expect } from "vitest";
import { estimateReadingMinutes, readingSeconds } from "./readingTime";

describe("readingSeconds", () => {
  it("reads prose at 200 words per minute", () => {
    const body = Array.from({ length: 200 }, () => "word").join(" ");
    expect(readingSeconds(body)).toBeCloseTo(60);
  });

  it("charges code by non-blank line, not by word", () => {
    const body = "```c\nint main(void) {\n\n  return 0;\n}\n```";
    expect(readingSeconds(body)).toBe(3 * 4);
  });

  it("does not count markdown syntax as words", () => {
    expect(readingSeconds("| --- | --- |\n### ** **")).toBe(0);
  });
});

describe("estimateReadingMinutes", () => {
  it("sums sections and rounds to whole minutes", () => {
    const words = (n: number) => Array.from({ length: n }, () => "w").join(" ");
    expect(
      estimateReadingMinutes([
        { kind: "content", body_md: words(500) },
        { kind: "content", body_md: words(500) },
      ])
    ).toBe(5);
  });

  it("never reports less than a minute", () => {
    expect(estimateReadingMinutes([])).toBe(1);
    expect(estimateReadingMinutes([{ kind: "content", body_md: "Hi" }])).toBe(1);
  });

  it("tolerates a missing body", () => {
    expect(estimateReadingMinutes([{ kind: "activity", body_md: undefined as unknown as string }])).toBe(1);
  });
});
