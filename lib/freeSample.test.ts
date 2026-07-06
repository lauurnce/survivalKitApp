import { describe, it, expect } from "vitest";
import { pickFirstActivity } from "./freeSample";

describe("pickFirstActivity", () => {
  const sections = [
    { id: "s-late", module_id: "m2", sort_order: 1 },
    { id: "s-first", module_id: "m1", sort_order: 3 },
    { id: "s-second", module_id: "m1", sort_order: 7 },
  ];

  it("picks the lowest sort_order section of the earliest module that has activities", () => {
    expect(pickFirstActivity(["m1", "m2"], sections)).toBe("s-first");
  });

  it("skips earlier modules with no activity sections", () => {
    expect(pickFirstActivity(["m0", "m1", "m2"], sections)).toBe("s-first");
  });

  it("respects module order over section sort_order", () => {
    expect(pickFirstActivity(["m2", "m1"], sections)).toBe("s-late");
  });

  it("returns null when the subject has no activities", () => {
    expect(pickFirstActivity(["m1"], [])).toBeNull();
    expect(pickFirstActivity([], sections)).toBeNull();
  });
});
