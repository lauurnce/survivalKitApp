import { describe, expect, it, vi, beforeEach } from "vitest";
import { RATE_LIMITED, RESET_EMAIL_SENT, RESET_LINK_EXPIRED } from "@/lib/auth/authErrors";

const resetPasswordForEmail = vi.fn();
const getUser = vi.fn();
const updateUser = vi.fn();
const isServerRateLimited = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-real-ip": "203.0.113.9" }),
}));
vi.mock("@/lib/supabase/ssrServer", () => ({
  createSSRServerClient: async () => ({ auth: { resetPasswordForEmail, getUser, updateUser } }),
}));
vi.mock("@/lib/serverRateLimit", () => ({ isServerRateLimited }));

const { requestPasswordResetAction, updatePasswordAction } = await import("./passwordActions");

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function update(fields: Record<string, string>): Promise<{ error?: string; notice?: string; redirectedTo?: string }> {
  try {
    return await updatePasswordAction({}, form(fields));
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") return { redirectedTo: (e as Error & { to: string }).to };
    throw e;
  }
}

beforeEach(() => {
  vi.unstubAllEnvs();
  resetPasswordForEmail.mockReset().mockResolvedValue({ data: {}, error: null });
  getUser.mockReset().mockResolvedValue({ data: { user: { id: "user-1" } } });
  updateUser.mockReset().mockResolvedValue({ data: {}, error: null });
  isServerRateLimited.mockReset().mockResolvedValue(false);
});

describe("requestPasswordResetAction", () => {
  it("sends the reset email with a link to the auth callback on the app's origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ORIGIN", "https://example.test");
    const result = await requestPasswordResetAction({}, form({ email: "  Student@Example.com " }));
    expect(result).toEqual({ notice: RESET_EMAIL_SENT });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("student@example.com", {
      redirectTo: "https://example.test/auth/callback?next=/reset-password",
    });
  });

  it("answers an unknown address exactly like a known one", async () => {
    resetPasswordForEmail.mockResolvedValue({ data: null, error: { code: "user_not_found", status: 400, message: "x" } });
    const unknown = await requestPasswordResetAction({}, form({ email: "nobody@example.com" }));
    resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const known = await requestPasswordResetAction({}, form({ email: "student@example.com" }));
    expect(unknown).toEqual(known);
  });

  it("rejects a malformed email without calling Supabase", async () => {
    const result = await requestPasswordResetAction({}, form({ email: "nope" }));
    expect(result.error).toMatch(/email/i);
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("rate-limits by connection", async () => {
    isServerRateLimited.mockImplementation(async (key: string) => key.startsWith("pwreset:ip:"));
    const result = await requestPasswordResetAction({}, form({ email: "student@example.com" }));
    expect(result).toEqual({ error: RATE_LIMITED });
    expect(isServerRateLimited).toHaveBeenCalledWith("pwreset:ip:203.0.113.9", expect.any(Object));
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("silently stops mailing a capped address, with the same answer", async () => {
    isServerRateLimited.mockImplementation(async (key: string) => key.startsWith("pwreset:email:"));
    const result = await requestPasswordResetAction({}, form({ email: "student@example.com" }));
    expect(result).toEqual({ notice: RESET_EMAIL_SENT });
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });
});

describe("updatePasswordAction", () => {
  const good = { password: "newpassword1", confirmPassword: "newpassword1" };

  it("applies the signup minimum of 8 characters", async () => {
    const result = await update({ password: "short", confirmPassword: "short" });
    expect(result).toEqual({ error: "Password must be at least 8 characters." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("requires the confirmation to match", async () => {
    const result = await update({ password: "newpassword1", confirmPassword: "newpassword2" });
    expect(result.error).toMatch(/match/i);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("refuses without a recovery session", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect(await update(good)).toEqual({ error: RESET_LINK_EXPIRED });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the password and goes to the account page", async () => {
    expect(await update(good)).toEqual({ redirectedTo: "/account" });
    expect(updateUser).toHaveBeenCalledWith({ password: "newpassword1" });
  });

  it("maps a provider error to a student-facing sentence", async () => {
    updateUser.mockResolvedValue({ data: null, error: { code: "same_password", status: 422, message: "internal" } });
    const result = await update(good);
    expect(result.error).toMatch(/current password/i);
    expect(result.error).not.toContain("internal");
  });
});
