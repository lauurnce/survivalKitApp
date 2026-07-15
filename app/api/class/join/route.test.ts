import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate no device identity at all.
// Mirrors app/api/subscribe/route.test.ts's cookie-mocking pattern.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

// Controllable per-test fixtures for the Supabase mock.
let mockClassRow: Record<string, unknown> | null;
let mockMemberCount: number;
let mockUpsertError: { message: string } | null;
const upsertCalls: unknown[][] = [];

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: (table: string) => {
      if (table === "classes") {
        return {
          select: () => ({
            ilike: () => ({
              maybeSingle: () => Promise.resolve({ data: mockClassRow }),
            }),
          }),
        };
      }
      if (table === "class_members") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ count: mockMemberCount }),
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
const SUBJ = "10000000-0001-0001-0001-000000000001";
const YEAR = "00000000-0000-0000-0000-000000000001";
const CLASS_ID = "20000000-0002-0002-0002-000000000002";

function futureDate() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
}

function pastDate() {
  return new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
}

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.2.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  mockCookieValue = undefined;
  mockClassRow = null;
  mockMemberCount = 0;
  mockUpsertError = null;
  upsertCalls.length = 0;
  ipCounter = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/class/join", () => {
  it("rejects when no device cookie is present", async () => {
    const res = await POST(makeReq({ code: "ABC234" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("no_device");
  });

  it("rejects a code that does not match any class", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = null;
    const res = await POST(makeReq({ code: "ZZZZZZ" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });

  it("rejects an expired class", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      status: "active",
      current_period_end: pastDate(),
    };
    const res = await POST(makeReq({ code: "ABC234" }));
    expect(res.status).toBe(404);
  });

  it("rejects when the class is at seat_cap", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 2,
      status: "active",
      current_period_end: futureDate(),
    };
    mockMemberCount = 2;
    const res = await POST(makeReq({ code: "ABC234" }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe("full");
  });

  it("joins successfully and returns subjectId/yearId", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      status: "active",
      current_period_end: futureDate(),
    };
    mockMemberCount = 3;
    const res = await POST(makeReq({ code: "abc234" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true, subjectId: SUBJ, yearId: YEAR });
    // Must never trust a client-supplied deviceId in the write.
    expect(upsertCalls[0][0]).toMatchObject({ class_id: CLASS_ID, device_id: DEV });
  });

  it("rejects an invalid code shape before hitting the DB", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    const res = await POST(makeReq({ code: "AB" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 once the rate limit is exceeded", async () => {
    mockCookieValue = signDeviceCookie(DEV);
    mockClassRow = null;
    // Fixed IP across every call in this test so the limiter's window applies.
    const fixedIp = "10.9.9.9";
    const req = () =>
      ({
        json: () => Promise.resolve({ code: "ABC234" }),
        headers: { get: (h: string) => (h === "x-real-ip" ? fixedIp : null) },
      }) as unknown as import("next/server").NextRequest;

    let lastRes;
    for (let i = 0; i < 11; i++) {
      lastRes = await POST(req());
    }
    expect(lastRes!.status).toBe(429);
    const json = await lastRes!.json();
    expect(json.error).toBe("rate_limited");
  });
});
