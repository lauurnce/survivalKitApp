// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProBadge } from "./ProBadge";

describe("ProBadge", () => {
  it("renders the PRO pill text", () => {
    render(<ProBadge />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("uses the small gradient-pill classes by default", () => {
    const { container } = render(<ProBadge />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("rounded-full");
    expect(badge.className).toContain("bg-gradient-to-r");
    expect(badge.className).toContain("text-[10px]");
    expect(badge.className).toContain("uppercase");
  });

  it("grows with the md size variant", () => {
    const { container } = render(<ProBadge size="md" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("text-xs");
    expect(badge.className).not.toContain("text-[10px]");
  });

  it("merges extra classNames without dropping the base ones", () => {
    const { container } = render(<ProBadge className="ml-2 align-middle" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("ml-2");
    expect(badge.className).toContain("align-middle");
    expect(badge.className).toContain("rounded-full");
  });
});
