import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCard } from "./HeroCard";
import type { CurrentTerm } from "@/lib/dashboard";

describe("HeroCard", () => {
  it("stat row wraps on narrow screens", () => {
    const mockTerm: CurrentTerm = {
      yearLabel: "2024",
      semester: 1,
      yearId: "1",
      yearSort: 1,
      subjects: [],
      modulesDone: 5,
      modulesTotal: 10,
      inProgress: 2,
      ready: 3,
    };
    render(<HeroCard term={mockTerm} topPick={undefined} profile={null} pro={false} />);
    const dl = screen.getByText("Modules done").closest("dl");
    expect(dl).toHaveClass("flex-wrap");
    expect(dl).toHaveClass("gap-y-4");
  });
});