import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor (rep must already have a device cookie — this route never mints one
// from the body), or leave undefined to simulate no device identity yet.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

const linkCalls: unknown[][] = [];
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    createDynamicPaymongoLink: (...args: unknown[]) => {
      linkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/x", linkId: "link_1" });
    },
  };
});

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const REP_DEVICE = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const VICTIM_DEVICE = "ffffffff-ffff-4fff-8fff-ffffffffffff";

function makeReq(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
    nextUrl: { origin: "http://localhost:3000" },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  linkCalls.length = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
  mockCookieValue = signDeviceCookie(REP_DEVICE);
});

describe("POST /api/class/checkout", () => {
  it("rejects seats below the 11 minimum", async () => {
    const res = await POST(
      makeReq({ scope: "subject", subjectId: SUBJ, yearId: YEAR, seats: 10 })
    );
    expect(res.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("computes the correct total for a subject-scope purchase at the 11-seat minimum", async () => {
    const res = await POST(
      makeReq({ scope: "subject", subjectId: SUBJ, yearId: YEAR, seats: 11 })
    );
    expect(res.status).toBe(200);
    expect(linkCalls[0][0]).toBe(79900);
  });

  it("computes the correct total for a subject-scope purchase above the minimum", async () => {
    const res = await POST(
      makeReq({ scope: "subject", subjectId: SUBJ, yearId: YEAR, seats: 20 })
    );
    expect(res.status).toBe(200);
    expect(linkCalls[0][0]).toBe(133000);
  });

  it("computes the correct total for an all-subjects purchase at the minimum", async () => {
    const res = await POST(makeReq({ scope: "all", yearId: YEAR, seats: 11 }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][0]).toBe(99900);
  });

  it("rejects scope='subject' with no subjectId", async () => {
    const res = await POST(makeReq({ scope: "subject", yearId: YEAR, seats: 11 }));
    expect(res.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("trusts only the signed device cookie for repDeviceId, never a client-supplied value", async () => {
    const res = await POST(
      makeReq({
        scope: "subject",
        subjectId: SUBJ,
        yearId: YEAR,
        seats: 11,
        deviceId: VICTIM_DEVICE,
      })
    );
    expect(res.status).toBe(200);
    const remarks = linkCalls[0][2] as string;
    expect(remarks).toContain(`rep:${REP_DEVICE}`);
    expect(remarks).not.toContain(VICTIM_DEVICE);
  });

  it("returns the checkoutUrl from createDynamicPaymongoLink on success", async () => {
    const res = await POST(
      makeReq({ scope: "subject", subjectId: SUBJ, yearId: YEAR, seats: 11 })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.checkoutUrl).toBe("https://pm.link/x");
  });

  it("rejects when no device cookie is present", async () => {
    mockCookieValue = undefined;
    const res = await POST(
      makeReq({ scope: "subject", subjectId: SUBJ, yearId: YEAR, seats: 11 })
    );
    expect(res.status).toBe(401);
    expect(linkCalls).toHaveLength(0);
  });
});
