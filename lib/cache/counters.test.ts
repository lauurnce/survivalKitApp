import { describe, it, expect, vi, beforeEach } from "vitest";

// unstable_cache stand-in that behaves like the real one where it matters:
// a resolved value is stored, a rejection is not.
const store = new Map<string, unknown>();
vi.mock("next/cache", () => ({
  unstable_cache:
    (fn: (...args: unknown[]) => Promise<unknown>, keyParts: string[]) =>
    async (...args: unknown[]) => {
      const key = JSON.stringify([keyParts, args]);
      if (store.has(key)) return store.get(key);
      const value = await fn(...args);
      store.set(key, value);
      return value;
    },
}));

let result: { data: unknown[] | null; error: { message: string } | null };
let reject = false;
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      then: (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) =>
        (reject ? Promise.reject(new Error("fetch failed")) : Promise.resolve(result)).then(ok, fail),
    };
    return { from: () => chain };
  },
}));

import { getYearCounters, getModuleCounters } from "./queries";

beforeEach(() => {
  store.clear();
  reject = false;
  result = { data: [], error: null };
});

describe("counter reads", () => {
  it("returns the counts", async () => {
    result = { data: [{ resource_id: "y1", reader_count: 42 }], error: null };
    expect(await getYearCounters()).toEqual([{ resource_id: "y1", reader_count: 42 }]);
  });

  it("degrades to no counts on a database error, and does not cache the failure", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    result = { data: null, error: { message: "timeout" } };
    expect(await getYearCounters()).toEqual([]);

    result = { data: [{ resource_id: "y1", reader_count: 42 }], error: null };
    expect(await getYearCounters()).toEqual([{ resource_id: "y1", reader_count: 42 }]);
    errorSpy.mockRestore();
  });

  it("degrades to no counts when the request itself throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    reject = true;
    await expect(getModuleCounters(["m1"])).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("skips the query for an empty id list", async () => {
    reject = true;
    expect(await getModuleCounters([])).toEqual([]);
  });
});
