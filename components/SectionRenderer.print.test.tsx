// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/year/y/subjects/s/modules/m",
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn(), logSectionView: vi.fn() }));
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({ subscribed: false, polling: false, unlocked: false, pollTimedOut: false }),
}));

import { SectionRenderer } from "./SectionRenderer";

const common = {
  moduleId: "33333333-3333-3333-3333-333333333333",
  yearId: "11111111-1111-1111-1111-111111111111",
  subjectId: "22222222-2222-2222-2222-222222222222",
  subjectTitle: "CP1",
  reviewerCount: 4,
};

describe("SectionRenderer — print", () => {
  it("prints a locked reviewer as its title and a note, hiding the preview and CTA", () => {
    const { container } = render(
      <SectionRenderer
        {...common}
        index={1}
        unlockAll={false}
        section={{ id: "a1", kind: "activity", heading: "Drill one", body_md: "", sort_order: 2 }}
      />,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveClass("print-section");
    expect(section).toHaveAttribute("data-kind", "activity");

    const note = screen.getByText(/not included in this printout/i).closest("p")!;
    expect(note).toHaveClass("hidden", "print:block");

    // Everything else in a locked section is screen-only.
    const screenOnly = Array.from(section.children).filter((el) => el !== note);
    expect(screenOnly.length).toBeGreaterThan(0);
    for (const el of screenOnly) expect(el).toHaveClass("print:hidden");
  });

  it("marks readable sections for print page-break rules", () => {
    const { container } = render(
      <SectionRenderer
        {...common}
        index={0}
        unlockAll={false}
        section={{ id: "c1", kind: "content", heading: "Intro", body_md: "Text", sort_order: 1 }}
      />,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveClass("print-section");
    expect(section).toHaveAttribute("data-kind", "content");
    expect(screen.queryByText(/not included in this printout/i)).not.toBeInTheDocument();
  });
});
