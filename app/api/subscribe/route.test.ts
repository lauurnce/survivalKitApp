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
let dynamicLinkShouldThrow = false;
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    createPaymongoLink: (...args: unknown[]) => {
      linkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/x", linkId: "link_1" });
    },
    createDynamicPaymongoLink: (...args: unknown[]) => {
      if (dynamicLinkShouldThrow) {
        return Promise.reject(new Error("PayMongo error: gateway down"));
      }
      dynamicLinkCalls.push(args);
      return Promise.resolve({ checkoutUrl: "https://pm.link/dynamic", linkId: "link_dynamic" });
    },
  };
});

// Free unlocks grant through recordPayment instead of a PayMongo link. The
// mock records every call so tests can assert both the entitlement input and
// the zero-value ledger row.
const recordedPayments: Array<Record<string, unknown>> = [];
let recordPaymentThrows = false;
// "deduped" simulates the ledger already holding this link (replay/re-entry).
let recordPaymentMode: "ok" | "deduped" = "ok";
vi.mock("@/lib/payments", () => ({
  recordPayment: (_supabase: unknown, input: Record<string, unknown>) => {
    if (recordPaymentThrows) return Promise.reject(new Error("ledger down"));
    recordedPayments.push(input);
    return Promise.resolve(
      recordPaymentMode === "deduped"
        ? { recorded: false, deduped: true }
        : { recorded: true, deduped: false }
    );
  },
}));

// Mock to control coupon validation behavior per test
let mockCouponValid = false;
let mockCouponExpired = false;
let mockCouponRedeemed = false; // Track if coupon has been redeemed
// When set, the atomic reserve UPDATE returns a row only this many times
// before reporting "already redeemed" — models two requests racing on one
// coupon regardless of the mockCouponRedeemed flag.
let atomicReserveSuccesses: number | null = null;
// Release-path calls (redeemed_at flipped back to null via .not(...)).
const releaseCalls: Array<Record<string, unknown>> = [];

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
        eq: (column: string, value: string) => ({
          is: (col: string, val: null) => ({
            select: () => ({
              single: () => {
                const reserveWins =
                  atomicReserveSuccesses === null
                    ? !mockCouponRedeemed
                    : atomicReserveSuccesses > 0;
                if (atomicReserveSuccesses !== null) atomicReserveSuccesses--;
                return Promise.resolve(
                  mockCouponValid && column === 'coupon_code' && val === null && col === 'redeemed_at' && reserveWins
                    ? { data: { redeemed_at: data.redeemed_at }, error: null } // Simulate successful update
                    : { data: null, error: { message: 'Already redeemed' } }
                );
              },
            }),
          }),
          // Release path: update(...).eq('coupon_code', c).not('redeemed_at','is',null)
          not: (col: string, op: string, val: null) => {
            releaseCalls.push({ column, value, col, op, val, redeemed_to: data.redeemed_at });
            return Promise.resolve({ data: null, error: null });
          },
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
  dynamicLinkShouldThrow = false;
  recordedPayments.length = 0;
  recordPaymentThrows = false;
  recordPaymentMode = "ok";
  releaseCalls.length = 0;
  atomicReserveSuccesses = null;
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

  it("charges the plan minus the face value on year_sem when coupon is valid", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-TESTTEST" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(true);
    expect(dynamicLinkCalls).toHaveLength(1);
    expect(linkCalls).toHaveLength(0);
    // First arg to createDynamicPaymongoLink is amount: 29900 - 10000 = 19900.
    // No floor clamps it back up — the discount is real.
    expect(dynamicLinkCalls[0][0]).toBe(29900 - 10000);
  });

  it("uses standard link when coupon is expired", async () => {
    mockCouponValid = true;
    mockCouponExpired = true;
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-EXPIRED" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.discountApplied).toBe(false);
    expect(linkCalls).toHaveLength(1);
    expect(dynamicLinkCalls).toHaveLength(0);
  });

  it("includes coupon code in remarks when coupon valid", async () => {
    mockCouponValid = true;
    mockCouponExpired = false;
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-TESTTEST" }));
    expect(res.status).toBe(200);
    // 3rd arg to createDynamicPaymongoLink is remarks
    const remarks = dynamicLinkCalls[0][2] as string;
    expect(remarks).toContain("coupon:FEEDBACK-TESTTEST");
    expect(remarks).toContain("plan:year_sem");
  });

  it("never clamps a discounted amount back up to the old floor", async () => {
    // Regression guard for the original bug: subject plans were charged the
    // ₱100 minimum while still burning the coupon. Now they unlock free
    // instead, and the paid coupon path passes the exact remainder through.
    mockCouponValid = true;
    const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-TESTTEST" }));
    expect(res.status).toBe(200);
    const finalAmount = dynamicLinkCalls[0][0];
    expect(finalAmount).not.toBe(10000); // the old clamp value
    expect(finalAmount).toBe(19900);
  });
});

describe("POST /api/subscribe coupon free unlocks", () => {
  it.each(["subject_month", "subject_sem"] as const)(
    "unlocks %s outright with a valid coupon — success URL, no PayMongo link, nothing charged",
    async (plan) => {
      mockCouponValid = true;
      const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan, couponCode: "FEEDBACK-FREEFREE" }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.freeUnlock).toBe(true);
      expect(body.discountApplied).toBe(true);
      // checkoutUrl carries the success URL so the client's existing redirect
      // lands on ?payment=success and auto-polls/unlocks like a paid purchase.
      expect(typeof body.checkoutUrl).toBe("string");
      expect(body.checkoutUrl).toContain("payment=success");
      // No link of either kind exists for a zero-amount purchase.
      expect(linkCalls).toHaveLength(0);
      expect(dynamicLinkCalls).toHaveLength(0);
      // Exactly one grant, through recordPayment.
      expect(recordedPayments).toHaveLength(1);
    }
  );

  it("writes BOTH the entitlement and a ZERO-value payments row keyed by the coupon", async () => {
    mockCouponValid = true;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_sem", couponCode: "FEEDBACK-ZEROVAL" }));
    expect(res.status).toBe(200);
    expect(recordedPayments[0]).toMatchObject({
      // linkId "coupon:<code>" hits the unique index on payments.paymongo_link_id,
      // making single-use enforceable at the database level.
      linkId: "coupon:FEEDBACK-ZEROVAL",
      deviceId: DEV,
      yearId: YEAR,
      subjectId: SUBJ,
      amount: 0,
      userId: USER,
    });
    // Semester plan grants until SEMESTER_END, not a stub period.
    expect(recordedPayments[0].periodEnd).toBeInstanceOf(Date);
  });

  it("sets the device cookie on the free path just like the paid path", async () => {
    mockCouponValid = true;
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-COOKIE1" }));
    expect(res.status).toBe(200);
    // DEVICE_COOKIE ("bsit_device_id") must be minted when only a body UUID
    // was supplied — same contract as the paid paths.
    expect(res.cookies.get("bsit_device_id")?.value).toBeTruthy();
  });

  it("refuses the same coupon a second time (single-use)", async () => {
    mockCouponValid = true;

    const res1 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-ONCEONLY" }));
    expect(res1.status).toBe(200);
    expect((await res1.json()).freeUnlock).toBe(true);
    expect(recordedPayments).toHaveLength(1);

    // Simulate the coupon now being redeemed: the atomic reserve returns 0 rows.
    mockCouponRedeemed = true;

    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-ONCEONLY" }));
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    // Second request gets NO discount and NO second grant — full price instead.
    expect(body2.freeUnlock).toBeUndefined();
    expect(body2.discountApplied).toBe(false);
    expect(linkCalls).toHaveLength(1); // standard full-price link
    expect(recordedPayments).toHaveLength(1); // no second entitlement
  });

  it("lets exactly one of two concurrent requests redeem one coupon", async () => {
    mockCouponValid = true;
    // The conditional UPDATE ... WHERE redeemed_at IS NULL returns a row only
    // once; the racing request sees zero rows and falls back to full price.
    atomicReserveSuccesses = 1;

    const [res1, res2] = await Promise.all([
      POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-RACECOND" })),
      POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, couponCode: "FEEDBACK-RACECOND" })),
    ]);
    const bodies = [await res1.json(), await res2.json()];
    expect(bodies.filter((b) => b.freeUnlock === true)).toHaveLength(1);
    expect(recordedPayments).toHaveLength(1);
    // Loser proceeds as an undiscounted purchase rather than erroring.
    expect(bodies.some((b) => b.discountApplied === false)).toBe(true);
  });

  it("treats a deduped ledger write (already-used coupon row) as success", async () => {
    mockCouponValid = true;
    recordPaymentMode = "deduped";
    const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-DEDUPE1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.freeUnlock).toBe(true);
  });

  it("releases the coupon after a ledger failure so it is usable again", async () => {
    mockCouponValid = true;
    recordPaymentThrows = true;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-LEDGERX" }));
      expect(res.status).toBe(500);
      expect(recordedPayments).toHaveLength(0);
    } finally {
      consoleError.mockRestore();
    }
    // The release flipped redeemed_at back to null...
    expect(releaseCalls).toHaveLength(1);
    expect(releaseCalls[0]).toMatchObject({ redeemed_to: null });

    // ...so an immediate retry with the same coupon succeeds.
    recordPaymentThrows = false;
    const res2 = await POST(makeReq({ yearId: YEAR, subjectId: SUBJ, deviceId: DEV, plan: "subject_month", couponCode: "FEEDBACK-LEDGERX" }));
    expect(res2.status).toBe(200);
    expect((await res2.json()).freeUnlock).toBe(true);
    expect(recordedPayments).toHaveLength(1);
  });

  it("releases the coupon after discounted-link creation fails, and it redeems on retry", async () => {
    mockCouponValid = true;
    dynamicLinkShouldThrow = true;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const res = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-LINKFAIL" }));
      expect(res.status).toBe(500);
      expect(dynamicLinkCalls).toHaveLength(0);
    } finally {
      consoleError.mockRestore();
    }
    expect(releaseCalls).toHaveLength(1);

    // Gateway healthy again: same coupon reserves and links successfully.
    dynamicLinkShouldThrow = false;
    const res2 = await POST(makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-LINKFAIL" }));
    expect(res2.status).toBe(200);
    expect((await res2.json()).discountApplied).toBe(true);
    expect(dynamicLinkCalls).toHaveLength(1);
    expect(dynamicLinkCalls[0][0]).toBe(19900);
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
      makeReq({ yearId: YEAR, deviceId: DEV, plan: "year_sem", couponCode: "FEEDBACK-TESTTEST" })
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
