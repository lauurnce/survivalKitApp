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

// Controllable distributed rate limiter (real one is Supabase-backed).
let rateLimited = false;
const rateLimitCalls: Array<{ key: string; max: number; windowSeconds: number }> = [];
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(async (key: string, opts: { max: number; windowSeconds: number }) => {
    rateLimitCalls.push({ key, ...opts });
    return rateLimited;
  }),
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
  rateLimited = false;
  rateLimitCalls.length = 0;
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

  it("checks the shared distributed limiter with a 3-per-hour per-IP key", async () => {
    currentUserId = "user-42";
    const ip = "10.9.9.9";
    const req = { headers: { get: (h: string) => (h === "x-real-ip" ? ip : null) } } as unknown as import("next/server").NextRequest;

    await POST(req);
    expect(rateLimitCalls).toHaveLength(1);
    expect(rateLimitCalls[0].key).toBe("account-delete:ip:10.9.9.9");
    expect(rateLimitCalls[0].max).toBe(3);
    expect(rateLimitCalls[0].windowSeconds).toBe(3600);
  });

  it("returns 429 and never calls deleteAccount when the limiter rejects", async () => {
    currentUserId = "user-42";
    rateLimited = true;
    const res = await POST(makeReq());
    expect(res.status).toBe(429);
    expect(deleteAccountMock).not.toHaveBeenCalled();
  });
});
