import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCard } from "./HeroCard";

describe("HeroCard greeting", () => {
  afterEach(() => vi.useRealTimers());

  it("greets by the Manila clock: 05:00 UTC is 1 PM in Manila", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T05:00:00Z"));
    render(<HeroCard term={null} topPick={undefined} profile={null} />);
    expect(screen.getByText("Good afternoon")).toBeInTheDocument();
  });
});
