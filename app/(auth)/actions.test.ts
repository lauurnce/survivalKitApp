import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateCredentials } from "@/lib/auth/validateCredentials";

const signUp = vi.fn();
const saveSignupSchool = vi.fn();
const claimDeviceRows = vi.fn();

vi.mock("next/navigation", () => ({
  // The real redirect() throws NEXT_REDIRECT as control flow; mirror that so
  // the action's success path terminates the same way it does in production.
  redirect: (to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to });
  },
}));

const signInWithPassword = vi.fn();
vi.mock("@/lib/supabase/ssrServer", () => ({
  createSSRServerClient: async () => ({ auth: { signUp, signInWithPassword } }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock("@/lib/auth/claim", () => ({ claimDeviceRows }));
vi.mock("@/lib/profileStore", () => ({ saveSignupSchool }));

const { signUpAction, signInAction } = await import("./actions");

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = {
  email: "student@example.com",
  password: "hunter2hunter2",
  university: "PUP",
  schoolType: "Public",
  next: "/account",
};

async function run(fields: Record<string, string>) {
  try {
    return await signUpAction({}, form(fields));
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") return { redirected: true };
    throw e;
  }
}

beforeEach(() => {
  signUp.mockReset();
  saveSignupSchool.mockReset();
  claimDeviceRows.mockReset();
  signUp.mockResolvedValue({
    data: { user: { id: "user-1", identities: [{ id: "i1" }] }, session: { access_token: "t" } },
    error: null,
  });
  saveSignupSchool.mockResolvedValue(undefined);
});

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

describe("signUpAction — school is required", () => {
  it("refuses a signup with no school", async () => {
    const result = await run({ ...valid, university: "" });
    expect(result).toEqual({
      error: "Choose your school so we can set up your campus.",
    });
  });

  it("does not create an account when the school is missing", async () => {
    await run({ ...valid, university: "" });
    expect(signUp).not.toHaveBeenCalled();
  });

  it("refuses a signup with no sector", async () => {
    const result = await run({ ...valid, schoolType: "" });
    expect(result).toEqual({
      error: "Tell us whether your school is public or private.",
    });
  });

  it("does not create an account when the sector is missing", async () => {
    await run({ ...valid, schoolType: "" });
    expect(signUp).not.toHaveBeenCalled();
  });

  it("checks the credentials before the school, so the first error is the first field", async () => {
    const result = await run({ ...valid, email: "", university: "" });
    expect(result).not.toEqual({
      error: "Choose your school so we can set up your campus.",
    });
    expect(signUp).not.toHaveBeenCalled();
  });
});

describe("signUpAction — storing the answers", () => {
  it("saves the school against the new user", async () => {
    await run(valid);
    expect(saveSignupSchool).toHaveBeenCalledWith("user-1", {
      university: "Polytechnic University of the Philippines",
      schoolType: "Public",
    });
  });

  it("stores the canonical catalog name, not the acronym typed", async () => {
    await run({ ...valid, university: "pup" });
    expect(saveSignupSchool.mock.calls[0][1].university).toBe(
      "Polytechnic University of the Philippines"
    );
  });

  it("stores a school outside the catalog as typed", async () => {
    await run({ ...valid, university: "Cavite State University" });
    expect(saveSignupSchool.mock.calls[0][1].university).toBe("Cavite State University");
  });

  it("does not store a school when the account could not be created", async () => {
    signUp.mockResolvedValue({ data: { user: null }, error: { message: "taken" } });
    const result = await run(valid);
    // The provider message is redacted (PR #19) — but the point of this test
    // is that a failed signup never persists school answers.
    expect(result).toEqual({ error: "Unable to create account. Please try again." });
    expect(saveSignupSchool).not.toHaveBeenCalled();
  });

  it("still finishes the signup when storing the school fails", async () => {
    // The account exists by this point. Failing the whole signup would strand
    // the student on an error page for an account they now own.
    saveSignupSchool.mockRejectedValue(new Error("db down"));
    const result = await run(valid);
    expect(result).toEqual({ redirected: true });
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
    // School answers are validated before signUp runs, so the redaction path
    // is only reachable with them present.
    form.set("university", "PUP");
    form.set("schoolType", "Public");

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

describe("signUpAction — return path", () => {
  async function redirectTarget(next: string) {
    try {
      await signUpAction({}, form({ ...valid, next }));
    } catch (e) {
      return (e as { to?: string }).to;
    }
    return undefined;
  }

  it("returns to the module with ?print=1 intact", async () => {
    expect(await redirectTarget("/year/y1/subjects/s1/modules/m1?print=1")).toBe(
      "/year/y1/subjects/s1/modules/m1?print=1",
    );
  });

  it("never redirects off-site, whatever the hidden field says", async () => {
    for (const evil of ["//evil.com", "https://evil.com", "/\\evil.com", "/%2F%2Fevil.com"]) {
      expect(await redirectTarget(evil)).toBe("/account");
    }
  });
});

describe("signUpAction — provider errors become clear messages", () => {
  const cases: [Record<string, unknown>, RegExp][] = [
    [{ code: "user_already_exists", status: 422 }, /already exists.*log in/i],
    [{ code: "email_exists", status: 422 }, /already exists/i],
    [{ code: "weak_password", status: 422 }, /too easy to guess/i],
    [{ code: "email_address_invalid", status: 400 }, /can't be used/i],
    [{ code: "over_request_rate_limit", status: 429 }, /too many attempts/i],
    [{ status: 429 }, /too many attempts/i],
    [{ code: "over_email_send_rate_limit", status: 429 }, /too many attempts/i],
    [{ code: "signup_disabled", status: 422 }, /paused/i],
    [{ code: "unexpected_failure", status: 500 }, /^Unable to create account/],
  ];
  for (const [err, expected] of cases) {
    it(`${err.code ?? err.status} → ${expected}`, async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { ...err, message: "internal provider detail" },
      });
      const result = (await run(valid)) as { error?: string };
      consoleError.mockRestore();
      expect(result.error).toMatch(expected);
      expect(result.error).not.toContain("internal provider detail");
      expect(claimDeviceRows).not.toHaveBeenCalled();
    });
  }
});

describe("signUpAction — email confirmation", () => {
  it("asks the student to confirm instead of redirecting them signed out", async () => {
    signUp.mockResolvedValueOnce({
      data: { user: { id: "user-1", identities: [{ id: "i1" }] }, session: null },
      error: null,
    });
    const result = await run(valid);
    expect(result).toEqual({ notice: expect.stringMatching(/confirm your email/i) });
    expect(claimDeviceRows).not.toHaveBeenCalled();
    expect(saveSignupSchool).toHaveBeenCalledWith("user-1", expect.anything());
  });

  it("answers an obfuscated duplicate identically and writes nothing for it", async () => {
    signUp.mockResolvedValueOnce({
      data: { user: { id: "fake", identities: [] }, session: null },
      error: null,
    });
    const result = await run(valid);
    expect(result).toEqual({ notice: expect.stringMatching(/confirm your email/i) });
    expect(saveSignupSchool).not.toHaveBeenCalled();
    expect(claimDeviceRows).not.toHaveBeenCalled();
  });

  it("points the confirmation link at the canonical login page with the return path", async () => {
    await run({ ...valid, next: "/year/y1/subjects/s1/modules/m1?print=1" });
    const redirectTo = signUp.mock.calls[0][0].options.emailRedirectTo as string;
    const url = new URL(redirectTo);
    expect(url.origin).toBe("https://tryi2i.com");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe("/year/y1/subjects/s1/modules/m1?print=1");
  });
});

describe("signUpAction — email normalisation", () => {
  it("trims and lowercases the email before creating the account", async () => {
    await run({ ...valid, email: "  Student@Example.COM " });
    expect(signUp.mock.calls[0][0].email).toBe("student@example.com");
  });
});

describe("validateCredentials — upper bound", () => {
  it("rejects a password longer than bcrypt reads", () => {
    expect(validateCredentials("a@b.com", "x".repeat(73))).toMatch(/at most 72/);
  });
});

describe("signInAction", () => {
  async function login(fields: Record<string, string>) {
    try {
      return await signInAction({}, form(fields));
    } catch (e) {
      if (e instanceof Error && e.message === "NEXT_REDIRECT") return { redirected: true };
      throw e;
    }
  }

  it("does not say whether the email exists", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "invalid_credentials", status: 400, message: "Invalid login credentials" },
    });
    expect(await login(valid)).toEqual({ error: "Invalid email or password." });
  });

  it("tells a rate-limited student to wait", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { code: "over_request_rate_limit", status: 429, message: "x" },
    });
    expect(await login(valid)).toEqual({ error: expect.stringMatching(/too many attempts/i) });
  });

  it("follows the return path on success", async () => {
    signInWithPassword.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    expect(await login(valid)).toEqual({ redirected: true });
  });
});
