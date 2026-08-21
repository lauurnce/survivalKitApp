import { describe, it, expect, vi } from "vitest";
import { validateCredentials } from "@/lib/auth/validateCredentials";

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("@/lib/supabase/ssrServer", () => ({
  createSSRServerClient: () => Promise.resolve({
    auth: {
      signUp,
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
}));
vi.mock("@/lib/auth/claim", () => ({ claimDeviceRows: vi.fn() }));

import { signUpAction } from "./actions";

describe("validateCredentials", () => {
  it("rejects a malformed email", () => {
    expect(validateCredentials("nope", "password123")).toMatch(/email/i);
  });
  it("rejects a short password", () => {
    expect(validateCredentials("a@b.com", "short")).toMatch(/password/i);
  });
  it("accepts valid input", () => {
    expect(validateCredentials("a@b.com", "password123")).toBeNull();
  });
});

describe("signUpAction", () => {
  it("does not expose authentication-provider errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "duplicate key violates auth.users_email_key" },
    });
    const form = new FormData();
    form.set("email", "student@example.com");
    form.set("password", "password123");

    try {
      const result = await signUpAction({}, form);

      expect(result).toEqual({ error: "Unable to create account. Please try again." });
      expect(JSON.stringify(result)).not.toContain("auth.users_email_key");
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});
