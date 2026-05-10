import { describe, expect, it } from "vitest";
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
