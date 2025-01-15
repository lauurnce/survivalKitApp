import { describe, it, expect } from "vitest";
import { freeSampleLine, summarizeSubject, summaryParts } from "./summary";

// Shapes taken from production on 2026-10-31.
const cp2Modules = [
  { id: "u1", title: "Unit 1: Arrays", sort_order: 1 },
  { id: "exam", title: "Exam Prep: Prelims & Finals", sort_order: 2 },
];
const cp2Activities = [
  ...["a1", "a2", "a3", "a4"].map((id) => ({ id, module_id: "u1" })),
  ...["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"].map((id) => ({ id, module_id: "exam" })),
];

describe("summarizeSubject", () => {
  it("counts lessons apart from exam prep and names the free module", () => {
    const s = summarizeSubject(cp2Modules, cp2Activities);
    expect(s).toEqual({
      lessonCount: 1,
      examPrepCount: 1,
      reviewerCount: 12,
      freeModule: { id: "u1", title: "Unit 1: Arrays", reviewerCount: 4 },
      allFree: false,
      emptyModuleIds: [],
    });
  });

  it("takes the free module by sort_order, not array order", () => {
    const s = summarizeSubject([...cp2Modules].reverse(), cp2Activities);
    expect(s.freeModule?.id).toBe("u1");
  });

  it("skips a first module with no reviewers when picking the free one", () => {
    const s = summarizeSubject(
      [
        { id: "m1", title: "Intro", sort_order: 1 },
        { id: "m2", title: "Stacks", sort_order: 2 },
      ],
      [{ id: "a1", module_id: "m2" }],
    );
    expect(s.freeModule).toEqual({ id: "m2", title: "Stacks", reviewerCount: 1 });
    expect(s.allFree).toBe(true);
  });

  it("leaves empty modules out of the lesson count and reports them", () => {
    const s = summarizeSubject(cp2Modules, cp2Activities, { u1: 0, exam: 2 });
    expect(s.lessonCount).toBe(0);
    expect(s.emptyModuleIds).toEqual(["u1"]);
  });

  it("ignores activity rows from other subjects' modules", () => {
    const s = summarizeSubject(cp2Modules, [...cp2Activities, { id: "x", module_id: "elsewhere" }]);
    expect(s.reviewerCount).toBe(12);
  });

  it("has no free module when the subject has no reviewers", () => {
    const s = summarizeSubject(cp2Modules, []);
    expect(s.freeModule).toBeNull();
    expect(s.allFree).toBe(false);
  });
});

describe("summaryParts", () => {
  it("prints lessons, reviewers and exam prep", () => {
    expect(summaryParts(summarizeSubject(cp2Modules, cp2Activities))).toEqual([
      "1 lesson",
      "12 reviewers",
      "exam prep included",
    ]);
  });

  it("drops zero counts instead of printing them", () => {
    expect(summaryParts(summarizeSubject([{ id: "m1", title: "Intro", sort_order: 1 }], []))).toEqual([
      "1 lesson",
    ]);
  });
});

describe("freeSampleLine", () => {
  it("names the free module and its reviewer count", () => {
    expect(freeSampleLine(summarizeSubject(cp2Modules, cp2Activities))).toBe(
      "Every lesson is free to read. The 4 reviewers in Unit 1: Arrays are free too.",
    );
  });

  it("uses the singular for one free reviewer", () => {
    const s = summarizeSubject(
      [
        { id: "m1", title: "Introduction to Data Structures", sort_order: 1 },
        { id: "m2", title: "Stacks", sort_order: 2 },
      ],
      [
        { id: "a1", module_id: "m1" },
        { id: "a2", module_id: "m2" },
      ],
    );
    expect(freeSampleLine(s)).toBe(
      "Every lesson is free to read. The 1 reviewer in Introduction to Data Structures is free too.",
    );
  });

  it("says everything is free when the sample is every reviewer", () => {
    const s = summarizeSubject(
      [{ id: "m1", title: "Module 1", sort_order: 1 }],
      [{ id: "a1", module_id: "m1" }],
    );
    expect(freeSampleLine(s)).toBe("Every lesson and reviewer here is free.");
  });

  it("is null when there are no reviewers", () => {
    expect(freeSampleLine(summarizeSubject(cp2Modules, []))).toBeNull();
  });
});
