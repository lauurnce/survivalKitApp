import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_BOOTSTRAP_SHA256,
  buildStaticCsp,
  isStaticCspPath,
} from "./csp";
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
  it.each(["/", "/faq", "/privacy", "/resources", "/search", "/for-blocks", "/year", "/year/abc/subjects", "/year/a/subjects/b/modules/c"])(
    "treats %s as a static page",
    (p) => expect(isStaticCspPath(p)).toBe(true),
  );

  it.each(["/account", "/admin", "/login", "/unlock", "/playground", "/class/X/join", "/yearly", "/faq/x", "/api/me"])(
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
