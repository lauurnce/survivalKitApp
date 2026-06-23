import { describe, it, expect } from "vitest";
import { createRateLimiter, getClientIp } from "./rateLimit";
import { NextRequest } from "next/server";

describe("createRateLimiter", () => {
  it("allows up to the limit then blocks", () => {
    const limiter = createRateLimiter(3);
    expect(limiter.check("ip-1")).toBe(false); // 1
    expect(limiter.check("ip-1")).toBe(false); // 2
    expect(limiter.check("ip-1")).toBe(false); // 3
    expect(limiter.check("ip-1")).toBe(true); // 4 => blocked
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter(1);
    expect(limiter.check("ip-a")).toBe(false);
    expect(limiter.check("ip-a")).toBe(true);
    // Different IP is unaffected.
    expect(limiter.check("ip-b")).toBe(false);
  });

  it("frees the window after it elapses", () => {
    const limiter = createRateLimiter(1, 20); // 20ms window
    expect(limiter.check("ip-x")).toBe(false);
    expect(limiter.check("ip-x")).toBe(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(limiter.check("ip-x")).toBe(false);
        resolve();
      }, 30);
    });
  });
});

describe("getClientIp", () => {
  it("prefers x-real-ip", () => {
    const req = new NextRequest("https://x.test", {
      headers: { "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("uses the last x-forwarded-for hop, not the client-controlled first", () => {
    const req = new NextRequest("https://x.test", {
      headers: { "x-forwarded-for": "9.9.9.9, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("falls back to 'unknown' when no IP header is present", () => {
    const req = new NextRequest("https://x.test");
    expect(getClientIp(req)).toBe("unknown");
  });
});
