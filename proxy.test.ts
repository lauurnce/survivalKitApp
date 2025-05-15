import { describe, expect, it, vi } from "vitest";

// proxy refreshes the Supabase session on non-public paths; no network here.
let sessionUser: { id: string } | null = null;
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: sessionUser } }) } }),
}));
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { buildCsp, config } from "./proxy";
import nextConfig from "./next.config";
import { STATIC_CSP_ROUTES, buildStaticCsp } from "./lib/csp";

describe("buildCsp", () => {
  it("keeps the nonce-based script-src with no unsafe-inline", () => {
    const csp = buildCsp("test-nonce");
    expect(csp).toMatch(/script-src[^;]*'nonce-test-nonce'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });
});

describe("proxy matcher", () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, nextConfig, url });

  // Prerendered public pages: proxy must not run, or Vercel would invoke a
  // function on every CDN hit and stamp a nonce the cached HTML doesn't carry.
  it.each(["/", "/faq", "/privacy", "/resources", "/search", "/for-blocks", "/year", "/year/y1/subjects/s1/modules/m1", "/?ref=share"])(
    "skips static page %s",
    (url) => expect(matches(url)).toBe(false),
  );

  it.each(["/account", "/account/profile", "/admin", "/admin/login", "/login", "/signup", "/unlock", "/playground", "/class/ABC/join", "/api/me", "/api/admin/feedback", "/yearly", "/faq/extra", "/pyodideWorker.js"])(
    "runs on %s",
    (url) => expect(matches(url)).toBe(true),
  );
});

describe("static CSP routes", () => {
  it("are exactly the paths proxy skips", () => {
    for (const { path, prefix } of STATIC_CSP_ROUTES) {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: path })).toBe(false);
      if (prefix) {
        expect(unstable_doesMiddlewareMatch({ config, nextConfig, url: `${path}/x/y` })).toBe(false);
      }
    }
  });

  it("get the nonce-free policy from next.config headers", async () => {
    const rules = await nextConfig.headers!();
    for (const { path, prefix } of STATIC_CSP_ROUTES) {
      const sources = rules
        .filter((r) => r.headers.some((h) => h.key === "Content-Security-Policy" && h.value === buildStaticCsp()))
        .map((r) => r.source);
      expect(sources).toContain(path);
      if (prefix) expect(sources).toContain(`${path}/:path*`);
    }
  });
});

// QA CR-02: proxy runs on unknown paths, which Next answers with the
// prerendered root 404. Its scripts carry no nonce, so it needs the static
// policy or no script on the page runs.
describe("proxy CSP choice", () => {
  async function cspFor(path: string): Promise<string | null> {
    const { proxy } = await import("./proxy");
    const { NextRequest } = await import("next/server");
    const res = await proxy(new NextRequest(`https://example.test${path}`));
    return res.headers.get("Content-Security-Policy");
  }

  it("sends the static policy for an unknown path", async () => {
    const csp = await cspFor("/some-missing-page");
    expect(csp).toBe(buildStaticCsp());
    expect(csp).not.toContain("'strict-dynamic'");
  });

  it("keeps the nonce policy on a dynamic page", async () => {
    const csp = await cspFor("/unlock");
    expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'[^;]*'strict-dynamic'/);
  });
});

// QA GT-20: signed-out /account visits returned a 200 shell plus a
// client-side refresh, because app/loading.tsx streams before the page's
// own redirect runs.
describe("proxy /account guard", () => {
  async function run(path: string) {
    const { proxy } = await import("./proxy");
    const { NextRequest } = await import("next/server");
    return proxy(new NextRequest(`https://example.test${path}`));
  }

  it.each([
    ["/account", "/account"],
    ["/account/profile", "/account/profile"],
    ["/account/roadmap?tab=2", "/account/roadmap?tab=2"],
  ])("sends a signed-out visitor on %s to login with next", async (path, next) => {
    sessionUser = null;
    const res = await run(path);
    expect(res.status).toBe(307);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname).toBe("/login");
    expect(loc.searchParams.get("next")).toBe(next);
    expect([...loc.searchParams.keys()]).toEqual(["next"]);
  });

  it("lets a signed-in user through", async () => {
    sessionUser = { id: "u1" };
    const res = await run("/account/profile");
    expect(res.headers.get("location")).toBeNull();
    sessionUser = null;
  });

  it("leaves look-alike paths alone", async () => {
    sessionUser = null;
    const res = await run("/accountant");
    expect(res.headers.get("location")).toBeNull();
  });
});

