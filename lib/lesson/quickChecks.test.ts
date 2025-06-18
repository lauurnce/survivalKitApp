import { describe, it, expect } from "vitest";
import { QUICK_CHECKS, quickChecksFor } from "./quickChecks";

describe("quick-check data", () => {
  const entries = Object.entries(QUICK_CHECKS);

  it("covers the eight highest-traction lessons", () => {
    expect(entries).toHaveLength(8);
  });

  it.each(entries)("%s: every question is well-formed", (_moduleId, questions) => {
    expect(questions.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const q of questions) {
      expect(ids.has(q.id), `duplicate id ${q.id}`).toBe(false);
      ids.add(q.id);
      expect(q.prompt.trim()).not.toBe("");
      expect(q.why.trim()).not.toBe("");
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices).size, `duplicate choice in ${q.id}`).toBe(q.choices.length);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.choices.length);
    }
  });

  it("returns an empty list for a lesson without checks", () => {
    expect(quickChecksFor("not-a-module")).toEqual([]);
  });
});
