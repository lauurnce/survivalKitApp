import { describe, expect, it } from "vitest";
import { buildCsp } from "./proxy";

describe("buildCsp", () => {
  it("keeps the nonce-based script-src with no unsafe-inline", () => {
    const csp = buildCsp("test-nonce");
    expect(csp).toMatch(/script-src[^;]*'nonce-test-nonce'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("allows GA4 pageview beacons through connect-src and img-src", () => {
    // gtag.js (loaded via a nonced <script src="https://www.googletagmanager.com/...">,
    // which CSP trusts regardless of host once the nonce matches) sends hit
    // requests to *.google-analytics.com via fetch/sendBeacon (connect-src) with
    // an <img> pixel fallback (img-src) — both need an explicit allowance.
    const csp = buildCsp("test-nonce");
    expect(csp).toMatch(/connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
    expect(csp).toMatch(/img-src[^;]*https:\/\/\*\.google-analytics\.com/);
  });
});
