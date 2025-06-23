import { describe, expect, it } from "vitest";
import { READ_COUNTER_WINDOW_HOURS, readCounterMetrics, readCounterSignal } from "./readCounter";

describe("readCounterSignal", () => {
  it("uses a 24h window", () => {
    expect(READ_COUNTER_WINDOW_HOURS).toBe(24);
  });

  it("flags lesson opens with no counter update", () => {
    expect(readCounterSignal({ lessonOpens: 12, counterTouches: 0 }).flagged).toBe(true);
  });

  it("is ok when the counter moved", () => {
    expect(readCounterSignal({ lessonOpens: 12, counterTouches: 40 }).flagged).toBe(false);
  });

  it("is ok on a quiet day with no opens and no updates", () => {
    expect(readCounterSignal({ lessonOpens: 0, counterTouches: 0 }).flagged).toBe(false);
  });

  it("returns null, not ok, when either count was not read", () => {
    expect(readCounterSignal({ lessonOpens: null, counterTouches: 0 }).flagged).toBeNull();
    expect(readCounterSignal({ lessonOpens: 5, counterTouches: null }).flagged).toBeNull();
  });
});

describe("readCounterMetrics", () => {
  it("renders stable labels with FLAG when silent", () => {
    expect(readCounterMetrics(readCounterSignal({ lessonOpens: 7, counterTouches: 0 }))).toEqual([
      { label: "Lesson opens 24h", value: 7 },
      { label: "Reader counter updates 24h", value: 0 },
      { label: "Reader counter silent", value: "FLAG" },
    ]);
  });

  it("renders null, not ok, when unknown", () => {
    const metrics = readCounterMetrics(readCounterSignal({ lessonOpens: null, counterTouches: null }));
    expect(metrics.at(-1)).toEqual({ label: "Reader counter silent", value: null });
  });
});
