import { describe, it, expect, vi, beforeEach } from "vitest";

let currentUserId: string | null = null;
let profile: { firstName: string } | null = null;
let profileThrows = false;

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

vi.mock("@/lib/profileStore", () => ({
  getProfile: () => {
    if (profileThrows) return Promise.reject(new Error("db down"));
    return Promise.resolve(profile);
  },
}));

import { GET } from "./route";

beforeEach(() => {
  currentUserId = null;
  profile = null;
  profileThrows = false;
});

describe("GET /api/me", () => {
  it("returns null firstName when signed out", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null });
  });

  it("returns the profile first name when signed in with a profile", async () => {
    currentUserId = "user-1";
    profile = { firstName: "Andrea" };
    expect(await (await GET()).json()).toEqual({ firstName: "Andrea" });
  });

  it("returns null firstName when signed in without a profile", async () => {
    currentUserId = "user-1";
    expect(await (await GET()).json()).toEqual({ firstName: null });
  });

  it("returns null firstName instead of erroring when the store throws", async () => {
    currentUserId = "user-1";
    profileThrows = true;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ firstName: null });
  });
});
