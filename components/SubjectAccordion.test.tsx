// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/SubjectProgressBar", () => ({
  SubjectProgressBar: () => null,
}));

vi.mock("@/components/dashboard/SubjectIcon", () => ({
  SubjectIcon: () => null,
}));

import { SubjectAccordion } from "./SubjectAccordion";

describe("SubjectAccordion", () => {
  it("identifies repeated module controls by subject", () => {
    render(
      <SubjectAccordion
        subject={{ id: "cp1", title: "Computer Programming 1", kind: "major" }}
        modules={[{ id: "variables", title: "Variables and types", sort_order: 1 }]}
        yearId="first-year"
        index={0}
        reads={0}
      />
    );

    expect(
      screen.getByRole("link", { name: "View modules for Computer Programming 1" })
    ).toHaveAttribute("href", "/year/first-year/subjects/cp1/modules");

    const toggle = screen.getByRole("button", {
      name: "Show modules for Computer Programming 1",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(
      screen.getByRole("button", { name: "Hide modules for Computer Programming 1" })
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Variables and types/ })).toBeInTheDocument();
  });

  // Both controls were under WCAG 2.5.8's 24px on phones: the toggle was 11px
  // tall and the arrow link 14px wide (QA CR-07). 44px is the system minimum.
  it("gives the toggle and the arrow link 44px tap targets", () => {
    render(
      <SubjectAccordion
        subject={{ id: "cp1", title: "Computer Programming 1", kind: "major" }}
        modules={[{ id: "variables", title: "Variables and types", sort_order: 1 }]}
        yearId="first-year"
        index={0}
        reads={0}
      />
    );
    expect(screen.getByRole("button", { name: /show modules/i })).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: /view modules for/i })).toHaveClass("min-h-11", "min-w-11");
  });

  it("lets a long single-word title wrap instead of overflowing the row", () => {
    render(
      <SubjectAccordion
        subject={{ id: "tp", title: "Technopreneurship", kind: "major" }}
        modules={[]}
        yearId="third-year"
        index={0}
        reads={0}
      />
    );
    const h2 = screen.getByRole("heading", { name: "Technopreneurship" });
    expect(h2).toHaveClass("[overflow-wrap:anywhere]");
    // Every flex column between the row and the title can shrink.
    for (let el = h2.parentElement; el && !el.className.includes("py-8"); el = el.parentElement) {
      if (el.className.includes("flex-1")) expect(el).toHaveClass("min-w-0");
    }
  });
});
