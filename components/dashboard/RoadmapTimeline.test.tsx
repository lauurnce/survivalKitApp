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

  it("labels overall progress as marked done, not complete", () => {
    const milestone = {
      key: "y1-s1",
      label: "Year 1 • 1st Semester",
      yearId: "y1",
      semester: 1,
      yearPosition: 1,
      state: "current" as const,
      totalModules: 10,
      completedModules: 4,
      inProgressModules: 2,
      notStartedModules: 4,
      lockedModules: 0,
      unlockedAt: null,
      firstActivityAt: null,
      lastActivityAt: null,
      subjects: [],
    };
    const roadmapData = {
      journeyStartedAt: "",
      milestones: [milestone],
      overall: { totalModules: 10, completedModules: 4, inProgressModules: 2, completionRate: 40 },
    };
    render(<RoadmapTimeline nodes={[]} roadmapData={roadmapData} />);
    expect(screen.getByText("40% marked done overall")).toBeInTheDocument();
  });
});
