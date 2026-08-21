import { describe, expect, it, vi, beforeEach } from "vitest";

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
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock("@/lib/supabase/ssrServer", () => ({
  createSSRServerClient: async () => ({ auth: { signUp } }),
}));
vi.mock("@/lib/auth/claim", () => ({ claimDeviceRows }));
vi.mock("@/lib/profileStore", () => ({ saveSignupSchool }));

const { signUpAction } = await import("./actions");

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
  signUp.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  saveSignupSchool.mockResolvedValue(undefined);
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
    expect(result).toEqual({ error: "taken" });
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
