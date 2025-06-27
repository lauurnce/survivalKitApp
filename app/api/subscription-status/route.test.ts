import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const OTHER_YEAR = "44444444-4444-4444-4444-444444444444";

let deviceId: string | null = "device-1";
let userId: string | null = null;
let subscribed = true;
let moduleParent: { mod: unknown; subject: unknown } = {
  mod: { id: MODULE, subject_id: SUBJECT },
  subject: { id: SUBJECT, year_id: YEAR },
};
const UNTIL = "2026-12-01T00:00:00.000Z";
let yearEnts: { year: unknown; subjects: Record<string, unknown> } = { year: null, subjects: {} };
const isSubscribedMock = vi.fn(async (..._args: unknown[]) =>
  subscribed ? { scope: "subject", until: UNTIL } : null,
);
const yearEntsMock = vi.fn(async (..._args: unknown[]) => yearEnts);
const activityMock = vi.fn(async (_id: string, unlocked: boolean) =>
  unlocked ? [{ id: "a1", kind: "activity", heading: "Drill", body_md: "secret", sort_order: 5 }] : [],
);

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (deviceId ? { value: "signed" } : undefined) }),
}));
vi.mock("@/lib/auth/deviceCookie", () => ({
  DEVICE_COOKIE: "device_id",
  verifyDeviceCookie: () => deviceId,
}));
vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUserId: async () => userId }));
vi.mock("@/lib/subscriptions", () => ({
  getEntitlement: (...a: unknown[]) => isSubscribedMock(...a),
  getYearEntitlements: (...a: unknown[]) => yearEntsMock(...a),
}));
vi.mock("@/lib/cache/queries", () => ({
  getModuleWithSubject: async () => moduleParent,
  getModuleActivitySections: (id: string, unlocked: boolean) => activityMock(id, unlocked),
}));

import { GET } from "./route";

function req(q: Record<string, string>) {
  return new NextRequest(`http://localhost/api/subscription-status?${new URLSearchParams(q)}`);
}
const withModule = (over: Record<string, string> = {}) =>
  req({ yearId: YEAR, subjectId: SUBJECT, moduleId: MODULE, ...over });

beforeEach(() => {
  deviceId = "device-1";
  userId = null;
  subscribed = true;
  moduleParent = { mod: { id: MODULE, subject_id: SUBJECT }, subject: { id: SUBJECT, year_id: YEAR } };
  isSubscribedMock.mockClear();
  yearEntsMock.mockClear();
  yearEnts = { year: null, subjects: {} };
  activityMock.mockClear();
});

describe("GET /api/subscription-status", () => {
  it("answers the plain status without any section bodies", async () => {
    const res = await GET(req({ yearId: YEAR, subjectId: SUBJECT }));
    expect(await res.json()).toEqual({ subscribed: true, plan: { scope: "subject", until: UNTIL } });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(activityMock).not.toHaveBeenCalled();
  });

  it("reports locked for a visitor with no identity without querying", async () => {
    deviceId = null;
    expect(await (await GET(req({ yearId: YEAR }))).json()).toEqual({ subscribed: false });
    expect(isSubscribedMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/subscription-status — plan details", () => {
  it("describes a year pass covering the requested subject", async () => {
    isSubscribedMock.mockResolvedValueOnce({ scope: "year", until: "2027-01-31T00:00:00.000Z" });
    const body = await (await GET(req({ yearId: YEAR, subjectId: SUBJECT }))).json();
    expect(body).toEqual({ subscribed: true, plan: { scope: "year", until: "2027-01-31T00:00:00.000Z" } });
  });

  it("sends no plan to a reader without access", async () => {
    subscribed = false;
    expect(await (await GET(req({ yearId: YEAR, subjectId: SUBJECT }))).json()).toEqual({ subscribed: false });
  });
});

describe("GET /api/subscription-status?list=subjects", () => {
  it("lists the reader's unlocked subjects in the year", async () => {
    yearEnts = { year: null, subjects: { [SUBJECT]: { scope: "subject", until: UNTIL } } };
    const res = await GET(req({ yearId: YEAR, list: "subjects" }));
    expect(await res.json()).toEqual({
      subscribed: false,
      subjects: { [SUBJECT]: { scope: "subject", until: UNTIL } },
    });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(yearEntsMock).toHaveBeenCalledWith("device-1", YEAR, undefined);
  });

  it("reports a year pass as covering the whole year", async () => {
    yearEnts = { year: { scope: "year", until: UNTIL }, subjects: {} };
    expect(await (await GET(req({ yearId: YEAR, list: "subjects" }))).json()).toEqual({
      subscribed: true,
      plan: { scope: "year", until: UNTIL },
      subjects: {},
    });
  });

  it("answers empty without querying for a visitor with no identity", async () => {
    deviceId = null;
    expect(await (await GET(req({ yearId: YEAR, list: "subjects" }))).json()).toEqual({
      subscribed: false,
      subjects: {},
    });
    expect(yearEntsMock).not.toHaveBeenCalled();
  });

  it("refuses to combine the list with a subject or module", async () => {
    expect(await (await GET(req({ yearId: YEAR, subjectId: SUBJECT, list: "subjects" }))).json()).toEqual({
      subscribed: false,
    });
    expect(yearEntsMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/subscription-status?moduleId=", () => {
  it("adds the module's full activity bodies for a subscriber", async () => {
    const res = await GET(withModule());
    const body = await res.json();
    expect(body.subscribed).toBe(true);
    expect(body.sections[0].body_md).toBe("secret");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(activityMock).toHaveBeenCalledWith(MODULE, true);
    expect(isSubscribedMock).toHaveBeenCalledWith("device-1", YEAR, SUBJECT, undefined);
  });

  it("checks the session user too", async () => {
    deviceId = null;
    userId = "user-1";
    expect((await (await GET(withModule())).json()).sections).toHaveLength(1);
    expect(isSubscribedMock).toHaveBeenCalledWith("", YEAR, SUBJECT, "user-1");
  });

  it("sends no bodies to a visitor without a subscription", async () => {
    subscribed = false;
    expect(await (await GET(withModule())).json()).toEqual({ subscribed: false });
    expect(activityMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed module id, or one without a subject", async () => {
    expect(await (await GET(withModule({ moduleId: "x" }))).json()).toEqual({ subscribed: false });
    expect(await (await GET(req({ yearId: YEAR, moduleId: MODULE }))).json()).toEqual({ subscribed: false });
    expect(activityMock).not.toHaveBeenCalled();
  });

  it("rejects a module that doesn't belong to the named subject", async () => {
    moduleParent = { mod: null, subject: { id: SUBJECT, year_id: YEAR } };
    expect(await (await GET(withModule())).json()).toEqual({ subscribed: false });
    expect(activityMock).not.toHaveBeenCalled();
  });

  it("rejects a subject that doesn't belong to the named year (entitlement is per year/subject)", async () => {
    expect(await (await GET(withModule({ yearId: OTHER_YEAR }))).json()).toEqual({ subscribed: false });
    expect(isSubscribedMock).not.toHaveBeenCalled();
    expect(activityMock).not.toHaveBeenCalled();
  });
});
