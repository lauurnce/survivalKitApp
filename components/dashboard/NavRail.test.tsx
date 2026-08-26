import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavRail } from "./NavRail";

vi.mock("next/navigation", () => ({
  usePathname: () => "/account",
}));

describe("NavRail", () => {
  it("mobile nav rail is horizontally scrollable", () => {
    render(<NavRail overallDone={0} overallTotal={0} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("overflow-x-auto");
  });
});