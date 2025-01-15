import { describe, it, expect, vi, beforeEach } from "vitest";

let result: { data: { module_id: string }[] | null; error: unknown } = { data: [], error: null };
const calls: { method: string; args: unknown[] }[] = [];

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => {
    const builder = {
      from: (...args: unknown[]) => (calls.push({ method: "from", args }), builder),
      select: (...args: unknown[]) => (calls.push({ method: "select", args }), builder),
      eq: (...args: unknown[]) => (calls.push({ method: "eq", args }), builder),
      in: (...args: unknown[]) => (calls.push({ method: "in", args }), Promise.resolve(result)),
    };
    return builder;
  },
}));

import { countByModule, fetchContentSectionCounts } from "./queries";

beforeEach(() => {
  result = { data: [], error: null };
  calls.length = 0;
});

describe("countByModule", () => {
  it("counts rows per module and keeps zero for modules with none", () => {
    expect(countByModule(["m1", "m2"], [{ module_id: "m1" }, { module_id: "m1" }])).toEqual({ m1: 2, m2: 0 });
  });

  it("ignores rows for modules it was not asked about", () => {
    expect(countByModule(["m1"], [{ module_id: "other" }])).toEqual({ m1: 0 });
  });
});

describe("fetchContentSectionCounts", () => {
  it("reads only content sections of the given modules, without bodies", async () => {
    result = { data: [{ module_id: "m1" }], error: null };
    expect(await fetchContentSectionCounts(["m1", "m2"])).toEqual({ m1: 1, m2: 0 });
    expect(calls).toEqual([
      { method: "from", args: ["sections"] },
      { method: "select", args: ["module_id"] },
      { method: "eq", args: ["kind", "content"] },
      { method: "in", args: ["module_id", ["m1", "m2"]] },
    ]);
  });

  it("skips the query for a subject with no modules", async () => {
    expect(await fetchContentSectionCounts([])).toEqual({});
    expect(calls).toEqual([]);
  });

  it("returns null on error so no module is hidden", async () => {
    result = { data: null, error: { message: "boom" } };
    expect(await fetchContentSectionCounts(["m1"])).toBeNull();
  });
});
