import { describe, expect, it } from "vitest";
import { subjectShareDescription, subjectShareTitle, yearLabelOf } from "./subjectShare";

describe("subjectShare", () => {
  const cp1 = { title: "Computer Programming 1", yearLabel: "1st Year", moduleCount: 8 };

  it("titles the preview with the subject", () => {
    expect(subjectShareTitle(cp1)).toBe("Computer Programming 1 — BSIT Survival Kit");
  });

  it("says how many lessons, and that the notes are free", () => {
    expect(subjectShareDescription(cp1)).toBe(
      "Computer Programming 1 (1st Year): 8 lessons with free notes, plus reviewers with answer keys.",
    );
    expect(subjectShareDescription({ ...cp1, moduleCount: 1 })).toContain("1 lesson with");
  });

  it("drops the lesson count and year when unknown", () => {
    expect(subjectShareDescription({ title: "OS", yearLabel: null, moduleCount: 0 })).toBe(
      "OS: free notes and reviewers with answer keys.",
    );
  });

  it("reads the year label from an object or a one-element array", () => {
    expect(yearLabelOf({ label: "2nd Year" })).toBe("2nd Year");
    expect(yearLabelOf([{ label: "3rd Year" }])).toBe("3rd Year");
    expect(yearLabelOf(null)).toBeNull();
  });
});
