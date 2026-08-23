import { describe, it, expect } from "vitest";
import {
  pesosFromCentavos,
  unlockRevenuePesos,
  attributePlan,
  revenueByPlan,
  PLAN_BUCKETS,
  arpu,
  observedLtv,
  acquisitionCost,
  ZERO_CAC_DISCLAIMER,
  paybackMonths,
  modelPayback,
  scenarios,
  SCENARIO_MULTIPLIERS,
  annotateMonths,
  completeMonths,
  completeMonthDelta,
} from "./unitEconomics";

// Synthetic amounts only. Real figures never enter a tracked file.
const SUBJECT_MONTH = 4900;
const SUBJECT_SEM = 9900;
const YEAR_SEM = 29900;

// Stands in for lib/reports/blockPrice.ts (Task 7). The real matcher reads the
// three source files; this one only has to be a matcher.
const isBlockAmount = (centavos: number, scope: "subject" | "all") =>
  scope === "subject" ? centavos === 79900 : centavos === 99900;

const payment = (amount: number, subjectId: string | null) => ({
  amount,
  subject_id: subjectId,
});

describe("pesosFromCentavos", () => {
  it("converts centavos to pesos", () => {
    expect(pesosFromCentavos(29900)).toBe(299);
  });

  it("keeps a fractional peso rather than rounding it away", () => {
    expect(pesosFromCentavos(4950)).toBe(49.5);
  });

  it("converts zero to zero", () => {
    expect(pesosFromCentavos(0)).toBe(0);
  });
});

describe("unlockRevenuePesos", () => {
  it("sums the legacy unlocks ledger, which is already in pesos", () => {
    expect(unlockRevenuePesos([{ amount: 20 }, { amount: 20 }])).toBe(40);
  });

  it("is zero for an empty legacy ledger", () => {
    expect(unlockRevenuePesos([])).toBe(0);
  });
});

describe("attributePlan", () => {
  it("matches the whole-year plan exactly", () => {
    expect(attributePlan(YEAR_SEM, null, isBlockAmount)).toEqual({
      bucket: "year_sem",
      match: "exact",
    });
  });

  it("matches the monthly subject plan exactly", () => {
    expect(attributePlan(SUBJECT_MONTH, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_month",
      match: "exact",
    });
  });

  it("matches the semester subject plan exactly", () => {
    expect(attributePlan(SUBJECT_SEM, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_sem",
      match: "exact",
    });
  });

  it("recognises a subject-scoped block sale before any subject plan", () => {
    expect(attributePlan(79900, "subject-1", isBlockAmount)).toEqual({
      bucket: "block",
      match: "block",
    });
  });

  it("recognises an all-subjects block sale before the year plan", () => {
    expect(attributePlan(99900, null, isBlockAmount)).toEqual({
      bucket: "block",
      match: "block",
    });
  });

  it("attributes an overpayment to the most expensive plan it clears", () => {
    // The webhook grants on paid >= expected, so this is a real purchase.
    expect(attributePlan(SUBJECT_SEM + 100, "subject-1", isBlockAmount)).toEqual({
      bucket: "subject_sem",
      match: "over",
    });
  });

  it("leaves an amount below every candidate unattributed", () => {
    expect(attributePlan(100, "subject-1", isBlockAmount)).toEqual({
      bucket: "unattributed",
      match: "none",
    });
  });

  it("does not attribute a subject-priced amount to a year-scoped row", () => {
    // No subject means the only candidate is year_sem, which this underpays.
    expect(attributePlan(SUBJECT_MONTH, null, isBlockAmount).bucket).toBe(
      "unattributed"
    );
  });
});

describe("revenueByPlan", () => {
  it("always returns every bucket in a fixed order, even when empty", () => {
    const rows = revenueByPlan([], isBlockAmount);
    expect(rows.map((r) => r.bucket)).toEqual([...PLAN_BUCKETS]);
    expect(rows.every((r) => r.revenuePesos === 0 && r.payments === 0)).toBe(true);
  });

  it("sums pesos and counts payments per bucket", () => {
    const rows = revenueByPlan(
      [
        payment(SUBJECT_MONTH, "s1"),
        payment(SUBJECT_MONTH, "s2"),
        payment(YEAR_SEM, null),
      ],
      isBlockAmount
    );
    const byBucket = new Map(rows.map((r) => [r.bucket, r]));
    expect(byBucket.get("subject_month")).toMatchObject({ payments: 2, revenuePesos: 98 });
    expect(byBucket.get("year_sem")).toMatchObject({ payments: 1, revenuePesos: 299 });
  });

  it("files a block sale under block, not under a subject plan", () => {
    const rows = revenueByPlan([payment(79900, "s1")], isBlockAmount);
    const byBucket = new Map(rows.map((r) => [r.bucket, r]));
    expect(byBucket.get("block")?.payments).toBe(1);
    expect(byBucket.get("subject_sem")?.payments).toBe(0);
  });

  it("never loses a peso — the buckets sum to the total", () => {
    const rows = [
      payment(SUBJECT_MONTH, "s1"),
      payment(SUBJECT_SEM + 51, "s2"),
      payment(YEAR_SEM, null),
      payment(79900, "s3"),
      payment(7, "s4"), // attributable to nothing
    ];
    const total = rows.reduce((sum, r) => sum + r.amount, 0) / 100;
    const bucketed = revenueByPlan(rows, isBlockAmount).reduce(
      (sum, r) => sum + r.revenuePesos,
      0
    );
    expect(bucketed).toBeCloseTo(total, 10);
  });

  it("keeps unmatched money visible in the unattributed bucket", () => {
    const rows = revenueByPlan([payment(7, "s1")], isBlockAmount);
    const unattributed = rows.find((r) => r.bucket === "unattributed");
    expect(unattributed).toMatchObject({ payments: 1 });
    expect(unattributed?.revenuePesos).toBeGreaterThan(0);
  });
});

describe("arpu", () => {
  it("divides revenue by paying devices", () => {
    expect(arpu(600, 4)).toBe(150);
  });

  it("rounds to two decimal places", () => {
    expect(arpu(100, 3)).toBe(33.33);
  });

  it("returns null rather than zero when nobody has paid", () => {
    expect(arpu(0, 0)).toBeNull();
  });

  it("returns null rather than Infinity for revenue with no payers", () => {
    expect(arpu(500, 0)).toBeNull();
  });
});

describe("observedLtv", () => {
  it("is revenue per paying device, observed to date", () => {
    expect(observedLtv(600, 4, 4).pesos).toBe(150);
  });

  it("flags that it is indistinguishable from ARPU while nobody has paid twice", () => {
    expect(observedLtv(600, 4, 4).indistinguishableFromArpu).toBe(true);
  });

  it("stops flagging once a device has paid more than once", () => {
    const observation = observedLtv(600, 4, 6);
    expect(observation.indistinguishableFromArpu).toBe(false);
    expect(observation.paymentsPerPayingDevice).toBe(1.5);
  });

  it("is null with no paying devices", () => {
    expect(observedLtv(0, 0, 0)).toMatchObject({
      pesos: null,
      paymentsPerPayingDevice: null,
    });
  });
});

describe("acquisitionCost", () => {
  it("reports zero spend as a basis, not as efficiency", () => {
    expect(acquisitionCost(0, 12)).toEqual({ pesos: 0, basis: "zero-spend" });
  });

  it("computes cost per acquisition when money is actually spent", () => {
    expect(acquisitionCost(1000, 8)).toEqual({ pesos: 125, basis: "computed" });
  });

  it("returns null when money was spent and nobody converted", () => {
    expect(acquisitionCost(1000, 0)).toEqual({ pesos: null, basis: "no-acquisitions" });
  });

  it("states plainly that zero CAC is not a compliment", () => {
    expect(ZERO_CAC_DISCLAIMER).toMatch(/not because/i);
    expect(ZERO_CAC_DISCLAIMER).toMatch(/no money is spent/i);
  });
});

describe("paybackMonths", () => {
  it("is immediate at zero CAC", () => {
    expect(paybackMonths(0, 150)).toBe(0);
  });

  it("divides CAC by monthly ARPU", () => {
    expect(paybackMonths(300, 150)).toBe(2);
  });

  it("returns null rather than Infinity when ARPU is zero", () => {
    expect(paybackMonths(300, 0)).toBeNull();
  });

  it("returns null when ARPU was not measured", () => {
    expect(paybackMonths(300, null)).toBeNull();
  });

  it("returns null when CAC was not measured", () => {
    expect(paybackMonths(null, 150)).toBeNull();
  });
});

describe("modelPayback", () => {
  it("models what payback becomes if acquisition spend starts", () => {
    expect(modelPayback(1000, 8, 125)).toMatchObject({ cacPesos: 125, months: 1 });
  });

  it("carries its assumptions rather than presenting a bare number", () => {
    expect(modelPayback(1000, 8, 125).assumptions.length).toBeGreaterThan(0);
  });
});

describe("scenarios", () => {
  const baseline = {
    month: "2026-07",
    revenuePesos: 1000,
    payments: 10,
    complete: true,
  };

  it("models 2x, 5x and 10x by default", () => {
    expect(scenarios(baseline).map((s) => s.multiplier)).toEqual([
      ...SCENARIO_MULTIPLIERS,
    ]);
  });

  it("scales the baseline revenue", () => {
    expect(scenarios(baseline).map((s) => s.revenuePesos)).toEqual([2000, 5000, 10000]);
  });

  it("attaches assumptions to every scenario", () => {
    expect(scenarios(baseline).every((s) => s.assumptions.length > 0)).toBe(true);
  });

  it("gives every scenario the same assumptions, so none can be stripped", () => {
    const [first, ...rest] = scenarios(baseline);
    expect(rest.every((s) => s.assumptions.join("|") === first.assumptions.join("|"))).toBe(
      true
    );
  });

  it("refuses to model from an incomplete month", () => {
    expect(() => scenarios({ ...baseline, complete: false })).toThrow(/incomplete/i);
  });
});

describe("annotateMonths", () => {
  // revenueByMonth returns newest first: index 0 is the running month.
  const months = [
    { month: "2026-08", revenue: 500, payments: 5 },
    { month: "2026-07", revenue: 900, payments: 9 },
    { month: "2026-06", revenue: 700, payments: 7 },
  ];
  const now = new Date("2026-08-08T05:00:00.000Z"); // 2026-08-08 13:00 Manila

  it("marks the running Manila month incomplete", () => {
    expect(annotateMonths(months, now)[0]).toMatchObject({
      month: "2026-08",
      complete: false,
    });
  });

  it("marks every other month complete", () => {
    expect(annotateMonths(months, now).slice(1).every((m) => m.complete)).toBe(true);
  });

  it("carries the progress through the month only on the incomplete one", () => {
    const [current, previous] = annotateMonths(months, now);
    expect(current).toMatchObject({ dayOfMonth: 8, daysInMonth: 31 });
    expect(previous.dayOfMonth).toBeUndefined();
  });

  it("uses the Manila month, not the UTC one, at the boundary", () => {
    // 2026-07-31T16:00Z is already August in Manila.
    const boundary = new Date("2026-07-31T16:00:00.000Z");
    const annotated = annotateMonths(months, boundary);
    expect(annotated.find((m) => m.month === "2026-08")?.complete).toBe(false);
    expect(annotated.find((m) => m.month === "2026-07")?.complete).toBe(true);
  });

  it("does not divide revenue again — revenueByMonth already returns pesos", () => {
    expect(annotateMonths(months, now)[1].revenuePesos).toBe(900);
  });

  it("preserves the newest-first order it was given", () => {
    expect(annotateMonths(months, now).map((m) => m.month)).toEqual([
      "2026-08",
      "2026-07",
      "2026-06",
    ]);
  });
});

describe("completeMonths and completeMonthDelta", () => {
  const months = [
    { month: "2026-08", revenue: 500, payments: 5 },
    { month: "2026-07", revenue: 900, payments: 9 },
    { month: "2026-06", revenue: 700, payments: 7 },
  ];
  const now = new Date("2026-08-08T05:00:00.000Z");

  it("drops the running month from the comparable set", () => {
    expect(completeMonths(annotateMonths(months, now)).map((m) => m.month)).toEqual([
      "2026-07",
      "2026-06",
    ]);
  });

  it("compares the two most recent complete months, never the running one", () => {
    expect(completeMonthDelta(annotateMonths(months, now))).toEqual({
      from: "2026-06",
      to: "2026-07",
      deltaPesos: 200,
    });
  });

  it("returns null when there are not two complete months to compare", () => {
    const thin = [{ month: "2026-08", revenue: 500, payments: 5 }];
    expect(completeMonthDelta(annotateMonths(thin, now))).toBeNull();
  });
});
