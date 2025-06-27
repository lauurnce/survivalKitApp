// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { YearEntitlements } from "@/hooks/useSubscriptionStatus";

let ents: YearEntitlements;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useYearEntitlements: () => ents,
  planForSubject: (e: YearEntitlements, id: string) => e.subjects[id] ?? e.year,
}));

import { SubjectUnlockedTag } from "./SubjectUnlockedTag";

beforeEach(() => {
  ents = { ready: true, year: null, subjects: {} };
});

describe("SubjectUnlockedTag", () => {
  it("renders nothing while loading", () => {
    ents = { ready: false, year: null, subjects: {} };
    const { container } = render(<SubjectUnlockedTag yearId="y" subjectId="cp1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a subject the reader has not paid for", () => {
    ents = { ready: true, year: null, subjects: { other: { scope: "subject", until: null } } };
    const { container } = render(<SubjectUnlockedTag yearId="y" subjectId="cp1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("tags a subject unlocked by a subject plan, with the end date on hover", () => {
    ents = { ready: true, year: null, subjects: { cp1: { scope: "subject", until: "2026-12-01T00:00:00Z" } } };
    render(<SubjectUnlockedTag yearId="y" subjectId="cp1" />);
    const tag = screen.getByText("Unlocked");
    expect(tag).toHaveAttribute("title", "Access until Dec 1, 2026");
  });

  it("tags every subject under a year pass", () => {
    ents = { ready: true, year: { scope: "year", until: "2027-01-31T00:00:00Z" }, subjects: {} };
    render(<SubjectUnlockedTag yearId="y" subjectId="anything" />);
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
  });
});
