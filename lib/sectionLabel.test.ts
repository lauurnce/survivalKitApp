import { describe, expect, it } from "vitest";
import { sectionLabel } from "./sectionLabel";

describe("sectionLabel", () => {
  it("zero-pads single digits", () => {
    expect(sectionLabel(1)).toBe("§ 01");
    expect(sectionLabel(9)).toBe("§ 09");
  });

  it("does not double-pad two-digit numbers", () => {
    expect(sectionLabel(10)).toBe("§ 10");
    expect(sectionLabel(42)).toBe("§ 42");
  });

  it("falls back to a dash when the number is missing", () => {
    expect(sectionLabel(null)).toBe("§ —");
    expect(sectionLabel(undefined)).toBe("§ —");
    expect(sectionLabel(NaN)).toBe("§ —");
  });
});
