import { describe, it, expect } from "vitest";
import {
  LOCALLY_MINTED_PREFIXES,
  classifyLinkId,
  naturalKey,
  KNOWN_EXCEPTIONS,
  EXCEPTION_KINDS,
  reconcile,
  summariseExceptions,
  type ClassRow,
  type PaymentRow,
  type SubscriptionRow,
} from "./ledgerIntegrity";

// Synthetic throughout. No production identifier or amount enters this file.
const isBlockAmount = (centavos: number, scope: "subject" | "all") =>
  scope === "subject" ? centavos === 79900 : centavos === 99900;

const payment = (over: Partial<PaymentRow> = {}): PaymentRow => ({
  id: "pay-1",
  paymongo_link_id: "gw_1",
  device_id: "dev-1",
  year_id: "year-1",
  subject_id: null,
  amount: 29900,
  paid_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const subscription = (over: Partial<SubscriptionRow> = {}): SubscriptionRow => ({
  id: "sub-1",
  paymongo_link_id: "gw_1",
  device_id: "dev-1",
  year_id: "year-1",
  subject_id: null,
  status: "active",
  current_period_end: "2026-12-31T15:59:59.000Z",
  created_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const classRow = (over: Partial<ClassRow> = {}): ClassRow => ({
  id: "cls-1",
  code: "ABC123",
  paymongo_link_id: "gw_block_1",
  rep_device_id: "dev-rep",
  year_id: "year-1",
  subject_id: "subject-1",
  seat_cap: 11,
  status: "active",
  current_period_end: "2026-12-31T15:59:59.000Z",
  created_at: "2026-07-02T04:00:00.000Z",
  ...over,
});

const run = (input: {
  payments?: PaymentRow[];
  subscriptions?: SubscriptionRow[];
  classes?: ClassRow[];
  register?: typeof KNOWN_EXCEPTIONS;
}) =>
  reconcile({
    payments: input.payments ?? [],
    subscriptions: input.subscriptions ?? [],
    classes: input.classes ?? [],
    isBlockAmount,
    register: input.register,
  });

const kinds = (result: ReturnType<typeof run>) =>
  result.exceptions.map((exception) => exception.kind);

describe("classifyLinkId", () => {
  it("recognises the class block placeholder", () => {
    expect(classifyLinkId("block-abc")).toBe("block-placeholder");
  });

  it("recognises a comped grant", () => {
    expect(classifyLinkId("comp-abc")).toBe("comped");
  });

  it("recognises a manual grant", () => {
    expect(classifyLinkId("manual-abc")).toBe("manual");
  });

  it("treats anything else as a gateway id it cannot verify", () => {
    expect(classifyLinkId("link_someRealPaymongoId")).toBe("gateway");
  });

  it("treats an empty link id as a gateway id rather than as locally minted", () => {
    // Fail safe: an unrecognised id must be surfaced, never excused.
    expect(classifyLinkId("")).toBe("gateway");
  });

  it("lists exactly the prefixes this codebase mints locally", () => {
    expect([...LOCALLY_MINTED_PREFIXES]).toEqual(["block-", "comp-", "manual-"]);
  });
});

describe("naturalKey", () => {
  it("collapses a year plan onto the same sentinel the unique index uses", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: null })).toBe(
      "d|y|year"
    );
  });

  it("keys a subject plan by its subject", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: "s" })).toBe("d|y|s");
  });

  it("distinguishes a year plan from a subject plan on the same device", () => {
    expect(naturalKey({ device_id: "d", year_id: "y", subject_id: null })).not.toBe(
      naturalKey({ device_id: "d", year_id: "y", subject_id: "s" })
    );
  });
});

describe("KNOWN_EXCEPTIONS", () => {
  it("registers exactly the six accepted link ids, order-insensitive, no extras", () => {
    expect(KNOWN_EXCEPTIONS.map((entry) => entry.linkId).sort()).toEqual([
      "demo-1782312786938",
      "manual-grant-1782539037042",
      "owner-unlock-1",
      "owner-unlock-2",
      "owner-unlock-3",
      "owner-unlock-4",
    ]);
  });

  it("resolves a registered entitlement to known-exception, not unexplained", () => {
    // Runs against the SHIPPED register — none injected — so the default
    // fallback inside reconcile() is exercised end to end.
    const result = run({
      subscriptions: [subscription({ paymongo_link_id: "owner-unlock-1" })],
    });
    expect(kinds(result)).toEqual(["entitlement-known-exception"]);
    expect(result.exceptions[0].reason).toMatch(/^Accepted 2026-08-24:/);
  });

  it("requires a reason and a date on every entry that is ever added", () => {
    for (const entry of KNOWN_EXCEPTIONS) {
      expect(entry.reason.trim().length).toBeGreaterThan(0);
      expect(entry.since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("reconcile — matching axis", () => {
  it("matches a subscription to its payment by link id", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
  });

  it("matches a class to its payment by link id", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_block_1", amount: 79900, subject_id: "subject-1", device_id: "dev-rep" })],
      classes: [classRow()],
    });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
  });

  it("names an entitlement with a gateway link id and no payment as unexplained", () => {
    const result = run({ subscriptions: [subscription({ paymongo_link_id: "gw_missing" })] });
    expect(kinds(result)).toEqual(["entitlement-without-payment"]);
    expect(result.exceptions[0].linkId).toBe("gw_missing");
  });

  it("names a block-placeholder entitlement as locally minted, not as unexplained", () => {
    const result = run({ classes: [classRow({ paymongo_link_id: "block-xyz" })] });
    expect(kinds(result)).toEqual(["entitlement-locally-minted"]);
    expect(result.exceptions[0].reason).toMatch(/block-placeholder/);
  });

  it("names a comped subscription as locally minted", () => {
    const result = run({ subscriptions: [subscription({ paymongo_link_id: "comp-1" })] });
    expect(kinds(result)).toEqual(["entitlement-locally-minted"]);
  });

  it("moves an entitlement in the register to its own kind and carries the reason", () => {
    const result = run({
      subscriptions: [subscription({ paymongo_link_id: "gw_comped" })],
      register: [{ linkId: "gw_comped", reason: "Beta tester, agreed 2026-07", since: "2026-07-01" }],
    });
    expect(kinds(result)).toEqual(["entitlement-known-exception"]);
    expect(result.exceptions[0].reason).toMatch(/Beta tester/);
  });

  it("reports money received with nothing granted, and carries the amount", () => {
    const result = run({ payments: [payment({ paymongo_link_id: "gw_orphan" })] });
    expect(kinds(result)).toEqual(["payment-without-entitlement"]);
    expect(result.exceptions[0].amountCentavos).toBe(29900);
  });

  it("does not call a renewal-superseded payment an orphan", () => {
    // recordPayment overwrites subscriptions.paymongo_link_id on renewal, so
    // the first payment's link id no longer appears on any subscription.
    const first = payment({ id: "pay-1", paymongo_link_id: "gw_1" });
    const second = payment({ id: "pay-2", paymongo_link_id: "gw_2" });
    const result = run({
      payments: [first, second],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    expect(result.exceptions).toEqual([]);
    expect(result.counts.matchedDirect).toBe(1);
    expect(result.counts.matchedByRenewal).toBe(1);
  });

  it("still reports an orphan when the natural key matches nothing either", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan", device_id: "dev-other" })],
      subscriptions: [subscription()],
    });
    expect(kinds(result)).toContain("payment-without-entitlement");
  });

  it("records how a pair was matched", () => {
    const result = run({
      payments: [payment({ id: "pay-1", paymongo_link_id: "gw_1" }), payment({ id: "pay-2", paymongo_link_id: "gw_2" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    expect(result.matched.map((pair) => pair.via).sort()).toEqual([
      "link-id",
      "natural-key",
    ]);
  });

  it("counts every payment exactly once on the matching axis", () => {
    const result = run({
      payments: [
        payment({ id: "pay-1", paymongo_link_id: "gw_1" }),
        payment({ id: "pay-2", paymongo_link_id: "gw_2" }),
        payment({ id: "pay-3", paymongo_link_id: "gw_3", device_id: "dev-nobody" }),
      ],
      subscriptions: [subscription({ paymongo_link_id: "gw_2" })],
    });
    const orphans = result.exceptions.filter(
      (exception) => exception.kind === "payment-without-entitlement"
    ).length;
    expect(result.counts.matchedDirect + result.counts.matchedByRenewal + orphans).toBe(3);
  });

  it("counts every entitlement exactly once on the entitlement axis", () => {
    const result = run({
      payments: [payment()],
      subscriptions: [
        subscription({ id: "sub-1", paymongo_link_id: "gw_1" }),
        subscription({ id: "sub-2", paymongo_link_id: "comp-1", device_id: "dev-2" }),
        subscription({ id: "sub-3", paymongo_link_id: "gw_missing", device_id: "dev-3" }),
      ],
    });
    const entitlementExceptions = result.exceptions.filter((exception) =>
      exception.kind.startsWith("entitlement-")
    ).length;
    expect(result.counts.matchedDirect + entitlementExceptions).toBe(3);
  });

  it("produces nothing at all from empty inputs", () => {
    const result = run({});
    expect(result.exceptions).toEqual([]);
    expect(result.matched).toEqual([]);
    expect(result.counts.payments).toBe(0);
    expect(result.counts.entitlements).toBe(0);
  });
});

describe("reconcile — amount axis", () => {
  it("flags a payment at a price this product does not sell", () => {
    const result = run({
      payments: [payment({ amount: 1234 })],
      subscriptions: [subscription()],
    });
    expect(kinds(result)).toEqual(["amount-not-attributable"]);
  });

  it("does not flag a payment at a listed price", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(kinds(result)).not.toContain("amount-not-attributable");
  });

  it("flags an unattributable amount even on a payment that matched", () => {
    // The axes are independent: matching well says nothing about the price.
    const result = run({
      payments: [payment({ amount: 7 })],
      subscriptions: [subscription()],
    });
    expect(result.counts.matchedDirect).toBe(1);
    expect(kinds(result)).toContain("amount-not-attributable");
  });

  it("does not flag a block-priced payment", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_block_1", amount: 79900, subject_id: "subject-1", device_id: "dev-rep" })],
      classes: [classRow()],
    });
    expect(kinds(result)).not.toContain("amount-not-attributable");
  });
});

describe("reconcile — integrity axis", () => {
  it("flags two entitlements sharing one natural key", () => {
    const result = run({
      payments: [payment({ id: "pay-1", paymongo_link_id: "gw_1" }), payment({ id: "pay-2", paymongo_link_id: "gw_2" })],
      subscriptions: [
        subscription({ id: "sub-1", paymongo_link_id: "gw_1" }),
        subscription({ id: "sub-2", paymongo_link_id: "gw_2" }),
      ],
    });
    expect(kinds(result)).toContain("duplicate-entitlement");
  });

  it("flags a grant whose device disagrees with the payment's", () => {
    const result = run({
      payments: [payment({ device_id: "dev-payer" })],
      subscriptions: [subscription({ device_id: "dev-other" })],
    });
    expect(kinds(result)).toContain("grant-device-mismatch");
  });

  it("does not flag a matched pair that agrees on device", () => {
    const result = run({ payments: [payment()], subscriptions: [subscription()] });
    expect(kinds(result)).not.toContain("grant-device-mismatch");
  });
});

describe("exceptions carry enough to act on", () => {
  it("names the link id on every exception", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_missing", device_id: "dev-9" })],
    });
    expect(result.exceptions.every((exception) => exception.linkId.length > 0)).toBe(true);
  });

  it("writes a reason on every exception, not just a kind", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [subscription({ paymongo_link_id: "gw_missing", device_id: "dev-9" })],
    });
    expect(result.exceptions.every((exception) => exception.reason.trim().length > 0)).toBe(
      true
    );
  });

  it("keeps the device and year on an exception so it can be looked up", () => {
    const result = run({ payments: [payment({ paymongo_link_id: "gw_orphan" })] });
    expect(result.exceptions[0]).toMatchObject({ deviceId: "dev-1", yearId: "year-1" });
  });
});

describe("summariseExceptions", () => {
  it("reports every kind, zeroed, so the metrics row set never changes shape", () => {
    const summary = summariseExceptions([]);
    expect(Object.keys(summary.byKind).sort()).toEqual([...EXCEPTION_KINDS].sort());
    expect(Object.values(summary.byKind).every((count) => count === 0)).toBe(true);
  });

  it("counts the two unreconciled kinds separately from the explained ones", () => {
    const result = run({
      payments: [payment({ paymongo_link_id: "gw_orphan" })],
      subscriptions: [
        subscription({ paymongo_link_id: "gw_missing", device_id: "dev-2" }),
        subscription({ paymongo_link_id: "comp-1", device_id: "dev-3" }),
      ],
    });
    const summary = summariseExceptions(result.exceptions);
    expect(summary.unreconciled).toBe(2);
    expect(summary.byKind["entitlement-locally-minted"]).toBe(1);
  });

  it("totals the money sitting behind unmatched payments", () => {
    const result = run({
      payments: [
        payment({ id: "pay-1", paymongo_link_id: "gw_a", amount: 29900 }),
        payment({ id: "pay-2", paymongo_link_id: "gw_b", amount: 29900, device_id: "dev-2" }),
      ],
    });
    expect(summariseExceptions(result.exceptions).unmatchedPaymentCentavos).toBe(59800);
  });
});
