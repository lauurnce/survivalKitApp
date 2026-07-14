import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SubjectIcon } from "./SubjectIcon";

describe("SubjectIcon", () => {
  it("renders an svg for a known subject", () => {
    const { container } = render(<SubjectIcon title="Computer Programming 1" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders (fallback svg) for an unknown subject without crashing", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<SubjectIcon title="Totally Made Up Subject" />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("applies a custom className to the tile", () => {
    const { container } = render(<SubjectIcon title="Ethics" className="w-9 h-9" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile.className).toContain("w-9");
  });

  it("is decorative (aria-hidden)", () => {
    const { container } = render(<SubjectIcon title="Ethics" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile.getAttribute("aria-hidden")).toBe("true");
  });
});
