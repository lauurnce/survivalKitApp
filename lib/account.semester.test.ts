import { describe, expect, it } from "vitest";
import type { SubjectSummary } from "./account";

describe("SubjectSummary", () => {
  it("carries semester and kind", () => {
    const s: SubjectSummary = {
      id: "a", title: "T", yearId: "y", unlocked: true,
      doneCount: 0, totalCount: 1, modules: [], semester: 1, kind: "major",
    };
    expect(s.semester).toBe(1);
  });
});
