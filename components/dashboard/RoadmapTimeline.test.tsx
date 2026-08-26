import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoadmapTimeline } from "./RoadmapTimeline";

describe("RoadmapTimeline", () => {
  it("has horizontal scroll container with snap", () => {
    const nodes = [
      { key: "1-1", short: "1-1", state: "past" as const },
      { key: "1-2", short: "1-2", state: "current" as const },
      { key: "grad", short: "Graduation", state: "future" as const },
    ];
    render(<RoadmapTimeline nodes={nodes} />);
    const ol = screen.getByRole("list");
    expect(ol).toHaveClass("overflow-x-auto");
    expect(ol).toHaveClass("snap-x");
    expect(ol).toHaveClass("snap-mandatory");
  });
});