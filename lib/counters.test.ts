import { describe, it, expect } from "vitest";
import { formatCount } from "./counters";

describe("formatCount", () => {
  it("returns the number as-is under 1000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1)).toBe("1");
    expect(formatCount(847)).toBe("847");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with k suffix, strips trailing zero", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(10000)).toBe("10k");
    expect(formatCount(100000)).toBe("100k");
  });

  it("formats millions with M suffix, strips trailing zero", () => {
    expect(formatCount(1000000)).toBe("1M");
    expect(formatCount(1500000)).toBe("1.5M");
    expect(formatCount(2300000)).toBe("2.3M");
  });
});
