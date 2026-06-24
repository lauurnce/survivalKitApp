import { describe, it, expect } from "vitest";
import { pct } from "./account";

describe("pct", () => {
  it("is 0 when total is 0", () => expect(pct(0, 0)).toBe(0));
  it("rounds to nearest integer percent", () => expect(pct(2, 3)).toBe(67));
  it("caps at 100", () => expect(pct(5, 4)).toBe(100));
});
