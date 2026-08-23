import { describe, it, expect } from "vitest";
import { SEMESTER_END } from "../paymongo";
import {
  recognise,
  recogniseLedger,
  semesterEndStatus,
  semesterPlanParity,
  EXPIRY_BUCKETS,
  expirySchedule,
} from "./revenueRecognition";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("recognise", () => {
  const paidAt = "2026-07-01T00:00:00.000Z";
  const periodEnd = "2026-07-11T00:00:00.000Z"; // ten days

  it("earns nothing at the instant of payment", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date(paidAt),
    });
    expect(result).toMatchObject({ earnedCentavos: 0, deferredCentavos: 10000 });
  });

  it("earns half at the midpoint", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-07-06T00:00:00.000Z"),
    });
    expect(result.earnedCentavos).toBe(5000);
    expect(result.fractionElapsed).toBeCloseTo(0.5, 10);
  });

  it("earns everything once the period has ended", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-08-01T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, deferredCentavos: 0 });
  });

  it("never earns more than was paid, however far past the period", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2030-01-01T00:00:00.000Z"),
    });
    expect(result.fractionElapsed).toBe(1);
    expect(result.earnedCentavos).toBe(10000);
  });

  it("never earns a negative amount when asOf precedes the payment", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(result.fractionElapsed).toBe(0);
    expect(result.earnedCentavos).toBe(0);
  });

  it("treats a zero-length period as fully earned rather than dividing by zero", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd: paidAt,
      asOf: new Date("2026-07-05T00:00:00.000Z"),
    });
    expect(Number.isFinite(result.fractionElapsed)).toBe(true);
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "fully-earned" });
  });

  it("treats a payment superseded by a renewal as fully earned", () => {
    // recordPayment overwrote the subscription's period; the original is gone,
    // and a period replaced by a renewal has by definition elapsed.
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd,
      asOf: new Date(paidAt),
      superseded: true,
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "fully-earned" });
  });

  it("treats a payment with no known period as earned, and says which basis it used", () => {
    const result = recognise({
      amountCentavos: 10000,
      paidAt,
      periodEnd: null,
      asOf: new Date("2026-07-05T00:00:00.000Z"),
    });
    expect(result).toMatchObject({ earnedCentavos: 10000, basis: "no-period" });
  });

  it("always splits the payment exactly — earned plus deferred is the amount", () => {
    for (const amount of [4900, 9900, 29900, 79900, 1]) {
      for (const day of [1, 3, 7, 9]) {
        const result = recognise({
          amountCentavos: amount,
          paidAt,
          periodEnd,
          asOf: new Date(Date.parse(paidAt) + day * DAY_MS),
        });
        expect(result.earnedCentavos + result.deferredCentavos).toBe(amount);
      }
    }
  });

  it("returns whole centavos, never fractions", () => {
    const result = recognise({
      amountCentavos: 4900,
      paidAt,
      periodEnd,
      asOf: new Date("2026-07-04T00:00:00.000Z"),
    });
    expect(Number.isInteger(result.earnedCentavos)).toBe(true);
    expect(Number.isInteger(result.deferredCentavos)).toBe(true);
  });
});

describe("recogniseLedger", () => {
  const asOf = new Date("2026-07-06T00:00:00.000Z");
  const rows = [
    {
      amountCentavos: 10000,
      paidAt: "2026-07-01T00:00:00.000Z",
      periodEnd: "2026-07-11T00:00:00.000Z",
    },
    {
      amountCentavos: 10000,
      paidAt: "2026-06-01T00:00:00.000Z",
      periodEnd: "2026-06-11T00:00:00.000Z",
    },
  ];

  it("totals earned and deferred across the ledger", () => {
    expect(recogniseLedger(rows, asOf)).toMatchObject({
      earnedCentavos: 15000,
      deferredCentavos: 5000,
    });
  });

  it("is zero on an empty ledger rather than null", () => {
    expect(recogniseLedger([], asOf)).toMatchObject({
      earnedCentavos: 0,
      deferredCentavos: 0,
    });
  });

  it("counts the rows whose period was destroyed by a renewal", () => {
    const withRenewal = [...rows, { ...rows[0], superseded: true }];
    expect(recogniseLedger(withRenewal, asOf).supersededCount).toBe(1);
  });

  it("counts the rows that had no period at all", () => {
    const withOrphan = [...rows, { ...rows[0], periodEnd: null }];
    expect(recogniseLedger(withOrphan, asOf).noPeriodCount).toBe(1);
  });

  it("keeps the split exact across the whole ledger", () => {
    const totals = recogniseLedger(rows, asOf);
    const paid = rows.reduce((sum, row) => sum + row.amountCentavos, 0);
    expect(totals.earnedCentavos + totals.deferredCentavos).toBe(paid);
  });
});

describe("semesterEndStatus", () => {
  it("reads the constant rather than a copy of the date", () => {
    const status = semesterEndStatus(new Date("2026-08-08T05:00:00.000Z"));
    expect(status.semesterEndIso).toBe(SEMESTER_END.toISOString());
  });

  it("counts whole days remaining", () => {
    const oneWeekBefore = new Date(SEMESTER_END.getTime() - 7 * DAY_MS);
    expect(semesterEndStatus(oneWeekBefore).daysRemaining).toBe(7);
  });

  it("flags a constant that has gone stale", () => {
    const after = new Date(SEMESTER_END.getTime() + DAY_MS);
    expect(semesterEndStatus(after)).toMatchObject({ past: true });
  });

  it("does not report a live constant as stale", () => {
    const before = new Date(SEMESTER_END.getTime() - DAY_MS);
    expect(semesterEndStatus(before).past).toBe(false);
  });
});

describe("semesterPlanParity", () => {
  it("keeps the plans distinct well before the semester ends", () => {
    const early = new Date(SEMESTER_END.getTime() - 120 * DAY_MS);
    expect(semesterPlanParity(early).identical).toBe(false);
  });

  it("collapses the two plans 31 days out, while the semester plan still costs double", () => {
    const inside = new Date(SEMESTER_END.getTime() - 10 * DAY_MS);
    expect(semesterPlanParity(inside).identical).toBe(true);
  });

  it("stays collapsed once the constant is stale", () => {
    const after = new Date(SEMESTER_END.getTime() + 30 * DAY_MS);
    expect(semesterPlanParity(after).identical).toBe(true);
  });

  it("says how many days remain before the plans collapse", () => {
    const early = new Date(SEMESTER_END.getTime() - 61 * DAY_MS);
    expect(semesterPlanParity(early).daysUntilParity).toBe(30);
  });

  it("reports zero days once parity has already arrived", () => {
    const inside = new Date(SEMESTER_END.getTime() - 10 * DAY_MS);
    expect(semesterPlanParity(inside).daysUntilParity).toBe(0);
  });
});

describe("expirySchedule", () => {
  const now = new Date("2026-08-08T05:00:00.000Z");
  const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS).toISOString();

  const entitlement = (id: string, days: number, amount: number | null) => ({
    id,
    currentPeriodEnd: inDays(days),
    status: "active",
    amountCentavos: amount,
  });

  it("returns every bucket in a fixed order, even when empty", () => {
    const schedule = expirySchedule([], now);
    expect(schedule.buckets.map((bucket) => bucket.label)).toEqual([...EXPIRY_BUCKETS]);
  });

  it("sorts entitlements into the right horizon", () => {
    const schedule = expirySchedule(
      [
        entitlement("a", -1, 4900),
        entitlement("b", 3, 4900),
        entitlement("c", 20, 9900),
        entitlement("d", 60, 29900),
        entitlement("e", 300, 29900),
      ],
      now
    );
    const byLabel = new Map(schedule.buckets.map((bucket) => [bucket.label, bucket.count]));
    expect(byLabel.get("expired")).toBe(1);
    expect(byLabel.get("<=7d")).toBe(1);
    expect(byLabel.get("<=30d")).toBe(1);
    expect(byLabel.get("<=90d")).toBe(1);
    expect(byLabel.get("beyond")).toBe(1);
  });

  it("adds up the revenue at risk in each bucket", () => {
    const schedule = expirySchedule(
      [entitlement("a", 3, 4900), entitlement("b", 5, 9900)],
      now
    );
    const soon = schedule.buckets.find((bucket) => bucket.label === "<=7d");
    expect(soon).toMatchObject({ count: 2, revenueAtRiskCentavos: 14800 });
  });

  it("counts an entitlement whose amount is unknown without inventing one", () => {
    const schedule = expirySchedule([entitlement("a", 3, null)], now);
    const soon = schedule.buckets.find((bucket) => bucket.label === "<=7d");
    expect(soon).toMatchObject({ count: 1, revenueAtRiskCentavos: 0, unpricedCount: 1 });
  });

  it("surfaces the date the expiries cluster on", () => {
    const schedule = expirySchedule(
      [
        entitlement("a", 40, 9900),
        entitlement("b", 40, 9900),
        entitlement("c", 40, 9900),
        entitlement("d", 5, 4900),
      ],
      now
    );
    expect(schedule.clusters[0]).toMatchObject({ count: 3 });
  });

  it("reports concentration so the clustering can be quoted without arithmetic", () => {
    const schedule = expirySchedule(
      [entitlement("a", 40, 9900), entitlement("b", 40, 9900), entitlement("c", 5, 4900)],
      now
    );
    expect(schedule.concentration).toBeCloseTo(2 / 3, 10);
  });

  it("has zero concentration with nothing to cluster", () => {
    expect(expirySchedule([], now).concentration).toBe(0);
  });

  it("groups clusters by Manila calendar day, not UTC", () => {
    // Both instants are the same PH day; only one is the same UTC day.
    const schedule = expirySchedule(
      [
        { id: "a", currentPeriodEnd: "2026-09-30T16:30:00.000Z", status: "active", amountCentavos: 9900 },
        { id: "b", currentPeriodEnd: "2026-10-01T02:00:00.000Z", status: "active", amountCentavos: 9900 },
      ],
      now
    );
    expect(schedule.clusters).toHaveLength(1);
    expect(schedule.clusters[0].phDate).toBe("2026-10-01");
  });

  it("ignores an entitlement that is not active", () => {
    const schedule = expirySchedule(
      [{ ...entitlement("a", 3, 4900), status: "cancelled" }],
      now
    );
    expect(schedule.buckets.every((bucket) => bucket.count === 0)).toBe(true);
  });
});
