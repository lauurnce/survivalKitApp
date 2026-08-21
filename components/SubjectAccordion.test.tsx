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
});
