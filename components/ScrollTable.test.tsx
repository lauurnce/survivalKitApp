// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollTable } from "./ScrollTable";

function setSize(el: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, value: clientWidth });
}

describe("ScrollTable", () => {
  it("shows the scroll hint only while more of the table is off to the right", () => {
    const { container, rerender } = render(<ScrollTable><table /></ScrollTable>);
    expect(screen.queryByText(/scroll →/i)).toBeNull();

    const region = screen.getByRole("region");
    setSize(region, 600, 300);
    region.dispatchEvent(new Event("scroll"));
    rerender(<ScrollTable><table /></ScrollTable>);
    expect(screen.getByText(/scroll →/i)).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-scroll-table", "more");

    region.scrollLeft = 300;
    region.dispatchEvent(new Event("scroll"));
    rerender(<ScrollTable><table /></ScrollTable>);
    expect(screen.queryByText(/scroll →/i)).toBeNull();
  });
});
