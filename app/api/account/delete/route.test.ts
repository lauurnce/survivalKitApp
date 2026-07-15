import { describe, it, expect, vi, beforeEach } from "vitest";

let currentUserId: string | null = null;
const deleteAccountMock = vi.fn();

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({}),
}));

vi.mock("@/lib/deleteAccount", () => ({
  deleteAccount: (...args: unknown[]) => deleteAccountMock(...args),
}));

import { POST } from "./route";

let ipCounter = 0;
function makeReq() {
  const ip = `10.3.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  currentUserId = null;
  deleteAccountMock.mockReset();
  deleteAccountMock.mockResolvedValue({ ok: true });
});

describe("POST /api/account/delete", () => {
  it("401s when not signed in, and never calls deleteAccount", async () => {
    const res = await POST(makeReq());
    expect(res.status).toBe(401);
    expect(deleteAccountMock).not.toHaveBeenCalled();
  });

  it("deletes the calling user's own account — userId comes only from the session", async () => {
    currentUserId = "user-42";
    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(deleteAccountMock).toHaveBeenCalledWith(expect.anything(), "user-42");
  });

  it("500s and never throws when deleteAccount reports failure", async () => {
    currentUserId = "user-42";
    deleteAccountMock.mockResolvedValue({ ok: false, error: "boom" });
    const res = await POST(makeReq());
    expect(res.status).toBe(500);
  });

  it("rate limits repeated calls from the same IP", async () => {
    currentUserId = "user-42";
    const ip = "10.9.9.9";
    const reqWithIp = () =>
      ({ headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) } }) as unknown as import("next/server").NextRequest;

    let lastStatus = 0;
    for (let i = 0; i < 4; i++) {
      lastStatus = (await POST(reqWithIp())).status;
    }
    expect(lastStatus).toBe(429);
  });
});
