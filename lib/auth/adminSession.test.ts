import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

// The admin cookie jar, driven per-test.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: () => (mockCookieValue ? { value: mockCookieValue } : undefined),
    }),
}));

const {
  createSessionToken,
  verifySessionToken,
  checkAdminPassword,
  getAdminSession,
  SESSION_COOKIE,
} = await import("./adminSession");

const SECRET = "test-admin-session-secret-at-least-32";
const TTL_MS = 8 * 60 * 60 * 1000;

// Mint a token the way the module does, but with an arbitrary payload, so we
// can forge expiry and shape without waiting eight hours.
function tokenWithPayload(payload: object, secret = SECRET): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

describe("adminSession", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
    mockCookieValue = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createSessionToken / verifySessionToken", () => {
    it("issues a token that verifies against the same secret", () => {
      expect(verifySessionToken(createSessionToken())).toBe(true);
    });

    it("throws rather than issuing an unsigned token when the secret is unset", () => {
      delete process.env.ADMIN_SESSION_SECRET;
      expect(() => createSessionToken()).toThrow(/ADMIN_SESSION_SECRET/);
    });

    it("throws rather than using a short signing secret", () => {
      process.env.ADMIN_SESSION_SECRET = "too-short";
      expect(() => createSessionToken()).toThrow(/at least 32/);
    });

    it("rejects a token whose payload was edited to extend its expiry", () => {
      const token = createSessionToken();
      const [, sig] = token.split(".");
      const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 10 * TTL_MS }))
        .toString("base64url");
      expect(verifySessionToken(`${forged}.${sig}`)).toBe(false);
    });

    it("rejects a token whose signature was tampered with", () => {
      const [payload, sig] = createSessionToken().split(".");
      const flipped = sig[0] === "A" ? `B${sig.slice(1)}` : `A${sig.slice(1)}`;
      expect(verifySessionToken(`${payload}.${flipped}`)).toBe(false);
    });

    it("rejects a token signed with a different secret", () => {
      const foreign = tokenWithPayload({ exp: Date.now() + TTL_MS }, "some-other-secret");
      expect(verifySessionToken(foreign)).toBe(false);
    });

    it("rejects a signature of a different length without throwing", () => {
      // timingSafeEqual throws on length mismatch; the guard must swallow it.
      const [payload] = createSessionToken().split(".");
      expect(verifySessionToken(`${payload}.short`)).toBe(false);
    });

    it("rejects an expired token", () => {
      expect(verifySessionToken(tokenWithPayload({ exp: Date.now() - 1000 }))).toBe(false);
    });

    it("rejects a token that expires exactly now", () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);
      expect(verifySessionToken(tokenWithPayload({ exp: now }))).toBe(false);
    });

    it("expires a freshly issued token once the 8 hour TTL elapses", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-07-26T00:00:00Z"));
      const token = createSessionToken();
      expect(verifySessionToken(token)).toBe(true);

      vi.setSystemTime(new Date("2026-07-26T07:59:00Z"));
      expect(verifySessionToken(token)).toBe(true);

      vi.setSystemTime(new Date("2026-07-26T08:00:01Z"));
      expect(verifySessionToken(token)).toBe(false);
    });

    it("rejects a correctly signed payload carrying no numeric exp", () => {
      expect(verifySessionToken(tokenWithPayload({}))).toBe(false);
      expect(verifySessionToken(tokenWithPayload({ exp: "later" }))).toBe(false);
    });

    it("rejects structurally invalid tokens", () => {
      for (const bad of ["", "no-dot-at-all", ".", "..", "garbage.garbage"]) {
        expect(verifySessionToken(bad)).toBe(false);
      }
    });
  });

  describe("checkAdminPassword", () => {
    it("accepts the configured password", () => {
      expect(checkAdminPassword("correct-horse-battery-staple")).toBe(true);
    });

    it("rejects a wrong password of the same length", () => {
      expect(checkAdminPassword("correct-horse-battery-stapla")).toBe(false);
    });

    it("rejects a wrong password of a different length without throwing", () => {
      expect(checkAdminPassword("nope")).toBe(false);
    });

    it("rejects an empty attempt", () => {
      expect(checkAdminPassword("")).toBe(false);
    });

    it("refuses every attempt when ADMIN_PASSWORD is unset", () => {
      delete process.env.ADMIN_PASSWORD;
      expect(checkAdminPassword("")).toBe(false);
      expect(checkAdminPassword("anything")).toBe(false);
    });
  });

  describe("getAdminSession", () => {
    it("is false when no admin cookie is present", async () => {
      mockCookieValue = undefined;
      expect(await getAdminSession()).toBe(false);
    });

    it("is false for a cookie holding a junk token", async () => {
      mockCookieValue = "not-a-real-token";
      expect(await getAdminSession()).toBe(false);
    });

    it("is true for a cookie holding a valid token", async () => {
      mockCookieValue = createSessionToken();
      expect(await getAdminSession()).toBe(true);
    });

    it("is false for a cookie holding an expired token", async () => {
      mockCookieValue = tokenWithPayload({ exp: Date.now() - 1 });
      expect(await getAdminSession()).toBe(false);
    });
  });

  describe("SESSION_COOKIE", () => {
    it("is httpOnly, strictly same-site, and scoped to /admin", () => {
      expect(SESSION_COOKIE.options).toMatchObject({
        httpOnly: true,
        sameSite: "strict",
        path: "/admin",
      });
    });

    it("expires in step with the token's own 8 hour TTL", () => {
      expect(SESSION_COOKIE.options.maxAge).toBe(TTL_MS / 1000);
    });

    it("sets the Secure flag when built for production", async () => {
      // SESSION_COOKIE is built at module load, so re-import under a
      // production NODE_ENV rather than reading the already-evaluated const.
      vi.resetModules();
      vi.stubEnv("NODE_ENV", "production");
      try {
        const prod = await import("./adminSession");
        expect(prod.SESSION_COOKIE.options.secure).toBe(true);
      } finally {
        vi.unstubAllEnvs();
        vi.resetModules();
      }
    });
  });
});
