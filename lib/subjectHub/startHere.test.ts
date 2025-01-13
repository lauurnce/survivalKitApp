import { describe, it, expect } from "vitest";
import { isExamPrep, isOpenable, pickStartModule } from "./startHere";

const cp2 = [
  { id: "exam", title: "Exam Prep: Prelims & Finals", sort_order: 2 },
  { id: "u1", title: "Unit 1: Arrays", sort_order: 1 },
];

const dcn = [
  { id: "m1", title: "Networking Today", sort_order: 1 },
  { id: "m2", title: "Basic Switch and End Device Configuration", sort_order: 2 },
  { id: "m3", title: "Protocols and Models", sort_order: 3 },
];

describe("isExamPrep", () => {
  it("matches the exam prep module titles in production", () => {
    expect(isExamPrep("Exam Prep: Prelims & Finals")).toBe(true);
    expect(isExamPrep("exam prep")).toBe(true);
  });

  it("does not match a lesson that mentions exams later in the title", () => {
    expect(isExamPrep("Lesson 3: Preparing for the exam")).toBe(false);
    expect(isExamPrep("Examples of Protocols")).toBe(false);
  });
});

describe("isOpenable", () => {
  it("treats an unknown count as openable so a failed query hides nothing", () => {
    expect(isOpenable("m1")).toBe(true);
    expect(isOpenable("m1", {})).toBe(true);
  });

  it("rejects a module with zero content sections", () => {
    expect(isOpenable("m1", { m1: 0 })).toBe(false);
    expect(isOpenable("m1", { m1: 3 })).toBe(true);
  });
});

describe("pickStartModule", () => {
  it("starts at the first lesson by sort_order, not array order", () => {
    expect(pickStartModule(cp2)).toEqual({ module: cp2[1], index: 0, reason: "start" });
  });

  it("skips exam prep when a lesson exists", () => {
    const mods = [
      { id: "exam", title: "Exam Prep: Prelims & Finals", sort_order: 0 },
      { id: "l1", title: "Lesson 1", sort_order: 1 },
    ];
    expect(pickStartModule(mods)?.module.id).toBe("l1");
    expect(pickStartModule(mods)?.index).toBe(1);
  });

  it("skips empty modules and points at the next lesson with content", () => {
    const pick = pickStartModule(dcn, { contentCounts: { m1: 0, m2: 8, m3: 8 } });
    expect(pick).toEqual({ module: dcn[1], index: 1, reason: "start" });
  });

  it("falls back to exam prep when it is the only openable module", () => {
    const pick = pickStartModule(cp2, { contentCounts: { u1: 0, exam: 2 } });
    expect(pick).toEqual({ module: cp2[0], index: 1, reason: "start" });
  });

  it("returns null when nothing is openable", () => {
    expect(pickStartModule([])).toBeNull();
    expect(pickStartModule(dcn, { contentCounts: { m1: 0, m2: 0, m3: 0 } })).toBeNull();
  });

  it("continues at the first lesson not yet done", () => {
    const pick = pickStartModule(dcn, { completedIds: new Set(["m1"]) });
    expect(pick).toEqual({ module: dcn[1], index: 1, reason: "continue" });
  });

  it("continues at a skipped earlier lesson before a later one", () => {
    const pick = pickStartModule(dcn, { completedIds: new Set(["m2"]) });
    expect(pick).toEqual({ module: dcn[0], index: 0, reason: "continue" });
  });

  it("sends a student who finished every lesson to exam prep", () => {
    const pick = pickStartModule(cp2, { completedIds: new Set(["u1"]) });
    expect(pick).toEqual({ module: cp2[0], index: 1, reason: "review" });
  });

  it("sends a student who finished everything back to the first lesson when there is no exam prep", () => {
    const pick = pickStartModule(dcn, { completedIds: new Set(["m1", "m2", "m3"]) });
    expect(pick).toEqual({ module: dcn[0], index: 0, reason: "review" });
  });
});
