import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable distributed rate limiter (real one is Supabase-backed).
let rateLimited = false;
// When set, emulates the real helper's backend-error behavior: reject unless
// the caller opted into fail-open with onFailure: "allow".
let limiterDown = false;
const rateLimitCalls: Array<{ key: string; max: number; windowSeconds: number; onFailure?: string }> = [];
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(
    async (key: string, opts: { max: number; windowSeconds: number; onFailure?: string }) => {
      rateLimitCalls.push({ key, ...opts });
      if (limiterDown) return opts.onFailure !== "allow";
      return rateLimited;
    }
  ),
}));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function makeReq(body: unknown, cookie?: string) {
  return {
    json: () => Promise.resolve(body),
    cookies: { get: (n: string) => (n === "bsit_device_id" && cookie ? { value: cookie } : undefined) },
    headers: { get: (h: string) => (h === "x-real-ip" ? "127.0.0.1" : null) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  rateLimited = false;
  limiterDown = false;
  rateLimitCalls.length = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret-at-least-32-bytes";
});

describe("POST /api/device", () => {
  it("sets a signed HttpOnly device cookie for a valid UUID", async () => {
    const res = await POST(makeReq({ deviceId: DEVICE }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("bsit_device_id=");
    expect(setCookie).toContain(DEVICE);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("rejects a non-UUID deviceId", async () => {
    const res = await POST(makeReq({ deviceId: "not-a-uuid" }));
    expect(res.status).toBe(400);
  });

  it("rejects a missing body", async () => {
    const res = await POST(makeReq(null));
    expect(res.status).toBe(400);
  });

  it("checks the shared limiter with a namespaced per-IP key", async () => {
    await POST(makeReq({ deviceId: DEVICE }));
    expect(rateLimitCalls).toHaveLength(1);
    expect(rateLimitCalls[0].key).toBe("device:ip:127.0.0.1");
    expect(rateLimitCalls[0].max).toBe(60);
    expect(rateLimitCalls[0].windowSeconds).toBe(60);
  });

  it("returns 429 without a cookie when the limiter rejects", async () => {
    rateLimited = true;
    const res = await POST(makeReq({ deviceId: DEVICE }));
    expect(res.status).toBe(429);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("opts into fail-open so device cookies keep issuing when the limiter backend errors", async () => {
    limiterDown = true;
    const res = await POST(makeReq({ deviceId: DEVICE }));
    expect(res.status).toBe(200);
    expect(rateLimitCalls[0].onFailure).toBe("allow");
    expect(res.headers.get("set-cookie")).toContain(DEVICE);
  });
});

describe("POST /api/device — register once (CR-05)", () => {
  it("sets a readable marker cookie beside the signed one", async () => {
    const res = await POST(makeReq({ deviceId: DEVICE }));
    const cookies = res.headers.getSetCookie();
    const marker = cookies.find((c) => c.startsWith("bsit_device_ok="));
    expect(marker).toBeDefined();
    expect(marker).toContain(`bsit_device_ok=${DEVICE}`);
    expect(marker!.toLowerCase()).not.toContain("httponly");
  });

  it("does not spend the per-IP allowance when a valid signed cookie already matches", async () => {
    rateLimited = true; // would 429 if the limiter were consulted
    const res = await POST(makeReq({ deviceId: DEVICE }, signDeviceCookie(DEVICE)));
    expect(res.status).toBe(200);
    expect(rateLimitCalls).toHaveLength(0);
    expect(res.headers.get("set-cookie")).toContain("bsit_device_ok=");
  });

  it("still rate-limits when the signed cookie is for a different device", async () => {
    rateLimited = true;
    const other = "11111111-2222-4333-8444-555555555555";
    const res = await POST(makeReq({ deviceId: DEVICE }, signDeviceCookie(other)));
    expect(res.status).toBe(429);
  });

  it("still rate-limits when the cookie is forged", async () => {
    rateLimited = true;
    const res = await POST(makeReq({ deviceId: DEVICE }, `${DEVICE}.forged`));
    expect(res.status).toBe(429);
  });
});
