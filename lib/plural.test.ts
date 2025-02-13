import { describe, expect, it } from "vitest";
import { pluralize } from "./plural";

describe("pluralize", () => {
  it("uses the singular for exactly one", () => {
    expect(pluralize(1, "read")).toBe("read");
    expect(pluralize(1, "reader")).toBe("reader");
  });

  it("uses the plural for zero, many and thousands", () => {
    expect(pluralize(0, "read")).toBe("reads");
    expect(pluralize(2, "read")).toBe("reads");
    expect(pluralize(1000, "read")).toBe("reads");
  });

  it("accepts an irregular plural", () => {
    expect(pluralize(1, "child", "children")).toBe("child");
    expect(pluralize(3, "child", "children")).toBe("children");
  });
});
