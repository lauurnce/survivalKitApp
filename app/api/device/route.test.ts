import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable distributed rate limiter (real one is Supabase-backed).
let rateLimited = false;
const rateLimitCalls: Array<{ key: string; max: number; windowSeconds: number }> = [];
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(async (key: string, opts: { max: number; windowSeconds: number }) => {
    rateLimitCalls.push({ key, ...opts });
    return rateLimited;
  }),
}));

import { POST } from "./route";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function makeReq(body: unknown) {
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "x-real-ip" ? "127.0.0.1" : null) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  rateLimited = false;
  rateLimitCalls.length = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
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
    expect(rateLimitCalls[0].max).toBe(20);
    expect(rateLimitCalls[0].windowSeconds).toBe(60);
  });

  it("returns 429 without a cookie when the limiter rejects", async () => {
    rateLimited = true;
    const res = await POST(makeReq({ deviceId: DEVICE }));
    expect(res.status).toBe(429);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
