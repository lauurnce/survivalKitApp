import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_BOOTSTRAP_SHA256,
  buildStaticCsp,
  isStaticCspPath,
  usesNonceCsp,
} from "./csp";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { buildCsp } from "../proxy";

function withEnv<T>(env: string, fn: () => T): T {
  vi.stubEnv("NODE_ENV", env);
  try {
    return fn();
  } finally {
    vi.unstubAllEnvs();
  }
}

function directive(csp: string, name: string): string | undefined {
  return csp
    .split("; ")
    .find((d) => d === name || d.startsWith(name + " "));
}

describe("THEME_BOOTSTRAP_SHA256", () => {
  it("is the sha256 of the exact inline theme script", () => {
    const digest = createHash("sha256").update(THEME_BOOTSTRAP_SCRIPT).digest("base64");
    expect(THEME_BOOTSTRAP_SHA256).toBe(`sha256-${digest}`);
  });
});

describe("buildCsp (nonce policy)", () => {
  const csp = withEnv("production", () => buildCsp("test-nonce"));

  it("allows scripts only by nonce, the theme hash and strict-dynamic", () => {
    const scriptSrc = directive(csp, "script-src")!;
    expect(scriptSrc).toContain("'nonce-test-nonce'");
    expect(scriptSrc).toContain(`'${THEME_BOOTSTRAP_SHA256}'`);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("adds 'unsafe-eval' only in development", () => {
    expect(directive(withEnv("development", () => buildCsp("n")), "script-src")).toContain("'unsafe-eval'");
  });
});

describe("buildStaticCsp (prerendered public pages)", () => {
  const csp = buildStaticCsp(false);

  it("carries no nonce, hash or strict-dynamic (they would disable 'unsafe-inline')", () => {
    const scriptSrc = directive(csp, "script-src")!;
    expect(scriptSrc).not.toMatch(/'nonce-|'sha256-|'strict-dynamic'/);
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("loads external scripts only from self and Google Tag Manager", () => {
    const sources = directive(csp, "script-src")!.split(" ").slice(1);
    const hosts = sources.filter((s) => !s.startsWith("'"));
    expect(hosts).toEqual(["https://www.googletagmanager.com"]);
  });

  it("blocks inline event-handler attributes", () => {
    expect(directive(csp, "script-src-attr")).toBe("script-src-attr 'none'");
  });
});

describe.each([
  ["nonce", withEnv("production", () => buildCsp("n"))],
  ["static", buildStaticCsp(false)],
])("%s policy", (_name, csp) => {
  it.each([
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "default-src 'self'",
  ])("keeps %s", (d) => {
    expect(csp.split("; ")).toContain(d);
  });

  it("allows GA4 hits through connect-src and img-src", () => {
    expect(directive(csp, "connect-src")).toContain("https://*.google-analytics.com");
    expect(directive(csp, "img-src")).toContain("https://*.google-analytics.com");
  });
});

describe("isStaticCspPath", () => {
  it.each(["/", "/faq", "/privacy", "/resources", "/search", "/for-blocks", "/playground", "/year", "/year/abc/subjects", "/year/a/subjects/b/modules/c"])(
    "treats %s as a static page",
    (p) => expect(isStaticCspPath(p)).toBe(true),
  );

  it.each(["/account", "/admin", "/login", "/unlock", "/class/X/join", "/yearly", "/faq/x", "/api/me"])(
    "keeps %s on the nonce policy",
    (p) => expect(isStaticCspPath(p)).toBe(false),
  );
});

describe("policy parity", () => {
  it("differs from the nonce policy only in its script directives", () => {
    const strip = (csp: string) =>
      csp.split("; ").filter((d) => !d.startsWith("script-src"));
    expect(strip(buildStaticCsp(false))).toEqual(strip(withEnv("production", () => buildCsp("n"))));
  });
});

// QA CR-02: the root 404 is the prerendered /_not-found page, whose scripts
// carry no nonce. Proxy must not send the nonce policy for paths that 404.
describe("usesNonceCsp", () => {
  // Every page.tsx under app/, as a URL with dynamic segments filled in.
  function pageRoutes(dir = join(__dirname, "..", "app")): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === "api") continue;
        out.push(...pageRoutes(full));
      } else if (name === "page.tsx") {
        const rel = relative(join(__dirname, "..", "app"), dir).split(sep);
        const segs = rel
          .filter((seg) => seg && !(seg.startsWith("(") && seg.endsWith(")")))
          .map((seg) => (seg.startsWith("[") ? "x1" : seg));
        out.push("/" + segs.join("/"));
      }
    }
    return out;
  }

  it("covers every dynamic page in app/, so none of them loses its nonce", () => {
    const dynamicPages = pageRoutes().filter((p) => !isStaticCspPath(p));
    expect(dynamicPages.length).toBeGreaterThan(5);
    for (const page of dynamicPages) {
      expect([page, usesNonceCsp(page)]).toEqual([page, true]);
    }
  });

  it.each(["/api/me", "/api/admin/feedback", "/api/does-not-exist"])(
    "keeps the nonce policy for API path %s",
    (path) => expect(usesNonceCsp(path)).toBe(true),
  );

  it.each(["/this-page-does-not-exist", "/some-missing-page", "/faq/extra", "/yearly", "/account/bogus", "/class/ABC", "/apiary"])(
    "gives the static policy to unknown path %s (served as the prerendered 404)",
    (path) => expect(usesNonceCsp(path)).toBe(false),
  );

  it("ignores a trailing slash", () => {
    expect(usesNonceCsp("/login/")).toBe(true);
  });
});

