import { describe, expect, it } from "vitest";
import { sumReadsBySubject } from "./countersSum";

describe("sumReadsBySubject", () => {
  it("sums module reads per subject, so a subject never trails its own lesson", () => {
    const totals = sumReadsBySubject(
      new Map([
        ["cp1", ["l1", "l2", "l3"]],
        ["os", ["m1"]],
      ]),
      [
        { resource_id: "l1", read_count: 6420 },
        { resource_id: "l2", read_count: 2000 },
        { resource_id: "l3", read_count: 1647 },
        { resource_id: "m1", read_count: 97 },
      ],
    );
    expect(totals.get("cp1")).toBe(10067);
    expect(totals.get("cp1")).toBeGreaterThanOrEqual(6420);
    expect(totals.get("os")).toBe(97);
  });

  it("counts a module with no counter row as zero", () => {
    const totals = sumReadsBySubject(new Map([["s", ["a", "b"]]]), [{ resource_id: "a", read_count: 5 }]);
    expect(totals.get("s")).toBe(5);
  });

  it("gives a subject with no modules zero, and ignores counters for other modules", () => {
    const totals = sumReadsBySubject(new Map([["empty", []]]), [{ resource_id: "x", read_count: 9 }]);
    expect(totals.get("empty")).toBe(0);
  });
});
