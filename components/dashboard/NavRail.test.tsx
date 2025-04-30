import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavRail } from "./NavRail";

let pathname = "/account";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("NavRail", () => {
  it("mobile nav rail is horizontally scrollable", () => {
    render(<NavRail overallDone={0} overallTotal={0} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("overflow-x-auto");
  });
});
describe("NavRail signed out (CT-16)", () => {
  it("swaps the 0 / 0 ring for a log-in prompt that returns to this page", () => {
    pathname = "/resources";
    render(<NavRail overallDone={0} overallTotal={0} signedIn={false} />);
    expect(screen.queryByText("0 / 0")).not.toBeInTheDocument();
    expect(screen.queryByText(/modules done/i)).not.toBeInTheDocument();
    expect(screen.getByText(/log in to track your progress/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fresources");
    pathname = "/account";
  });

  it("keeps the progress ring for a signed-in reader", () => {
    render(<NavRail overallDone={3} overallTotal={10} />);
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });
});
