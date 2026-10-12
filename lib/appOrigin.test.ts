import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_ORIGIN,
  VERCEL_APP_ORIGIN,
  allowedOrigins,
  canonicalOrigin,
  canonicalUrl,
  isAllowedOrigin,
  resolveRequestOrigin,
} from "./appOrigin";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("canonicalOrigin", () => {
  it("defaults to the custom domain", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "");
    expect(DEFAULT_APP_ORIGIN).toBe("https://tryi2i.com");
    expect(canonicalOrigin()).toBe("https://tryi2i.com");
  });

  it("honours NEXT_PUBLIC_APP_ORIGIN, normalised to a bare origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "https://staging.example.com/some/path/");
    expect(canonicalOrigin()).toBe("https://staging.example.com");
  });

  it("ignores an invalid or non-http override", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "not a url");
    expect(canonicalOrigin()).toBe(DEFAULT_APP_ORIGIN);
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "javascript:alert(1)");
    expect(canonicalOrigin()).toBe(DEFAULT_APP_ORIGIN);
  });
});

describe("allowedOrigins", () => {
  it("includes the custom domain, www, and the vercel.app host", () => {
    const set = allowedOrigins();
    expect(set.has("https://tryi2i.com")).toBe(true);
    expect(set.has("https://www.tryi2i.com")).toBe(true);
    expect(set.has(VERCEL_APP_ORIGIN)).toBe(true);
  });

  it("allows localhost outside production only", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(allowedOrigins().has("http://localhost:3000")).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    expect(allowedOrigins().has("http://localhost:3000")).toBe(false);
  });

  it("includes an overridden canonical origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "https://staging.example.com");
    expect(allowedOrigins().has("https://staging.example.com")).toBe(true);
  });
});

describe("resolveRequestOrigin", () => {
  it("keeps an allowlisted request origin so cookies stay on the same host", () => {
    expect(resolveRequestOrigin("https://tryi2i.com")).toBe("https://tryi2i.com");
    expect(resolveRequestOrigin(VERCEL_APP_ORIGIN)).toBe(VERCEL_APP_ORIGIN);
  });

  it("falls back to canonical for missing, foreign, or look-alike origins", () => {
    for (const o of [
      null,
      undefined,
      "",
      "https://evil.example",
      "https://tryi2i.com.evil.example",
      "https://tryi2i.com/",
      "http://tryi2i.com",
      "https://TRYI2I.com",
    ]) {
      expect(resolveRequestOrigin(o)).toBe(DEFAULT_APP_ORIGIN);
      expect(isAllowedOrigin(o)).toBe(false);
    }
  });
});

describe("canonicalUrl", () => {
  it("joins a path onto the canonical origin", () => {
    expect(canonicalUrl("/account")).toBe("https://tryi2i.com/account");
    expect(canonicalUrl("sitemap.xml")).toBe("https://tryi2i.com/sitemap.xml");
  });
});
