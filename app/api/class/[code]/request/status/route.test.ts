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
let mockRequestRow: { status: string } | null;

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
                maybeSingle: () => Promise.resolve({ data: mockRequestRow }),
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

import { GET } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const CLASS_ID = "20000000-0002-0002-0002-000000000002";

let ipCounter = 0;
function makeReq() {
  const ip = `10.5.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
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
  mockRequestRow = null;
  ipCounter = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("GET /api/class/[code]/request/status", () => {
  it("returns 'none' when there is no device cookie", async () => {
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "none" });
  });

  it("returns 'none' for a malformed code, without a DB lookup", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    const res = await GET(makeReq(), makeParams("A%B%C%"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "none" });
  });

  it("returns 'none' for a nonexistent class code (never leaks whether a code exists via a different status)", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = null;
    const res = await GET(makeReq(), makeParams("ZZZZZZ"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "none" });
  });

  it("returns 'none' when this device has no request for the class", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = { id: CLASS_ID };
    mockRequestRow = null;
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "none" });
  });

  it("returns 'pending' when a request is awaiting approval", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = { id: CLASS_ID };
    mockRequestRow = { status: "pending" };
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "pending" });
  });

  it("returns 'approved' once the rep has approved it", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = { id: CLASS_ID };
    mockRequestRow = { status: "approved" };
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "approved" });
  });

  it("returns 'rejected' when the rep rejected it", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = { id: CLASS_ID };
    mockRequestRow = { status: "rejected" };
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ status: "rejected" });
  });

  it("is NOT rate-limited: sustained polling from one IP keeps succeeding", async () => {
    // Deliberate (reviewer-adjudicated): this route is not a brute-force
    // oracle — { status: "none" } is returned uniformly whether a code exists
    // or not, so per-guess information gain is zero (the real oracle, POST,
    // is throttled). A per-IP limiter here would break classmates polling
    // every ~3s from behind one campus NAT IP.
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = { id: CLASS_ID };
    mockRequestRow = { status: "pending" };
    const fixedIp = "10.9.9.7";
    const req = () =>
      ({
        headers: { get: (h: string) => (h === "x-real-ip" ? fixedIp : null) },
      }) as unknown as import("next/server").NextRequest;

    for (let i = 0; i < 50; i++) {
      const res = await GET(req(), makeParams("ABC234"));
      expect(res.status).toBe(200);
      expect((await res.json()).status).toBe("pending");
    }
  });
});
