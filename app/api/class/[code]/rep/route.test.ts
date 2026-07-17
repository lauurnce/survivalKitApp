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
let mockMembers: { device_id: string; joined_at: string }[];
let mockPending: { id: string; created_at: string }[];
let mockModules: Record<string, unknown>[];
// Map of device_id -> module_progress rows for that device.
let mockProgressByDevice: Record<string, { module_id: string }[]>;

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
      if (table === "class_members") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockMembers }),
            }),
          }),
        };
      }
      if (table === "class_join_requests") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: mockPending }),
              }),
            }),
          }),
        };
      }
      if (table === "modules") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: mockModules }),
          }),
        };
      }
      if (table === "module_progress") {
        return {
          select: () => ({
            eq: (_col: string, deviceId: string) =>
              Promise.resolve({ data: mockProgressByDevice[deviceId] ?? [] }),
          }),
        };
      }
      throw new Error(`unexpected table: ${table}`);
    },
  }),
}));

import { GET } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const REP_DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const OTHER_DEV = "ffffffff-0000-0000-0000-000000000000";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const YEAR = "00000000-0000-0000-0000-000000000001";
const CLASS_ID = "20000000-0002-0002-0002-000000000002";

function futureDate() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
}

function makeParams(code: string) {
  return { params: Promise.resolve({ code }) };
}

function makeReq() {
  return {} as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  mockCookieValue = undefined;
  mockClassRow = null;
  mockMembers = [];
  mockPending = [];
  mockModules = [];
  mockProgressByDevice = {};
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
});

describe("GET /api/class/[code]/rep", () => {
  it("rejects when no device cookie is present at all", async () => {
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("unauthorized");
  });

  it("rejects when the calling device is not the class's rep_device_id", async () => {
    mockCookieValue = signDeviceCookie(OTHER_DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      current_period_end: futureDate(),
      rep_device_id: REP_DEV,
    };
    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("forbidden");
  });

  it("returns summary, pending requests, and roster with progress for the real rep device", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      current_period_end: futureDate(),
      rep_device_id: REP_DEV,
    };
    mockMembers = [{ device_id: "dev-1", joined_at: "2026-07-01T00:00:00.000Z" }];
    mockPending = [{ id: "req-1", created_at: "2026-07-02T00:00:00.000Z" }];
    mockModules = [{ id: "mod-1" }, { id: "mod-2" }, { id: "mod-3" }];
    mockProgressByDevice = { "dev-1": [{ module_id: "mod-1" }, { module_id: "mod-2" }] };

    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      summary: {
        seatsFilled: 1,
        seatCap: 50,
        expiresAt: mockClassRow.current_period_end,
        subjectId: SUBJ,
        yearId: YEAR,
        scope: "subject",
      },
      pending: [{ id: "req-1", createdAt: "2026-07-02T00:00:00.000Z" }],
      roster: [{ ordinal: 1, completed: 2, total: 3 }],
    });
  });

  it("computes roster progress across ALL subjects in the year when subject_id is null", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: null,
      year_id: YEAR,
      seat_cap: 50,
      current_period_end: futureDate(),
      rep_device_id: REP_DEV,
    };
    mockMembers = [{ device_id: "dev-1", joined_at: "2026-07-01T00:00:00.000Z" }];
    mockModules = [{ id: "mod-1" }, { id: "mod-2" }, { id: "mod-3" }, { id: "mod-4" }];
    mockProgressByDevice = { "dev-1": [{ module_id: "mod-3" }] };

    const res = await GET(makeReq(), makeParams("ABC234"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary.scope).toBe("all");
    expect(json.summary.subjectId).toBeNull();
    expect(json.roster).toEqual([{ ordinal: 1, completed: 1, total: 4 }]);
  });

  it("orders the roster by class_members.joined_at ascending (Classmate 1 = first joiner)", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      current_period_end: futureDate(),
      rep_device_id: REP_DEV,
    };
    // Mock already returns them in joined_at-ascending order (as the real
    // .order("joined_at", { ascending: true }) query would) — the route must
    // preserve that order when assigning ordinals, not re-sort.
    mockMembers = [
      { device_id: "dev-first", joined_at: "2026-07-01T00:00:00.000Z" },
      { device_id: "dev-second", joined_at: "2026-07-02T00:00:00.000Z" },
    ];
    mockModules = [{ id: "mod-1" }];
    mockProgressByDevice = {};

    const res = await GET(makeReq(), makeParams("ABC234"));
    const json = await res.json();
    expect(json.roster[0].ordinal).toBe(1);
    expect(json.roster[1].ordinal).toBe(2);
  });

  it("never exposes a classmate's raw device_id in the response", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = {
      id: CLASS_ID,
      subject_id: SUBJ,
      year_id: YEAR,
      seat_cap: 50,
      current_period_end: futureDate(),
      rep_device_id: REP_DEV,
    };
    mockMembers = [{ device_id: "super-secret-device-id", joined_at: "2026-07-01T00:00:00.000Z" }];
    mockModules = [{ id: "mod-1" }];
    mockProgressByDevice = {};

    const res = await GET(makeReq(), makeParams("ABC234"));
    const json = await res.json();
    const serialized = JSON.stringify(json);
    expect(serialized).not.toContain("super-secret-device-id");
    for (const entry of json.roster) {
      expect(Object.keys(entry).sort()).toEqual(["completed", "ordinal", "total"]);
    }
  });

  it("returns not_found for a code with no matching class", async () => {
    mockCookieValue = signDeviceCookie(REP_DEV);
    mockClassRow = null;
    const res = await GET(makeReq(), makeParams("ZZZZZZ"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("not_found");
  });
});
