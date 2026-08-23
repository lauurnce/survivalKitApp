// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ModuleDoneToggle", () => ({
  ModuleDoneToggle: () => <button type="button">Mark done</button>,
}));

import { ModuleListItem } from "./ModuleListItem";

const PROPS = {
  href: "/year/1/subjects/cp1/modules/m1",
  index: 0,
  moduleId: "m1",
  title: "Lesson 1: Programming Concepts",
  readCount: 5800,
  isPro: false,
  share: {
    subjectId: "cp1",
    subjectTitle: "Computer Programming 1",
    moduleTitle: "Lesson 1: Programming Concepts",
    moduleIds: ["m1"],
  },
};

describe("ModuleListItem", () => {
  it("keeps the progress button separate from the navigation link", () => {
    const { container } = render(<ModuleListItem {...PROPS} />);
    const link = screen.getByRole("link", { name: /open lesson 1/i });
    const toggle = screen.getByRole("button", { name: /mark done/i });

    expect(link).toHaveAttribute("href", PROPS.href);
    expect(link).not.toContainElement(toggle);
    expect(container.querySelector("a button")).toBeNull();
  });

  it("lets the title shrink and hides the decorative arrow on narrow screens", () => {
    const { container } = render(<ModuleListItem {...PROPS} />);
    const row = container.firstElementChild;
    const heading = screen.getByRole("heading", { name: PROPS.title });
    const content = heading.parentElement?.parentElement;

    expect(row).toHaveClass("gap-3", "sm:gap-6");
    expect(content).toHaveClass("min-w-0");
    expect(heading).toHaveClass("break-words");
    expect(screen.getByText("→")).toHaveClass("hidden", "sm:block");
  });
});
