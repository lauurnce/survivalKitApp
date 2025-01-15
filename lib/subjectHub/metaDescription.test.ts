import { describe, it, expect } from "vitest";
import { subjectMetaDescription } from "./metaDescription";
import type { SubjectSummary } from "./summary";

const dcn: SubjectSummary = {
  lessonCount: 16,
  examPrepCount: 0,
  reviewerCount: 52,
  freeModule: { id: "m1", title: "Networking Today", reviewerCount: 2 },
  allFree: false,
  emptyModuleIds: [],
};

describe("subjectMetaDescription", () => {
  it("leads with the counts and the free promise", () => {
    expect(subjectMetaDescription("Data Communications and Networking", "2nd Year", dcn)).toBe(
      "Data Communications and Networking (2nd Year): 16 lessons, 52 reviewers. Every lesson is free to read.",
    );
  });

  it("mentions exam prep and drops a missing year", () => {
    expect(
      subjectMetaDescription("Computer Programming 2", null, { ...dcn, lessonCount: 1, reviewerCount: 12, examPrepCount: 1 }),
    ).toBe("Computer Programming 2: 1 lesson, 12 reviewers, exam prep included. Every lesson is free to read.");
  });

  it("does not promise free lessons when there are none", () => {
    expect(
      subjectMetaDescription("X", "1st Year", { ...dcn, lessonCount: 0, reviewerCount: 8, examPrepCount: 1 }),
    ).toBe("X (1st Year): 8 reviewers, exam prep included.");
  });

  it("falls back to the old wording for an empty subject", () => {
    expect(
      subjectMetaDescription("Capstone", "4th Year", { ...dcn, lessonCount: 0, reviewerCount: 0, freeModule: null }),
    ).toBe("Modules and reviewers for Capstone (4th Year).");
  });
});
