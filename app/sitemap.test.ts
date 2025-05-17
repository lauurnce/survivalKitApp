import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Result = { data: unknown[] | null; error: { message: string } | null };
let results: Record<string, Result> = {};
const createServerClient = vi.fn(() => ({
  from: (table: string) => ({
    select: () => Promise.resolve(results[table] ?? { data: [], error: null }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => createServerClient(),
}));

import sitemap from "./sitemap";

const YEAR = "y1";
const SUBJECT = "s1";
const MODULE = "m1";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test");
  vi.stubEnv("NEXT_PHASE", "");
  results = {
    years: { data: [{ id: YEAR, coming_soon: false }, { id: "y9", coming_soon: true }], error: null },
    subjects: { data: [{ id: SUBJECT, year_id: YEAR }, { id: "s9", year_id: "y9" }], error: null },
    modules: { data: [{ id: MODULE, subject_id: SUBJECT }, { id: "m9", subject_id: "s9" }], error: null },
  };
  createServerClient.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const paths = (entries: { url: string }[]) => entries.map((e) => new URL(e.url).pathname);

const STATIC_URLS = ["/", "/year", "/search", "/resources", "/faq", "/for-blocks", "/privacy"];

describe("sitemap", () => {
  it("lists static pages plus every live year, subject and module", async () => {
    const urls = paths(await sitemap());
    expect(urls).toEqual([
      "/",
      "/year",
      "/search",
      "/resources",
      "/faq",
      "/for-blocks",
      "/privacy",
      `/year/${YEAR}/subjects`,
      `/year/${YEAR}/subjects/${SUBJECT}/modules`,
      `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`,
    ]);
  });

  it("serves only static URLs, with a warning and no client, when Supabase env is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const urls = paths(await sitemap());
    expect(urls).toEqual(STATIC_URLS);
    expect(createServerClient).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it("throws at runtime (ISR) on a query error so the last good sitemap stays served", async () => {
    results.modules = { data: null, error: { message: "timeout" } };
    await expect(sitemap()).rejects.toThrow(/modules: timeout/);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("modules: timeout"));
  });

  it("falls back to static URLs, logged as an error, on a query error during next build", async () => {
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    results.years = { data: null, error: { message: "boom" } };
    const urls = paths(await sitemap());
    expect(urls).toEqual(STATIC_URLS);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("years: boom"));
  });
});
