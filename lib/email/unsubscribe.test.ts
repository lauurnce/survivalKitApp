import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isUnsubscribed,
  listUnsubscribeHeaders,
  signUnsubscribeToken,
  unsubscribeUrl,
  verifyUnsubscribeToken,
} from "./unsubscribe";

const USER = "11111111-2222-4333-8444-555555555555";
const SECRET = "test-unsubscribe-secret-at-least-32-chars";

beforeEach(() => {
  process.env.EMAIL_UNSUBSCRIBE_SECRET = SECRET;
  delete process.env.EMAIL_UNSUBSCRIBE_SECRET_PREVIOUS;
});
afterEach(() => {
  delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
  delete process.env.EMAIL_UNSUBSCRIBE_SECRET_PREVIOUS;
});

describe("unsubscribe tokens", () => {
  it("round-trips", () => {
    expect(verifyUnsubscribeToken(USER, signUnsubscribeToken(USER))).toBe(true);
  });

  it("rejects missing, malformed, and tampered input", () => {
    const t = signUnsubscribeToken(USER);
    expect(verifyUnsubscribeToken(null, t)).toBe(false);
    expect(verifyUnsubscribeToken(USER, null)).toBe(false);
    expect(verifyUnsubscribeToken("not-a-uuid", t)).toBe(false);
    expect(verifyUnsubscribeToken(USER, `${t}x`)).toBe(false);
  });

  it("keeps links from before a rotation working via the _PREVIOUS secret", () => {
    const old = signUnsubscribeToken(USER);
    process.env.EMAIL_UNSUBSCRIBE_SECRET_PREVIOUS = SECRET;
    process.env.EMAIL_UNSUBSCRIBE_SECRET = "rotated-unsubscribe-secret-32-chars-long";
    expect(verifyUnsubscribeToken(USER, old)).toBe(true);
  });

  it("refuses to build a link without a usable secret", () => {
    process.env.EMAIL_UNSUBSCRIBE_SECRET = "short";
    expect(() => unsubscribeUrl(USER)).toThrow(/at least 32/);
    delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
    expect(() => unsubscribeUrl(USER)).toThrow(/not set/);
    expect(verifyUnsubscribeToken(USER, "anything")).toBe(false);
  });
});

describe("unsubscribeUrl", () => {
  it("points at the canonical unsubscribe endpoint with a verifiable token", () => {
    const url = new URL(unsubscribeUrl(USER));
    expect(url.origin + url.pathname).toBe("https://tryi2i.com/api/email/unsubscribe");
    expect(url.searchParams.get("u")).toBe(USER);
    expect(verifyUnsubscribeToken(USER, url.searchParams.get("t"))).toBe(true);
  });
});

describe("listUnsubscribeHeaders", () => {
  it("emits the RFC 8058 one-click pair", () => {
    expect(listUnsubscribeHeaders("https://x.test/u")).toEqual({
      "List-Unsubscribe": "<https://x.test/u>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  });
});

describe("isUnsubscribed", () => {
  function client(result: { data: unknown; error: { message: string } | null }) {
    return {
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve(result) }) }) }),
    } as never;
  }

  it("is true when a row exists and false when none does", async () => {
    expect(await isUnsubscribed(client({ data: { user_id: USER }, error: null }), USER)).toBe(true);
    expect(await isUnsubscribed(client({ data: null, error: null }), USER)).toBe(false);
  });

  it("throws on a read error so marketing sends fail closed", async () => {
    await expect(isUnsubscribed(client({ data: null, error: { message: "down" } }), USER)).rejects.toThrow("down");
  });
});
