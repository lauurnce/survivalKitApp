import { describe, it, expect } from "vitest";
import { freeIdsInModule, freeSampleIsEverything, pickFreeActivities } from "./freeSample";

describe("pickFreeActivities", () => {
  const sections = [
    { id: "s-late", module_id: "m2", sort_order: 1 },
    { id: "s-second", module_id: "m1", sort_order: 7 },
    { id: "s-first", module_id: "m1", sort_order: 3 },
    { id: "s-third", module_id: "m1", sort_order: 9 },
  ];

  it("frees every activity of the earliest module that has activities, in sort order", () => {
    expect(pickFreeActivities(["m1", "m2"], sections)).toEqual(["s-first", "s-second", "s-third"]);
  });

  it("frees nothing from any later module", () => {
    expect(pickFreeActivities(["m1", "m2"], sections)).not.toContain("s-late");
  });

  it("skips earlier modules with no activity sections", () => {
    expect(pickFreeActivities(["m0", "m1", "m2"], sections)).toEqual(["s-first", "s-second", "s-third"]);
  });

  it("respects module order over section sort_order", () => {
    expect(pickFreeActivities(["m2", "m1"], sections)).toEqual(["s-late"]);
  });

  it("handles a first module with a single activity", () => {
    expect(pickFreeActivities(["m2"], sections)).toEqual(["s-late"]);
  });

  it("returns an empty list when the subject has no activities", () => {
    expect(pickFreeActivities(["m1"], [])).toEqual([]);
    expect(pickFreeActivities([], sections)).toEqual([]);
  });

  it("does not reorder the caller's array", () => {
    const copy = sections.map((s) => s.id);
    pickFreeActivities(["m1"], sections);
    expect(sections.map((s) => s.id)).toEqual(copy);
  });

  // CP1's real shape: Lesson 1 carries practice exercises, worked solutions,
  // and a code lab; Lesson 2 onward stays locked.
  it("frees all three of CP1 Lesson 1's reviewers and none of Lesson 2's", () => {
    const cp1 = [
      { id: "l1-practice", module_id: "lesson-1", sort_order: 4 },
      { id: "l1-solutions", module_id: "lesson-1", sort_order: 5 },
      { id: "l1-lab", module_id: "lesson-1", sort_order: 6 },
      { id: "l2-practice", module_id: "lesson-2", sort_order: 7 },
      { id: "l2-solutions", module_id: "lesson-2", sort_order: 8 },
    ];
    expect(pickFreeActivities(["lesson-1", "lesson-2"], cp1)).toEqual([
      "l1-practice",
      "l1-solutions",
      "l1-lab",
    ]);
  });
});

describe("freeIdsInModule", () => {
  it("keeps only the free ids that are this module's own activities", () => {
    expect(freeIdsInModule(["a", "b", "c"], ["b", "c", "x"])).toEqual(["b", "c"]);
  });

  it("returns nothing for a module past the free sample", () => {
    expect(freeIdsInModule(["l2-practice", "l2-lab"], ["l1-practice", "l1-lab"])).toEqual([]);
  });
});

describe("freeSampleIsEverything", () => {
  // Operating Systems: one module, three reviewers, all of them the free
  // sample. Selling "the rest" sold nothing (QA CT-07).
  it("is true when every reviewer sits in the free-sample module", () => {
    const os = [
      { module_id: "m1" },
      { module_id: "m1" },
      { module_id: "m1" },
    ];
    expect(freeSampleIsEverything(["m1"], os)).toBe(true);
  });

  it("is true when earlier modules have no reviewers and later ones none either", () => {
    expect(freeSampleIsEverything(["u1", "u2", "u6"], [{ module_id: "u6" }])).toBe(true);
  });

  it("is false once any reviewer lives past the free-sample module", () => {
    const acct = [{ module_id: "u6" }, { module_id: "u6" }, { module_id: "u7" }];
    expect(freeSampleIsEverything(["u1", "u6", "u7"], acct)).toBe(false);
  });

  it("is false for a subject with no reviewers at all, which has nothing to sample", () => {
    expect(freeSampleIsEverything(["m1"], [])).toBe(false);
  });
});
