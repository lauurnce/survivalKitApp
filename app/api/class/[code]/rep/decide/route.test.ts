import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate no device identity at all.
// Mirrors app/api/class/[code]/request/route.test.ts's cookie-mocking pattern.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

// Controllable per-test fixtures for the Supabase mock.
let mockClassRow: Record<string, unknown> | null;
let mockRequestRow: Record<string, unknown> | null;
let mockMemberUpsertError: { message: string; code?: string } | null;
const memberUpsertCalls: unknown[][] = [];
const statusUpdateCalls: unknown[][] = [];

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
          update: (...args: unknown[]) => {
            statusUpdateCalls.push(args);
            return {
              eq: () => Promise.resolve({ error: null }),
            };
          },
        };
      }
      if (table === "class_members") {
        return {
          upsert: (...args: unknown[]) => {
            memberUpsertCalls.push(args);
            return Promise.resolve({ error: mockMemberUpsertError });
          },
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const REP_DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const OTHER_DEV = "ffffffff-0000-0000-0000-000000000000";
const MEMBER_DEV = "cccccccc-0000-0000-0000-000000000000";
const CLASS_ID = "20000000-0002-0002-0002-000000000002";
const REQUEST_ID = "30000000-0003-0003-0003-000000000003";

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) };
}

function makeReq(body: Record<string, unknown> | null) {
  return {
    json: () => (body === null ? Promise.reject(new Error("bad json")) : Promise.resolve(body)),
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  mockCookieValue = undefined;
  mockClassRow = null;
  mockRequestRow = null;
  mockMemberUpsertError = null;
  memberUpsertCalls.length = 0;
  statusUpdateCalls.length = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("POST /api/class/[code]/rep/decide", () => {
  it("rejects when no device cookie is present", async () => {
    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("unauthorized");
  });

  it("rejects when the calling device is not the rep", async () => {
    mockCookieValue = signDeviceCookie(OTHER_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("forbidden");
  });

  it("rejects an invalid body (missing requestId/decision)", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    const res = await POST(makeReq({}), makeParams("ABC234"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("invalid_request");
  });

  it("approves a pending request: flips status, creates a class_members row", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    mockRequestRow = { id: REQUEST_ID, device_id: MEMBER_DEV, status: "pending" };
    mockMemberUpsertError = null;

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });

    expect(memberUpsertCalls.length).toBe(1);
    expect(memberUpsertCalls[0][0]).toMatchObject({ class_id: CLASS_ID, device_id: MEMBER_DEV });

    expect(statusUpdateCalls.length).toBe(1);
    expect(statusUpdateCalls[0][0]).toMatchObject({ status: "approved" });
    expect((statusUpdateCalls[0][0] as { decided_at?: string }).decided_at).toBeTruthy();
  });

  it("rejects a pending request: flips status, does NOT create a class_members row", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    mockRequestRow = { id: REQUEST_ID, device_id: MEMBER_DEV, status: "pending" };

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "reject" }), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });

    expect(memberUpsertCalls.length).toBe(0);
    expect(statusUpdateCalls.length).toBe(1);
    expect(statusUpdateCalls[0][0]).toMatchObject({ status: "rejected" });
    expect((statusUpdateCalls[0][0] as { decided_at?: string }).decided_at).toBeTruthy();
  });

  it("maps a seat_cap-trigger P0001 error on approval to a clear 409 'full' response", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    mockRequestRow = { id: REQUEST_ID, device_id: MEMBER_DEV, status: "pending" };
    mockMemberUpsertError = { message: "class is at seat_cap", code: "P0001" };

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe("full");
    // Must NOT flip the request to approved if the member insert failed.
    expect(statusUpdateCalls.length).toBe(0);
  });

  it("still returns a generic 500 for an unrelated insert error on approval", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    mockRequestRow = { id: REQUEST_ID, device_id: MEMBER_DEV, status: "pending" };
    mockMemberUpsertError = { message: "connection reset" };

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(500);
    expect(statusUpdateCalls.length).toBe(0);
  });

  it("returns 404 for a requestId that doesn't belong to this class", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = { id: CLASS_ID, rep_device_id: REP_DEV };
    mockRequestRow = null;

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ABC234"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });

  it("returns not_found for a code with no matching class", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = null;

    const res = await POST(makeReq({ requestId: REQUEST_ID, decision: "approve" }), makeParams("ZZZZZZ"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });
});
