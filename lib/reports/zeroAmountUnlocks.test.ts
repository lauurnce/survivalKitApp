import { describe, expect, it } from "vitest";
import {
  COUPON_LINK_PREFIX,
  ZERO_AMOUNT_WEEKLY_THRESHOLD,
  ZERO_AMOUNT_WINDOW_DAYS,
  zeroAmountMetrics,
  zeroAmountSignal,
} from "./zeroAmountUnlocks";

describe("zeroAmountSignal", () => {
  it("flags more than 3 free unlocks in 7 days", () => {
    expect(ZERO_AMOUNT_WEEKLY_THRESHOLD).toBe(3);
    expect(ZERO_AMOUNT_WINDOW_DAYS).toBe(7);
    expect(zeroAmountSignal({ lastWindow: 4, allTime: 10 }).flagged).toBe(true);
  });

  it("does not flag at exactly the threshold", () => {
    expect(zeroAmountSignal({ lastWindow: 3, allTime: 3 }).flagged).toBe(false);
    expect(zeroAmountSignal({ lastWindow: 0, allTime: 0 }).flagged).toBe(false);
  });

  it("returns null, not ok, when the windowed count was not read", () => {
    expect(zeroAmountSignal({ lastWindow: null, allTime: 5 }).flagged).toBeNull();
  });

  it("does not flag on a large all-time count alone", () => {
    expect(zeroAmountSignal({ lastWindow: 1, allTime: 500 }).flagged).toBe(false);
  });
});

describe("zeroAmountMetrics", () => {
  it("renders stable labels with FLAG when over threshold", () => {
    const metrics = zeroAmountMetrics(zeroAmountSignal({ lastWindow: 5, allTime: 12 }));
    expect(metrics).toEqual([
      { label: "Free coupon unlocks 7d", value: 5 },
      { label: "Free coupon unlocks total", value: 12 },
      { label: "Free unlocks >3/7d", value: "FLAG" },
    ]);
  });

  it("renders ok under threshold", () => {
    const metrics = zeroAmountMetrics(zeroAmountSignal({ lastWindow: 2, allTime: 2 }));
    expect(metrics[2].value).toBe("ok");
  });

  it("keeps every row, as not read, when counts are unavailable", () => {
    const metrics = zeroAmountMetrics(zeroAmountSignal({ lastWindow: null, allTime: null }));
    expect(metrics.map((m) => m.value)).toEqual([null, null, null]);
    expect(metrics).toHaveLength(3);
  });

  it("keeps labels within the health table's label column", () => {
    for (const m of zeroAmountMetrics(zeroAmountSignal({ lastWindow: 0, allTime: 0 }))) {
      expect(m.label.length).toBeLessThan(30);
    }
  });
});

describe("COUPON_LINK_PREFIX", () => {
  it("matches the link id /api/subscribe writes for a free unlock", () => {
    expect(COUPON_LINK_PREFIX).toBe("coupon:");
  });
});
