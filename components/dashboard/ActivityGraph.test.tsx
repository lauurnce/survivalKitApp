import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/react";
import { ActivityGraph } from "./ActivityGraph";
import type { ActivityData } from "@/lib/dashboard";

// 56 Manila days, 2026-09-06 .. 2026-10-31, grouped into weeks.
function mkData(): ActivityData {
  const days = Array.from({ length: 56 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 8, 6 + i)).toISOString().slice(0, 10);
    return { date: d, isActive: false, eventCount: 0 };
  });
  const weeks = [];
  for (let i = 0; i < 56; i += 7) {
    weeks.push({ weekStart: days[i].date, activeDays: 0, totalEvents: 0, days: days.slice(i, i + 7) });
  }
  return { weeks, currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
}

const WIDTH = 610; // padding 30 + 20 → inner width 560, i.e. 560/55 px per day

describe("ActivityGraph", () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => WIDTH });
  });
  afterAll(() => {
    if (original) Object.defineProperty(HTMLElement.prototype, "clientWidth", original);
  });

  it("renders the graph once its container is measured", () => {
    const { getByRole } = render(<ActivityGraph data={mkData()} />);
    expect(getByRole("img", { name: /activity graph/i })).toBeInTheDocument();
  });

});
