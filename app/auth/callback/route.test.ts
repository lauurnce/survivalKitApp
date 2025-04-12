import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();
vi.mock("@/lib/supabase/ssrServer", () => ({
  createSSRServerClient: async () => ({ auth: { exchangeCodeForSession, verifyOtp } }),
}));

const { GET } = await import("./route");

async function get(query: string) {
  const res = await GET(new NextRequest(`https://app.test/auth/callback?${query}`));
  return { status: res.status, location: res.headers.get("location") };
}

beforeEach(() => {
  exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
  verifyOtp.mockReset().mockResolvedValue({ error: null });
});

describe("GET /auth/callback", () => {
  it("exchanges a recovery code and continues to the reset page", async () => {
    const res = await get("code=abc&next=/reset-password");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(res.location).toBe("https://app.test/reset-password");
  });

  it("verifies a type=recovery token hash", async () => {
    const res = await get("token_hash=th&type=recovery");
    expect(verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "th" });
    expect(res.location).toBe("https://app.test/reset-password");
  });

  it("sends an expired recovery link back to the request form", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { code: "otp_expired", status: 403 } });
    const res = await get("code=old&next=/reset-password");
    expect(res.location).toBe("https://app.test/forgot-password?error=expired");
  });

  it("treats a link with neither code nor token as failed", async () => {
    const res = await get("type=recovery&error=access_denied");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.location).toBe("https://app.test/forgot-password?error=expired");
  });

  it("never redirects off-site", async () => {
    const res = await get("code=abc&next=//evil.example/x");
    expect(res.location).toBe("https://app.test/account");
  });

  it("ignores an unknown OTP type", async () => {
    const res = await get("token_hash=th&type=bogus");
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(res.location).toBe("https://app.test/login");
  });
});
