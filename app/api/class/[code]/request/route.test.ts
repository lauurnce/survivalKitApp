import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate no device identity at all.
// Mirrors app/api/class/join/route.test.ts's cookie-mocking pattern.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

// Controllable per-test fixtures for the Supabase mock.
let mockClassRow: Record<string, unknown> | null;
let mockExistingRequest: { status: string } | null;
let mockUpsertError: { message: string; code?: string } | null;
const upsertCalls: unknown[][] = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => {
      if (table === "classes") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: mockClassRow }),
            }),
          }),
        };
      }
      if (table === "class_join_requests") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: mockExistingRequest }),
              }),
            }),
          }),
          upsert: (...args: unknown[]) => {
            upsertCalls.push(args);
            return Promise.resolve({ error: mockUpsertError });
          },
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const CLASS_ID = "20000000-0002-0002-0002-000000000002";

function futureDate() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
}

let ipCounter = 0;
function makeReq() {
  const ip = `10.4.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) },
  } as unknown as import("next/server").NextRequest;
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) };
}

beforeEach(() => {
  mockCookieValue = undefined;
  mockClassRow = null;
  mockExistingRequest = null;
  mockUpsertError = null;
  upsertCalls.length = 0;
  ipCounter = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/class/[code]/request", () => {
  it("rejects when no device cookie is present", async () => {
    const res = await POST(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("no_device");
  });

  it("rejects a malformed code (wrong shape / wildcard characters)", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    const res = await POST(makeReq(), makeParams("A%B%C%"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("invalid_code");
  });

  it("returns not_found for a code with no matching class", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = null;
    const res = await POST(makeReq(), makeParams("ZZZZZZ"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });

  it("returns not_found for an expired or inactive class", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      status: "active",
      current_period_end: pastDate(),
    };
    const res = await POST(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });

  it("creates a pending request and returns { status: 'pending' } for a new device", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      status: "active",
      current_period_end: futureDate(),
    };
    mockExistingRequest = null;
    const res = await POST(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "pending" });
    expect(upsertCalls[0][0]).toMatchObject({
      class_id: CLASS_ID,
      device_id: DEV,
      status: "pending",
      decided_at: null,
    });
  });

  it("returns { status: 'approved' } immediately if this device already has an approved request", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      status: "active",
      current_period_end: futureDate(),
    };
    mockExistingRequest = { status: "approved" };
    const res = await POST(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "approved" });
    // No new insert/upsert when already approved.
    expect(upsertCalls.length).toBe(0);
  });

  it("resets a previously-rejected request back to pending on resubmission", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      status: "active",
      current_period_end: futureDate(),
    };
    mockExistingRequest = { status: "rejected" };
    const res = await POST(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "pending" });
    expect(upsertCalls[0][0]).toMatchObject({
      class_id: CLASS_ID,
      device_id: DEV,
      status: "pending",
      decided_at: null,
    });
    expect(upsertCalls[0][1]).toMatchObject({ onConflict: "class_id,device_id" });
  });

  it("is rate-limited per IP, matching the existing class/join endpoint's threshold", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = null;
    // Fixed IP across every call in this test so the limiter's window applies.
    const fixedIp = "10.9.9.8";
    const req = () =>
      ({
        headers: { get: (h: string) => (h === "x-real-ip" ? fixedIp : null) },
      }) as unknown as import("next/server").NextRequest;

    let lastRes;
    for (let i = 0; i < 11; i++) {
      lastRes = await POST(req(), makeParams("ABC234"));
    }
    expect(lastRes!.status).toBe(429);
    const json = await lastRes!.json();
    expect(json.error).toBe("rate_limited");
  });
});
