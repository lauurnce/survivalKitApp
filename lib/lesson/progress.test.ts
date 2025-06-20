import { describe, it, expect } from "vitest";
import { lessonFraction, newMilestones, minutesLeft, scrollYForFraction, type Milestone } from "./progress";

const base = { viewportHeight: 800, top: 1000, height: 4000 };

describe("lessonFraction", () => {
  it("is 0 before the body reaches the bottom of the viewport", () => {
    expect(lessonFraction({ ...base, scrollY: 0 })).toBe(0);
  });

  it("measures by the viewport's bottom edge", () => {
    expect(lessonFraction({ ...base, scrollY: 2200 })).toBe(0.5);
  });

  it("clamps to 1 past the end", () => {
    expect(lessonFraction({ ...base, scrollY: 99999 })).toBe(1);
  });

  it("treats an unmeasured body as not started", () => {
    expect(lessonFraction({ ...base, height: 0, scrollY: 500 })).toBe(0);
  });
});

describe("newMilestones", () => {
  it("reports each milestone once", () => {
    const reached = new Set<Milestone>();
    expect(newMilestones(0.3, reached)).toEqual([]);
    expect(newMilestones(0.55, reached)).toEqual(["halfway"]);
    reached.add("halfway");
    expect(newMilestones(0.6, reached)).toEqual([]);
  });

  it("reports both when a jump skips straight to the end", () => {
    expect(newMilestones(1, new Set())).toEqual(["halfway", "end"]);
  });
});

describe("minutesLeft", () => {
  it("rounds up and bottoms out at a minute until the end", () => {
    expect(minutesLeft(6, 0)).toBe(6);
    expect(minutesLeft(6, 0.5)).toBe(3);
    expect(minutesLeft(6, 0.95)).toBe(1);
  });

  it("is 0 at the end", () => {
    expect(minutesLeft(6, 0.98)).toBe(0);
  });
});

describe("scrollYForFraction", () => {
  it("inverts lessonFraction", () => {
    const y = scrollYForFraction(0.5, base);
    expect(lessonFraction({ ...base, scrollY: y })).toBe(0.5);
  });

  it("never scrolls above the top", () => {
    expect(scrollYForFraction(0, { ...base, top: 0 })).toBe(0);
  });
});
