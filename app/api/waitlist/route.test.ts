import { describe, it, expect, vi, beforeEach } from "vitest";

// No device cookie by default — mirrors a first-time visitor whose
// fire-and-forget /api/device sync hasn't landed yet.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

type UpsertPayload = Record<string, unknown>;
const upserts: UpsertPayload[] = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      upsert: (payload: UpsertPayload, _opts: unknown) => {
        upserts.push(payload);
        return Promise.resolve({ error: null });
      },
    }),
  }),
}));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const SPOOFED = "ffffffff-ffff-4fff-8fff-ffffffffffff";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.4.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "x-real-ip" ? ip : "test-agent") },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  upserts.length = 0;
  mockCookieValue = undefined;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/waitlist — validation", () => {
  it("requires email, name, device_id, and source", async () => {
    const res = await POST(makeReq({ email: "a@b.com", name: "A", source: "coming_soon" }));
    // No cookie AND no device_id in body -> missing required field
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await POST(
      makeReq({ email: "not-an-email", name: "A", device_id: DEVICE, source: "coming_soon" })
    );
    expect(res.status).toBe(400);
  });

  it("accepts a well-formed signup", async () => {
    const res = await POST(
      makeReq({ email: "a@b.com", name: "A", device_id: DEVICE, source: "coming_soon" })
    );
    expect(res.status).toBe(200);
    expect(upserts).toHaveLength(1);
  });
});

describe("POST /api/waitlist — device_id trust", () => {
  it("attributes the signup to the signed cookie's device, not a spoofed body value", async () => {
    mockCookieValue = signDeviceCookie(DEVICE);
    const res = await POST(
      makeReq({ email: "a@b.com", name: "A", device_id: SPOOFED, source: "coming_soon" })
    );
    expect(res.status).toBe(200);
    expect(upserts[0].device_id).toBe(DEVICE);
    expect(upserts[0].device_id).not.toBe(SPOOFED);
  });

  it("falls back to the body device_id when no cookie exists yet", async () => {
    const res = await POST(
      makeReq({ email: "a@b.com", name: "A", device_id: DEVICE, source: "coming_soon" })
    );
    expect(res.status).toBe(200);
    expect(upserts[0].device_id).toBe(DEVICE);
  });
});
