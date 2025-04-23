import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThisWeekPanel } from "./ThisWeekPanel";

describe("ThisWeekPanel empty states", () => {
  it("tells a brand-new user to start their first module, not that they're caught up", () => {
    render(<ThisWeekPanel recs={[]} nothingUnlocked />);
    expect(screen.getByText("Start your first module")).toBeInTheDocument();
    expect(screen.queryByText(/all caught up/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse subjects/i })).toHaveAttribute("href", "/year");
  });

  it("still says all caught up when unlocked subjects are finished", () => {
    render(<ThisWeekPanel recs={[]} />);
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });
});
