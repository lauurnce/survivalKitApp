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

  it("draws a current monthly subscription at the right end of the window", () => {
    const { container } = render(
      <ActivityGraph
        data={mkData()}
        showSubscriptionOverlay
        subscriptionItems={[{ startedAt: "2026-10-21T04:00:00Z", endsAt: "2026-11-21T04:00:00Z", progressPct: 30 }]}
      />,
    );
    const rect = container.querySelector(".subscription-overlay rect");
    expect(rect).not.toBeNull();
    const perDay = 560 / 55;
    expect(Number(rect!.getAttribute("x"))).toBeCloseTo(30 + 45.5 * perDay, 3);
    expect(Number(rect!.getAttribute("x")) + Number(rect!.getAttribute("width"))).toBeCloseTo(30 + 560, 3);
  });
});
