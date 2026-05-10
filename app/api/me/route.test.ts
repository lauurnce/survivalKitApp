import { describe, it, expect, vi, beforeEach } from "vitest";

let currentUserId: string | null = null;
let profile: { firstName: string } | null = null;
let profileThrows = false;

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

let overviewThrows = false;
vi.mock("@/lib/account", () => ({
  getAccountOverview: () =>
    overviewThrows
      ? Promise.reject(new Error("db down"))
      : Promise.resolve({ overallDone: 3, overallTotal: 12, subjects: [] }),
}));

vi.mock("@/lib/profileStore", () => ({
  getProfile: () => {
    if (profileThrows) return Promise.reject(new Error("db down"));
    return Promise.resolve(profile);
  },
}));

import { NextRequest } from "next/server";
import { GET } from "./route";

const withOverview = () => new NextRequest("http://localhost/api/me?overview=1");

beforeEach(() => {
  currentUserId = null;
  profile = null;
  profileThrows = false;
  overviewThrows = false;
});

describe("GET /api/me", () => {
  it("returns null firstName when signed out", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null, signedIn: false });
  });

  it("returns the profile first name when signed in with a profile", async () => {
    currentUserId = "user-1";
    profile = { firstName: "Andrea" };
    expect(await (await GET()).json()).toEqual({ firstName: "Andrea", signedIn: true, userId: "user-1" });
  });

  it("returns null firstName when signed in without a profile", async () => {
    currentUserId = "user-1";
    expect(await (await GET()).json()).toEqual({ firstName: null, signedIn: true, userId: "user-1" });
  });

  it("returns null firstName instead of erroring when the store throws", async () => {
    currentUserId = "user-1";
    profileThrows = true;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null, signedIn: true, userId: "user-1" });
  });

  it("is never cacheable", async () => {
    expect((await GET()).headers.get("cache-control")).toBe("private, no-store");
  });

  it("adds nav-rail progress only when ?overview=1 is asked for", async () => {
    currentUserId = "user-1";
    expect(await (await GET(withOverview())).json()).toEqual({
      firstName: null,
      signedIn: true,
      userId: "user-1",
      overview: { overallDone: 3, overallTotal: 12 },
    });
  });

  it("never computes an overview for a signed-out visitor", async () => {
    expect(await (await GET(withOverview())).json()).toEqual({ firstName: null, signedIn: false });
  });

  it("degrades a failed overview to null instead of erroring", async () => {
    currentUserId = "user-1";
    overviewThrows = true;
    const res = await GET(withOverview());
    expect(res.status).toBe(200);
    expect((await res.json()).overview).toBeNull();
  });
});
