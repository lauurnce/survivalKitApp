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
const isSubscribedMock = vi.fn(async (..._args: unknown[]) => subscribed);
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
  isSubscribed: (...a: unknown[]) => isSubscribedMock(...a),
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
  activityMock.mockClear();
});

describe("GET /api/subscription-status", () => {
  it("answers the plain status without any section bodies", async () => {
    const res = await GET(req({ yearId: YEAR, subjectId: SUBJECT }));
    expect(await res.json()).toEqual({ subscribed: true });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(activityMock).not.toHaveBeenCalled();
  });

  it("reports locked for a visitor with no identity without querying", async () => {
    deviceId = null;
    expect(await (await GET(req({ yearId: YEAR }))).json()).toEqual({ subscribed: false });
    expect(isSubscribedMock).not.toHaveBeenCalled();
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
