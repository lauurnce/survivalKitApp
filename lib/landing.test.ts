import { describe, it, expect, vi, beforeEach } from "vitest";

let years: Array<{ id: string; sort_order: number }>;
let subjects: Array<{ id: string; title: string; slug: string }>;
let modules: Array<{ id: string; title: string; sort_order: number }>;
let fail = false;

vi.mock("@/lib/cache/queries", () => ({
  getYears: () => (fail ? Promise.reject(new Error("db down")) : Promise.resolve(years)),
  getSubjectsByYear: (yearId: string) =>
    Promise.resolve(yearId === "y1" ? subjects : []),
  getModulesBySubject: (subjectId: string) =>
    Promise.resolve(subjectId === "cp1" ? modules : []),
}));

import { getCp1StartPath } from "./landing";

beforeEach(() => {
  fail = false;
  years = [
    { id: "y2", sort_order: 2 },
    { id: "y1", sort_order: 1 },
  ];
  subjects = [
    { id: "itc", title: "Introduction to Computing", slug: "introduction-to-computing" },
    { id: "cp1", title: "Computer Programming 1", slug: "computer-programming-1" },
  ];
  modules = [
    { id: "l2", title: "Lesson 2: Introduction to C", sort_order: 2 },
    { id: "l1", title: "Lesson 1: Programming Concepts", sort_order: 1 },
  ];
});

describe("getCp1StartPath", () => {
  it("points at CP1's first lesson in the first year", async () => {
    expect(await getCp1StartPath()).toEqual({
      href: "/year/y1/subjects/cp1/modules/l1",
      subjectTitle: "Computer Programming 1",
      moduleTitle: "Lesson 1: Programming Concepts",
    });
  });

  it("returns null when CP1 is not in the first year", async () => {
    subjects = subjects.filter((s) => s.id !== "cp1");
    expect(await getCp1StartPath()).toBeNull();
  });

  it("returns null when CP1 has no modules yet", async () => {
    modules = [];
    expect(await getCp1StartPath()).toBeNull();
  });

  it("returns null instead of throwing when the lookup fails", async () => {
    fail = true;
    expect(await getCp1StartPath()).toBeNull();
  });
});
