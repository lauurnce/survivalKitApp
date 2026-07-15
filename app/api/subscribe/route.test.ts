import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate a first-time visitor whose
// fire-and-forget /api/device sync hasn't landed yet.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

const linkCalls: unknown[][] = [];
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    createPaymongoLink: (...args: unknown[]) => {
      linkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/x", linkId: "link_1" });
    },
  };
});
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_c: string, _v: string) => ({
          maybeSingle: () => Promise.resolve({ data: { id: "x" } }),
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "x" } }) }),
        }),
      }),
    }),
  }),
}));
vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUserId: () => Promise.resolve(null) }));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const VICTIM_DEV = "ffffffff-ffff-4fff-8fff-ffffffffffff";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.1.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "origin" ? "http://localhost:3000" : ip) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  linkCalls.length = 0;
  mockCookieValue = undefined;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/subscribe plan validation", () => {
  it("passes a valid plan through to createPaymongoLink", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_sem"); // 6th arg = plan
  });

  it("rejects a plan that contradicts the scope", async () => {
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(400);
    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "year_sem" }));
    expect(res2.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("rejects an unknown plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "free_forever" }));
    expect(res.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("defaults legacy requests without a plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_month");

    const res2 = await POST(makeReq({ yearId: YEAR, deviceId: DEV }));
    expect(res2.status).toBe(200);
    expect(linkCalls[1][5]).toBe("year_sem");
  });
});

describe("POST /api/subscribe device-id trust (IDOR regression)", () => {
  it("ignores a spoofed body deviceId and grants the signed cookie's device instead", async () => {
    // Attacker's own browser has a legitimate signed cookie for DEV, but tries
    // to plant a victim's UUID in the body to redirect the grant.
    mockCookieValue = signDeviceCookie(DEV);
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: VICTIM_DEV }));
    expect(res.status).toBe(200);
    // 2nd positional arg to createPaymongoLink is deviceId — must be the
    // cookie's device, never the attacker-supplied body value.
    expect(linkCalls[0][1]).toBe(DEV);
    expect(linkCalls[0][1]).not.toBe(VICTIM_DEV);
  });

  it("falls back to the body deviceId only when no cookie exists yet", async () => {
    mockCookieValue = undefined;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][1]).toBe(DEV);
  });

  it("rejects a forged/tampered cookie value and falls back to the body UUID", async () => {
    mockCookieValue = `${VICTIM_DEV}.not-a-real-signature`;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][1]).toBe(DEV);
    expect(linkCalls[0][1]).not.toBe(VICTIM_DEV);
  });
});
