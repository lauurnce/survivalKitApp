import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JourneyMarker } from "./JourneyMarker";

const overall = { totalModules: 10, completedModules: 4, inProgressModules: 2, completionRate: 40 };

describe("JourneyMarker", () => {
  // module_progress is a manual "Mark done" tap, not proof of completion.
  it("says modules were marked done, not completed", () => {
    render(<JourneyMarker journeyStartedAt="2026-08-10T00:00:00.000Z" overall={overall} />);
    expect(screen.getByText(/4 of 10 modules marked done/)).toBeInTheDocument();
    expect(screen.queryByText(/completed/i)).not.toBeInTheDocument();
  });
});
