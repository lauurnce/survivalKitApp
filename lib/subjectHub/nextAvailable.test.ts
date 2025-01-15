import { describe, it, expect } from "vitest";
import { pickNextAvailableSubject } from "./nextAvailable";

const subjects = [
  { id: "dsa", title: "Data Structures and Algorithms", sort_order: 1, semester: 1 },
  { id: "dcn", title: "Data Communications and Networking", sort_order: 2, semester: 1 },
  { id: "empty", title: "Empty Subject", sort_order: 3, semester: 1 },
  { id: "oop", title: "Object-Oriented Programming", sort_order: 4, semester: 2 },
];

const modules = [
  { id: "dsa-1", title: "Introduction to Data Structures", sort_order: 1, subject_id: "dsa" },
  { id: "dcn-exam", title: "Exam Prep: Prelims & Finals", sort_order: 2, subject_id: "dcn" },
  { id: "dcn-1", title: "Networking Today", sort_order: 1, subject_id: "dcn" },
  { id: "oop-1", title: "Classes", sort_order: 1, subject_id: "oop" },
];

describe("pickNextAvailableSubject", () => {
  it("prefers the nearest same-semester subject that has a lesson", () => {
    const next = pickNextAvailableSubject("empty", subjects, modules);
    expect(next?.subject.id).toBe("dcn");
    expect(next?.module.id).toBe("dcn-1");
  });

  it("prefers the same semester over a nearer subject in the other semester", () => {
    const next = pickNextAvailableSubject("empty", subjects, modules.filter((m) => m.subject_id !== "dcn"));
    expect(next?.subject.id).toBe("dsa");
  });

  it("falls back to another semester when the current one has nothing", () => {
    const next = pickNextAvailableSubject("empty", subjects, modules.filter((m) => m.subject_id === "oop"));
    expect(next).toEqual({ subject: subjects[3], module: modules[3] });
  });

  it("never points back at the current subject", () => {
    const next = pickNextAvailableSubject("dsa", subjects, modules.filter((m) => m.subject_id === "dsa"));
    expect(next).toBeNull();
  });

  it("still picks something when the current subject is not in the list", () => {
    expect(pickNextAvailableSubject("ghost", subjects, modules)?.subject.id).toBe("dsa");
  });

  it("is null for a year with no lessons at all", () => {
    expect(pickNextAvailableSubject("empty", subjects, [])).toBeNull();
  });
});
