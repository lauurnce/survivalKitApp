import { describe, it, expect } from "vitest";
import {
  SENSITIVE_PLACEHOLDER,
  readLivemodeFlag,
  LIVEMODE_TRAP,
  modeMatchSignal,
  INTENT_EVENT_TYPES,
  intentPerPayment,
  quietLedger,
  WEBHOOK_LANDING_CEILING,
  INTENT_IS_NOT_DEVICES,
  abandonmentHandoff,
} from "./billingSignals";

const WINDOW = {
  sinceIso: "2026-08-01T16:00:00.000Z",
  untilIso: "2026-09-01T16:00:00.000Z",
};

describe("readLivemodeFlag", () => {
  it("reads an explicit true", () => {
    expect(readLivemodeFlag("true")).toMatchObject({ value: true, state: "true" });
  });

  it("reads an explicit false", () => {
    expect(readLivemodeFlag("false")).toMatchObject({ value: false, state: "false" });
  });

  it("reports an unset variable as unset, not as false", () => {
    expect(readLivemodeFlag(undefined)).toMatchObject({ value: null, state: "unset" });
  });

  it("reports the Sensitive placeholder as not read, never as a value", () => {
    expect(readLivemodeFlag(SENSITIVE_PLACEHOLDER)).toMatchObject({
      value: null,
      state: "sensitive-placeholder",
    });
  });

  it("reproduces the webhook's coercion exactly, including its failure mode", () => {
    // Everything that is not the literal "true" makes the app expect TEST.
    expect(readLivemodeFlag("true").appWouldExpectLive).toBe(true);
    expect(readLivemodeFlag("True").appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(" true").appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(undefined).appWouldExpectLive).toBe(false);
    expect(readLivemodeFlag(SENSITIVE_PLACEHOLDER).appWouldExpectLive).toBe(false);
  });

  it("flags any value that is neither a clean true nor a clean false", () => {
    expect(readLivemodeFlag("True").state).toBe("malformed");
    expect(readLivemodeFlag("").state).toBe("unset");
  });

  it("keeps the trap written down rather than leaving it to memory", () => {
    expect(LIVEMODE_TRAP).toMatch(/200/);
    expect(LIVEMODE_TRAP).toMatch(/silent/i);
  });
});

describe("modeMatchSignal", () => {
  it("treats any payment as proof the livemode gate passed", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 1, intentInWindow: 0 });
    expect(signal.state).toBe("consistent");
    expect(signal.hypotheses).toEqual([]);
  });

  it("reports intent with no money without deciding what caused it", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 25 });
    expect(signal.state).toBe("intent-without-money");
    expect(signal.hypotheses).toHaveLength(3);
  });

  it("names all three hypotheses, including the boring one", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 25 });
    const text = signal.hypotheses.join(" ").toLowerCase();
    expect(text).toContain("livemode");
    expect(text).toContain("webhook");
    expect(text).toMatch(/nobody|did not complete|no one/);
  });

  it("says nothing at all when nobody tried", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 0 });
    expect(signal.state).toBe("no-signal");
    expect(signal.hypotheses).toEqual([]);
  });

  it("carries the evidence it used, so the state can be checked", () => {
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: 4 });
    expect(signal.evidence).toMatchObject({ paymentsInWindow: 0, intentInWindow: 4 });
  });

  it("treats a null intent count as no signal rather than as zero", () => {
    // A failed count must never read as "nobody tried".
    const signal = modeMatchSignal({ paymentsInWindow: 0, intentInWindow: null });
    expect(signal.state).toBe("no-signal");
  });
});

describe("INTENT_EVENT_TYPES", () => {
  it("counts the two live paywall click events and nothing dead", () => {
    expect([...INTENT_EVENT_TYPES]).toEqual(["subscribe_click", "paywall_teaser_click"]);
  });
});

describe("intentPerPayment", () => {
  it("divides intent events by payments", () => {
    expect(intentPerPayment(40, 4)).toBe(10);
  });

  it("returns null rather than Infinity when nothing was paid", () => {
    expect(intentPerPayment(40, 0)).toBeNull();
  });

  it("returns null when intent could not be counted", () => {
    expect(intentPerPayment(null, 4)).toBeNull();
  });

  it("rounds to two decimals", () => {
    expect(intentPerPayment(10, 3)).toBe(3.33);
  });
});

describe("quietLedger", () => {
  const now = new Date("2026-08-08T05:00:00.000Z");

  it("counts whole days since the last payment", () => {
    expect(
      quietLedger("2026-08-01T05:00:00.000Z", now).daysSinceLastPayment
    ).toBe(7);
  });

  it("is null, not zero, when the ledger has never had a payment", () => {
    expect(quietLedger(null, now).daysSinceLastPayment).toBeNull();
  });

  it("does not go negative on a clock skew", () => {
    expect(
      quietLedger("2026-08-09T05:00:00.000Z", now).daysSinceLastPayment
    ).toBe(0);
  });
});

describe("abandonmentHandoff", () => {
  const handoff = abandonmentHandoff({
    window: WINDOW,
    intentEvents: 40,
    payments: 4,
  });

  it("names the window it covers", () => {
    expect(handoff.window).toEqual(WINDOW);
  });

  it("carries the ratio it computed", () => {
    expect(handoff.intentPerPayment).toBe(10);
  });

  it("states that this is not a conversion rate", () => {
    expect(handoff.caveat).toBe(INTENT_IS_NOT_DEVICES);
    expect(handoff.caveat).toMatch(/not a conversion rate/i);
  });

  it("points at the department that owns the device-level number", () => {
    expect(handoff.caveat.toLowerCase()).toContain("growth");
  });
});

describe("WEBHOOK_LANDING_CEILING", () => {
  it("names the manual procedure instead of implying the collector can do it", () => {
    expect(WEBHOOK_LANDING_CEILING).toMatch(/reconcile/i);
    expect(WEBHOOK_LANDING_CEILING).toMatch(/\[SENSITIVE\]/);
  });
});
