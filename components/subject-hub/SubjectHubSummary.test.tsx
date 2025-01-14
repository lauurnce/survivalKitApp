// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubjectHubSummary } from "./SubjectHubSummary";
import type { SubjectSummary } from "@/lib/subjectHub/summary";

const base: SubjectSummary = {
  lessonCount: 16,
  examPrepCount: 0,
  reviewerCount: 52,
  freeModule: { id: "m1", title: "Networking Today", reviewerCount: 2 },
  allFree: false,
  emptyModuleIds: [],
};

describe("SubjectHubSummary", () => {
  it("prints the counts and names the free module", () => {
    render(<SubjectHubSummary summary={base} />);
    expect(screen.getByText("16 lessons · 52 reviewers")).toBeInTheDocument();
    expect(
      screen.getByText("Every lesson is free to read. The 2 reviewers in Networking Today are free too."),
    ).toBeInTheDocument();
  });

  it("omits the free line when the subject has no reviewers", () => {
    render(<SubjectHubSummary summary={{ ...base, reviewerCount: 0, freeModule: null }} />);
    expect(screen.getByText("16 lessons")).toBeInTheDocument();
    expect(screen.queryByText(/free/)).toBeNull();
  });

  it("renders nothing for an empty subject", () => {
    const { container } = render(
      <SubjectHubSummary summary={{ ...base, lessonCount: 0, reviewerCount: 0, freeModule: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
