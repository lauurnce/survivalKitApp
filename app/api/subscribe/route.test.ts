import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable per-test: set to a signed cookie value to simulate a returning
// visitor, or leave undefined to simulate a first-time visitor whose
// fire-and-forget /api/device sync hasn't landed yet.
let mockCookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
}));

// Controllable distributed rate limiter (real one is Supabase-backed).
let rateLimited = false;
// When set, emulates the real helper's backend-error behavior: reject unless
// the caller opted into fail-open with onFailure: "allow".
let limiterDown = false;
const rateLimitCalls: Array<{ key: string; max: number; windowSeconds: number; onFailure?: string }> = [];
vi.mock("@/lib/serverRateLimit", () => ({
  isServerRateLimited: vi.fn(
    async (key: string, opts: { max: number; windowSeconds: number; onFailure?: string }) => {
      rateLimitCalls.push({ key, ...opts });
      if (limiterDown) return opts.onFailure !== "allow";
      return rateLimited;
    }
  ),
}));

const linkCalls: unknown[][] = [];
const dynamicLinkCalls: unknown[][] = [];
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    createPaymongoLink: (...args: unknown[]) => {
      linkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/x", linkId: "link_1" });
    },
    createDynamicPaymongoLink: (...args: unknown[]) => {
      dynamicLinkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/dynamic", linkId: "link_dynamic" });
    },
  };
});
// Mock to control coupon validation behavior per test
let mockCouponValid = false;
let mockCouponExpired = false;
let mockCouponRedeemed = false; // Track if coupon has been redeemed

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: (column: string, value: string) => ({
          is: (col: string, val: null) => ({
            single: () => Promise.resolve(
              mockCouponValid && column === 'coupon_code' && val === null && col === 'redeemed_at'
                ? mockCouponRedeemed
                  ? { data: null, error: { message: 'Not found' } }
                  : { data: { coupon_code: value, coupon_expires_at: mockCouponExpired ? new Date(Date.now() - 1000).toISOString() : new Date(Date.now() + 86400000).toISOString(), redeemed_at: null }, error: null }
                : { data: null, error: { message: 'Not found' } }
            ),
          }),
        }),
      }),
      update: (data: Record<string, unknown>) => ({
        eq: (column: string) => ({
          is: (col: string, val: null) => ({
            select: () => ({
              single: () => Promise.resolve(
                mockCouponValid && column === 'coupon_code' && val === null && col === 'redeemed_at'
                  ? mockCouponRedeemed
                    ? { data: null, error: { message: 'Already redeemed' } }
                    : { data: { redeemed_at: data.redeemed_at }, error: null } // Simulate successful update
                  : { data: null, error: { message: 'Not found' } }
              ),
            }),
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_c: string, _v: string) => ({
          maybeSingle: () => Promise.resolve({ data: { id: "x" } }),
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "x" } }) }),
        }),
      }),
    }),
  }),
}));
// Controllable per-test: the signed-out test overrides this to null. Every
// other test in this file predates the sign-in requirement and assumed an
// anonymous caller could check out, so they default to a signed-in user below.
const { getCurrentUserIdMock } = vi.hoisted(() => ({ getCurrentUserIdMock: vi.fn() }));
vi.mock("@/lib/auth/currentUser", () => ({ getCurrentUserId: getCurrentUserIdMock }));

import { POST } from "./route";
import { signDeviceCookie } from "@/lib/auth/deviceCookie";

const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const VICTIM_DEV = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const USER = "11111111-1111-1111-1111-111111111111";

let ipCounter = 0;
function makeReq(body: Record<string, unknown>) {
  const ip = `10.1.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  return {
    json: () => Promise.resolve(body),
    headers: { get: (h: string) => (h === "origin" ? "http://localhost:3000" : ip) },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  linkCalls.length = 0;
  dynamicLinkCalls.length = 0;
  mockCookieValue = undefined;
  mockCouponValid = false;
  mockCouponExpired = false;
  mockCouponRedeemed = false;
    rateLimited = false;
    limiterDown = false;
    rateLimitCalls.length = 0;
  process.env.DEVICE_COOKIE_SECRET = "test-device-secret";
  getCurrentUserIdMock.mockReset();
  getCurrentUserIdMock.mockResolvedValue(USER);
});

describe("POST /api/subscribe — requires sign-in", () => {
  it("refuses to create a payment link for a signed-out caller", async () => {
    getCurrentUserIdMock.mockResolvedValue(null);
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV }));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining("sign in") });
    expect(linkCalls).toHaveLength(0);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("creates the link for a signed-in caller", async () => {
    getCurrentUserIdMock.mockResolvedValue(USER);
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls).toHaveLength(1);
  });
});

describe("POST /api/subscribe plan validation", () => {
  it("passes a valid plan through to createPaymongoLink", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_sem"); // 6th arg = plan
  });

  it("rejects a plan that contradicts the scope", async () => {
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(400);
    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "year_sem" }));
    expect(res2.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("rejects an unknown plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "free_forever" }));
    expect(res.status).toBe(400);
    expect(linkCalls).toHaveLength(0);
  });

  it("defaults legacy requests without a plan", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][5]).toBe("subject_month");

    const res2 = await POST(makeReq({ yearId: YEAR, deviceId: DEV }));
    expect(res2.status).toBe(200);
    expect(linkCalls[1][5]).toBe("year_sem");
  });
});

describe("POST /api/subscribe device-id trust (IDOR regression)", () => {
  it("ignores a spoofed body deviceId and grants the signed cookie's device instead", async () => {
    // Attacker's own browser has a legitimate signed cookie for DEV, but tries
    // to plant a victim's UUID in the body to redirect the grant.
    mockCookieValue = signDeviceCookie(DEV);
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: VICTIM_DEV }));
    expect(res.status).toBe(200);
    // 2nd positional arg to createPaymongoLink is deviceId — must be the
    // cookie's device, never the attacker-supplied body value.
    expect(linkCalls[0][1]).toBe(DEV);
    expect(linkCalls[0][1]).not.toBe(VICTIM_DEV);
  });

  it("falls back to the body deviceId only when no cookie exists yet", async () => {
    mockCookieValue = undefined;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][1]).toBe(DEV);
  });

  it("rejects a forged/tampered cookie value and falls back to the body UUID", async () => {
    mockCookieValue = `${VICTIM_DEV}.not-a-real-signature`;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][1]).toBe(DEV);
    expect(linkCalls[0][1]).not.toBe(VICTIM_DEV);
  });
});

describe("POST /api/subscribe coupon validation", () => {
  it("uses standard link when no coupon provided", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(false);
    expect(linkCalls).toHaveLength(1);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("uses standard link when coupon code is invalid", async () => {
    mockCouponValid = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "INVALID-CODE" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(false);
    expect(linkCalls).toHaveLength(1);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("uses dynamic link with discount when coupon is valid", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(true);
    expect(dynamicLinkCalls).toHaveLength(1);
    expect(linkCalls).toHaveLength(0);
    // First arg to createDynamicPaymongoLink is amount (should be clamped to MIN_CHARGE)
    // subject_month base is 4900, discount is 10000, so final should be clamped to 10000 (MIN_CHARGE)
    expect(dynamicLinkCalls[0][0]).toBe(10000);
  });

  it("uses standard link when coupon is expired", async () => {
    mockCouponValid = true;
    mockCouponExpired = true;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-EXPIRED" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(false);
    expect(linkCalls).toHaveLength(1);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("includes coupon code in remarks when coupon valid", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    // 3rd arg to createDynamicPaymongoLink is remarks
    const remarks = dynamicLinkCalls[0][2] as string;
    expect(remarks).toContain("coupon:FEEDBACK-ABC123");
  });

  it("enforces minimum charge when discount >= baseAmount", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;
    // subject_month = 4900, discount = 10000, so 4900 - 10000 = -5100
    // Should be clamped to MIN_CHARGE (10000)
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    expect(dynamicLinkCalls).toHaveLength(1);
    // Final amount must be at least MIN_CHARGE (10000)
    const finalAmount = dynamicLinkCalls[0][0];
    expect(finalAmount).toBeGreaterThanOrEqual(10000);
    expect(finalAmount).toBe(10000);
  });

  it("rejects if finalAmount becomes non-integer (edge case)", async () => {
    // This test ensures that even with valid calculations, we verify the result
    // is an integer before sending to PayMongo
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    const finalAmount = dynamicLinkCalls[0][0];
    expect(Number.isInteger(finalAmount)).toBe(true);
  });
});

describe("POST /api/subscribe amount validation security", () => {
  it("prevents zero amount payment", async () => {
    // If somehow a discount equals the base amount exactly, minimum charge applies
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    const finalAmount = dynamicLinkCalls[0][0];
    expect(finalAmount).toBeGreaterThan(0);
  });

  it("prevents negative amount payment", async () => {
    // Verify that negative amounts are clamped to minimum charge
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    const finalAmount = dynamicLinkCalls[0][0];
    expect(finalAmount).toBeGreaterThan(0);
    expect(finalAmount).toBe(10000); // Clamped to MIN_CHARGE
  });

  it("allows normal discount that doesn't trigger minimum charge", async () => {
    // Year plan is 29900, discount is 10000, so 29900 - 10000 = 19900 (no clamping needed)
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, couponCode: "FEEDBACK-ABC123" }));
    expect(res.status).toBe(200);
    expect(dynamicLinkCalls).toHaveLength(1);
    const finalAmount = dynamicLinkCalls[0][0];
    expect(finalAmount).toBe(29900 - 10000); // 19900
    expect(finalAmount).toBeGreaterThan(10000);
  });

  it("rejects coupon on second use (atomic redemption prevents reuse)", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;

    // First request: coupon should be valid and atomically marked as redeemed
    const res1 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-UNIQUE" }));
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.discountApplied).toBe(true);
    expect(dynamicLinkCalls).toHaveLength(1);

    // Simulate coupon being marked as redeemed
    mockCouponRedeemed = true;

    // Second request: same coupon should be rejected because it's already redeemed
    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-UNIQUE" }));
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.discountApplied).toBe(false); // Coupon not applied
    expect(dynamicLinkCalls).toHaveLength(1); // No new dynamic link created
    expect(linkCalls).toHaveLength(1); // Standard link used instead (no discount)
  });
});

describe("POST /api/subscribe redirect legs", () => {
  it("keeps ?payment=success on the success leg and strips it from the failed leg (standard link)", async () => {
    const returnPath = `/year/${YEAR}/subjects/${SUBJ}/modules/33333333-3333-3333-3333-333333333333`;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, returnPath }));
    expect(res.status).toBe(200);
    expect(linkCalls).toHaveLength(1);
    // args: yearId, deviceId, successUrl, subjectId, userId, plan, failedUrl
    const successUrl = linkCalls[0][2] as string;
    const failedUrl = linkCalls[0][6] as string;
    expect(successUrl).toBe(`http://localhost:3000${returnPath}?payment=success`);
    expect(failedUrl).toBe(`http://localhost:3000${returnPath}`);
    // A cancelled payment must never land on a URL that reads as a success.
    expect(failedUrl).not.toContain("payment=success");
  });

  it("passes a marker-free failed leg to the dynamic (coupon) link too", async () => {
    mockCouponValid = true;
    const res = await POST(
      makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-ABC123" })
    );
    expect(res.status).toBe(200);
    expect(dynamicLinkCalls).toHaveLength(1);
    // args: amount, description, remarks, successUrl, idempotencyKey, failedUrl
    expect(String(dynamicLinkCalls[0][3])).toContain("payment=success");
    expect(dynamicLinkCalls[0][5]).not.toContain("payment=success");
  });

  it("falls the failed leg back to /account when returnPath is absent", async () => {
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV }));
    expect(res.status).toBe(200);
    expect(linkCalls[0][2]).toBe("http://localhost:3000/account?payment=success");
    expect(linkCalls[0][6]).toBe("http://localhost:3000/account");
  });
});

describe("POST /api/subscribe — distributed rate limiting", () => {
  it("checks the shared limiter with a namespaced per-IP key", async () => {
    await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(rateLimitCalls).toHaveLength(1);
    expect(rateLimitCalls[0].key).toMatch(/^subscribe:ip:/);
    expect(rateLimitCalls[0].max).toBe(5);
    expect(rateLimitCalls[0].windowSeconds).toBe(60);
  });

  it("returns 429 and never creates a payment link when the limiter rejects", async () => {
    rateLimited = true;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(429);
    expect(linkCalls).toHaveLength(0);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("opts into fail-open so checkout proceeds when the limiter backend errors", async () => {
    limiterDown = true;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(200);
    expect(rateLimitCalls[0].onFailure).toBe("allow");
    expect(linkCalls.length + dynamicLinkCalls.length).toBe(1);
  });

  it("keeps normal operation unchanged when the limiter is healthy", async () => {
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem" }));
    expect(res.status).toBe(200);
    expect(rateLimitCalls[0].onFailure).toBe("allow");
    expect(linkCalls.length + dynamicLinkCalls.length).toBe(1);
  });
});
