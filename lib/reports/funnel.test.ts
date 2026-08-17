import { describe, it, expect } from "vitest";
import {
  FUNNEL_STEPS,
  buildFunnel,
  largestLeak,
  funnelMetrics,
  pct,
  type FunnelCounts,
} from "./funnel";

// Synthetic fixtures. These are invented shapes for testing arithmetic and
// carry no relationship to production traffic.
const counts: FunnelCounts = {
  enter: 1000,
  year_select: 800,
  subject_open: 600,
  module_open: 500,
  paywall_teaser_view: 200,
  paywall_teaser_click: 40,
  subscribe_click: 20,
  paid: 2,
};

describe("FUNNEL_STEPS", () => {
  it("is the live path in order, ending at a ledger-sourced completion", () => {
    expect(FUNNEL_STEPS.map((s) => s.key)).toEqual([
      "enter",
      "year_select",
      "subject_open",
      "module_open",
      "paywall_teaser_view",
      "paywall_teaser_click",
      "subscribe_click",
      "paid",
    ]);
  });

  it("marks paid as coming from the ledger, not from an event", () => {
    expect(FUNNEL_STEPS.at(-1)).toMatchObject({ key: "paid", source: "ledger" });
    expect(FUNNEL_STEPS.slice(0, -1).every((s) => s.source === "events")).toBe(true);
  });

  it("contains no dead event type", () => {
    const keys = FUNNEL_STEPS.map((s) => s.key);
    expect(keys).not.toContain("unlock_click");
    expect(keys).not.toContain("unlock_submitted");
  });
});

describe("pct", () => {
  it("returns whole percentage points", () => {
    expect(pct(20, 200)).toBe(10);
  });

  it("rounds to the nearest point", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(2, 3)).toBe(67);
  });

  it("returns null rather than 0 when the denominator is zero", () => {
    expect(pct(0, 0)).toBeNull();
    expect(pct(5, 0)).toBeNull();
  });

  it("does not clamp above 100", () => {
    expect(pct(150, 100)).toBe(150);
  });
});

describe("buildFunnel", () => {
  it("returns one step per definition, in order", () => {
    expect(buildFunnel(counts).map((s) => s.key)).toEqual(
      FUNNEL_STEPS.map((s) => s.key)
    );
  });

  it("carries the device count for each step", () => {
    expect(buildFunnel(counts)[0].devices).toBe(1000);
    expect(buildFunnel(counts).at(-1)!.devices).toBe(2);
  });

  it("leaves the first step with no previous-step conversion", () => {
    expect(buildFunnel(counts)[0].fromPrevious).toBeNull();
    expect(buildFunnel(counts)[0].fromTop).toBe(100);
  });

  it("computes step-to-step and top-of-funnel conversion in percentage points", () => {
    const steps = buildFunnel(counts);
    const paywall = steps.find((s) => s.key === "paywall_teaser_view")!;
    expect(paywall.fromPrevious).toBe(40); // 200 of 500
    expect(paywall.fromTop).toBe(20); // 200 of 1000
  });

  it("treats a missing count as zero rather than throwing", () => {
    const steps = buildFunnel({ enter: 10 } as FunnelCounts);
    expect(steps.find((s) => s.key === "subscribe_click")!.devices).toBe(0);
  });

  it("reports conversion above 100% instead of clamping it", () => {
    // Deep links: a device can reach module_open without ever emitting enter.
    const steps = buildFunnel({ ...counts, module_open: 900 });
    const step = steps.find((s) => s.key === "module_open")!;
    expect(step.fromPrevious).toBe(150);
    expect(step.nonMonotonic).toBe(true);
  });

  it("flags only the steps that actually exceed their predecessor", () => {
    expect(buildFunnel(counts).some((s) => s.nonMonotonic)).toBe(false);
  });

  it("returns null conversion when the previous step had no devices", () => {
    const steps = buildFunnel({ ...counts, paywall_teaser_view: 0 });
    expect(steps.find((s) => s.key === "paywall_teaser_click")!.fromPrevious).toBeNull();
  });
});

describe("largestLeak", () => {
  it("names the transition that lost the most devices", () => {
    const leak = largestLeak(buildFunnel(counts))!;
    expect(leak.fromKey).toBe("module_open");
    expect(leak.toKey).toBe("paywall_teaser_view");
    expect(leak.lost).toBe(300);
    expect(leak.rate).toBe(60);
  });

  it("does not pick a high-rate drop over a high-volume one", () => {
    // paywall_teaser_view -> paywall_teaser_click loses 80% but only 160
    // devices; module_open -> paywall_teaser_view loses 60% and 300 devices.
    const leak = largestLeak(buildFunnel(counts))!;
    expect(leak.lost).toBeGreaterThan(160);
  });

  it("breaks a tie on devices lost by choosing the steeper rate", () => {
    const steps = buildFunnel({
      enter: 100,
      year_select: 90, // lost 10, rate 10%
      subject_open: 80, // lost 10, rate 11%
      module_open: 80,
      paywall_teaser_view: 80,
      paywall_teaser_click: 80,
      subscribe_click: 80,
      paid: 80,
    });
    const leak = largestLeak(steps)!;
    expect(leak.fromKey).toBe("year_select");
  });

  it("ignores transitions that gained devices", () => {
    const steps = buildFunnel({ ...counts, year_select: 1200 });
    expect(largestLeak(steps)!.fromKey).not.toBe("enter");
  });

  it("returns null when nothing was lost anywhere", () => {
    const flat = buildFunnel({
      enter: 5,
      year_select: 5,
      subject_open: 5,
      module_open: 5,
      paywall_teaser_view: 5,
      paywall_teaser_click: 5,
      subscribe_click: 5,
      paid: 5,
    });
    expect(largestLeak(flat)).toBeNull();
  });

  it("returns null on a completely empty funnel", () => {
    expect(largestLeak(buildFunnel({} as FunnelCounts))).toBeNull();
  });
});

describe("funnelMetrics", () => {
  it("emits one numbered row per step plus the leak", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    expect(rows).toHaveLength(FUNNEL_STEPS.length + 2);
    expect(rows[0].label).toBe("1 Opened app");
    expect(rows[0].value).toBe(1000);
  });

  it("labels the ledger step so its source is never mistaken", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    expect(rows[7].label).toBe("8 Paid (ledger)");
  });

  it("renders the leak as its lost-device count with a percentage row", () => {
    const steps = buildFunnel(counts);
    const rows = funnelMetrics(steps, largestLeak(steps));
    const lost = rows.find((r) => r.label === "Largest leak (devices)")!;
    const rate = rows.find((r) => r.label === "Largest leak (%)")!;
    expect(lost.value).toBe(300);
    expect(rate.value).toBe(60);
    expect(rate.unit).toBe("%");
  });

  it("records a null leak as not-read rather than zero", () => {
    const rows = funnelMetrics(buildFunnel({} as FunnelCounts), null);
    expect(rows.find((r) => r.label === "Largest leak (devices)")!.value).toBeNull();
    expect(rows.find((r) => r.label === "Largest leak (%)")!.value).toBeNull();
  });

  it("keeps the row set identical whatever the data", () => {
    const a = funnelMetrics(buildFunnel(counts), largestLeak(buildFunnel(counts)));
    const b = funnelMetrics(buildFunnel({} as FunnelCounts), null);
    expect(a.map((r) => r.label)).toEqual(b.map((r) => r.label));
  });
});
