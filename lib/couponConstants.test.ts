import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  PLANS,
  MIN_CHARGE,
  COUPON_DISCOUNT,
  couponDiscountFor,
  type PlanKey,
} from "./paymongo";

// process.cwd() rather than __dirname: vitest runs from the repo root (see
// vitest.config.ts) and __dirname is not reliably defined in a Vite-transformed
// test module. Same pattern as lib/reports/blockPrice.test.ts.
const REPO_ROOT = process.cwd();

function readSource(relativePath: string): string {
  const full = join(REPO_ROOT, relativePath);
  if (!existsSync(full)) {
    throw new Error(
      `Source not found at ${full}. Either the file moved — in which case update ` +
        `the source lists below — or vitest is running from somewhere other than ` +
        `the repo root.`
    );
  }
  return readFileSync(full, "utf8");
}

// Every server-side copy of the coupon constants. lib/paymongo.ts declares
// them; the subscribe route consumes them; the webhook recomputes discounts
// through the same helper. A fourth copy living anywhere else is drift.
const PAYMENT_SOURCES = [
  "lib/paymongo.ts",
  "app/api/subscribe/route.ts",
  "app/api/webhooks/paymongo/route.ts",
];

// The class seat cap's server-side copies. (app/(main)/for-blocks/pricing.ts
// keeps a fifth, client-side twin that cannot import lib/paymongo — this file
// pulls in node:crypto — so the scan covers only what can share the constant.)
const SEAT_SOURCES = [
  "app/api/class/checkout/route.ts",
  "app/api/webhooks/paymongo/route.ts",
];

function countLiteral(source: string, literal: string): number {
  return source.match(new RegExp(`\\b${literal}\\b`, "g"))?.length ?? 0;
}

// ── The standing assertion. This is the point of the module. ────────────────
//
// The original coupon bug was three copies of one number drifting apart: a
// local MIN_CHARGE floor in the subscribe route clamped discounted subject
// plans UP to ₱100 while burning the coupon, and the webhook rejected the
// correctly-discounted year price because it knew nothing of coupons. These
// tests fail the build the day any copy reappears.

describe("coupon constants agree across every payment-path source", () => {
  const sources = PAYMENT_SOURCES.map((path) => ({ path, text: readSource(path) }));

  it("finds all three sources where the spec says they are", () => {
    expect(sources).toHaveLength(3);
    expect(sources.every((source) => source.text.length > 0)).toBe(true);
  });

  it("declares the constants once, in lib/paymongo.ts", () => {
    const lib = sources[0].text;
    expect(lib).toMatch(/export const MIN_CHARGE =/);
    expect(lib).toMatch(/export const COUPON_DISCOUNT =/);
    expect(lib).toMatch(/export function couponDiscountFor\(/);
    // The capped helper must actually cap against the plan table.
    expect(lib).toMatch(/Math\.min\(COUPON_DISCOUNT,\s*PLANS\[plan\]\.amount\)/);
  });

  it("writes the gateway-minimum literal exactly once across all sources", () => {
    // The face value references MIN_CHARGE rather than repeating the amount,
    // so the number has exactly one definition in the codebase. If this fails,
    // a route re-inlined its own copy — move it to lib/paymongo.ts instead.
    const counts = sources.map(({ path, text }) => ({
      path,
      count: countLiteral(text, "10000"),
    }));
    const total = counts.reduce((sum, entry) => sum + entry.count, 0);
    expect(total, JSON.stringify(counts)).toBe(1);
    expect(counts.find((entry) => entry.count === 1)?.path).toBe("lib/paymongo.ts");
  });

  it("has both routes derive discounts through the shared helper", () => {
    expect(sources[1].text).toMatch(/couponDiscountFor\(/);
    expect(sources[2].text).toMatch(/couponDiscountFor\(/);
  });

  it("never reintroduces the Math.max floor clamp in the subscribe route", () => {
    // The exact expression that made customers pay MORE than the plan price
    // while burning their coupon.
    expect(sources[1].text).not.toMatch(/Math\.max\(MIN_CHARGE/);
  });
});

describe("seat cap agrees across checkout and webhook", () => {
  const checkout = readSource(SEAT_SOURCES[0]);
  const webhook = readSource(SEAT_SOURCES[1]);

  it("keeps the declaration in lib/paymongo.ts alone", () => {
    expect(readSource("lib/paymongo.ts")).toMatch(/export const MAX_SEATS = 55;/);
    for (const [name, text] of [
      ["class checkout", checkout],
      ["webhook", webhook],
    ] as const) {
      expect(text.match(/const MAX_SEATS\s*=/), `${name} re-declares MAX_SEATS`).toBeNull();
    }
  });

  it("is imported by checkout and enforced by the webhook", () => {
    expect(checkout).toMatch(/import\s*\{[^}]*MAX_SEATS[^}]*\}\s*from "@\/lib\/paymongo"/);
    expect(webhook).toMatch(/seats > MAX_SEATS/);
  });
});

describe("the free-unlock selector stays sound for every plan", () => {
  // The whole flexible-coupon design rests on one arithmetic fact: after the
  // capped discount, a plan costs either nothing or at least PayMongo's
  // minimum. A new plan priced inside that gap would mint unpayable links.
  it.each(Object.keys(PLANS).map((plan) => [plan as PlanKey, PLANS[plan as PlanKey].amount]))(
    "%s leaves a remainder of 0 or >= MIN_CHARGE",
    (plan, amount) => {
      const remainder = amount - couponDiscountFor(plan);
      expect(remainder === 0 || remainder >= MIN_CHARGE).toBe(true);
      expect(couponDiscountFor(plan)).toBeLessThanOrEqual(amount);
    }
  );

  it("grants the full face value only when the plan can absorb it", () => {
    expect(couponDiscountFor("subject_month")).toBe(PLANS.subject_month.amount);
    expect(couponDiscountFor("subject_sem")).toBe(PLANS.subject_sem.amount);
    expect(couponDiscountFor("year_sem")).toBe(COUPON_DISCOUNT);
    expect(COUPON_DISCOUNT).toBeLessThan(PLANS.year_sem.amount);
  });
});
