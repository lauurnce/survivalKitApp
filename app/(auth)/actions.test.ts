import { describe, it, expect } from "vitest";
import { validateCredentials } from "@/lib/auth/validateCredentials";

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
