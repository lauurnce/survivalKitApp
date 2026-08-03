import { describe, it, expect } from "vitest";
import {
  compareSeverity,
  isEscalation,
  validateFinding,
  SEVERITY_ORDER,
  type Finding,
} from "./severity";

describe("SEVERITY_ORDER", () => {
  it("ranks most urgent first and ACCEPTED last", () => {
    expect(SEVERITY_ORDER).toEqual(["P0", "P1", "P2", "P3", "ACCEPTED"]);
  });
});

describe("compareSeverity", () => {
  it("sorts P0 ahead of everything", () => {
    expect(compareSeverity("P0", "P1")).toBeLessThan(0);
    expect(compareSeverity("P0", "ACCEPTED")).toBeLessThan(0);
  });

  it("sorts ACCEPTED behind everything", () => {
    expect(compareSeverity("ACCEPTED", "P3")).toBeGreaterThan(0);
  });

  it("returns 0 for equal severities", () => {
    expect(compareSeverity("P2", "P2")).toBe(0);
  });

  it("sorts a findings array most-severe-first", () => {
    const order = (["P3", "P0", "ACCEPTED", "P1"] as const)
      .slice()
      .sort(compareSeverity);
    expect(order).toEqual(["P0", "P1", "P3", "ACCEPTED"]);
  });
});

describe("isEscalation", () => {
  it("is true only for P0 and P1", () => {
    expect(isEscalation("P0")).toBe(true);
    expect(isEscalation("P1")).toBe(true);
    expect(isEscalation("P2")).toBe(false);
    expect(isEscalation("P3")).toBe(false);
    expect(isEscalation("ACCEPTED")).toBe(false);
  });
});

describe("validateFinding", () => {
  const base: Finding = {
    id: "cache-miss-for-blocks",
    title: "/for-blocks cache flipped HIT to MISS",
    severity: "P1",
    state: "NEW",
  };

  it("accepts a well-formed finding", () => {
    expect(validateFinding(base)).toEqual([]);
  });

  it("rejects an empty id", () => {
    expect(validateFinding({ ...base, id: "" })).toContain("id is required");
  });

  it("rejects an id that is not a stable slug", () => {
    expect(validateFinding({ ...base, id: "Cache Miss!" })).toContain(
      "id must be a lowercase slug: a-z, 0-9 and hyphens only"
    );
  });

  it("rejects an empty title", () => {
    expect(validateFinding({ ...base, title: "  " })).toContain("title is required");
  });

  it("requires a reason and a reopen trigger on ACCEPTED findings", () => {
    const errors = validateFinding({ ...base, severity: "ACCEPTED" });
    expect(errors).toContain("ACCEPTED findings require acceptedReason");
    expect(errors).toContain("ACCEPTED findings require reopenTrigger");
  });

  it("accepts an ACCEPTED finding that carries both fields", () => {
    const errors = validateFinding({
      ...base,
      severity: "ACCEPTED",
      acceptedReason: "Single region is fine at current traffic",
      reopenTrigger: "PH latency exceeds 800ms",
    });
    expect(errors).toEqual([]);
  });

  it("rejects acceptance fields on a non-ACCEPTED finding", () => {
    const errors = validateFinding({ ...base, reopenTrigger: "never" });
    expect(errors).toContain("reopenTrigger is only valid on ACCEPTED findings");
  });
});
