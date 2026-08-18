// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
  logSectionView: vi.fn(),
}));
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({
    subscribed: false,
    polling: false,
    unlocked: false,
    pollTimedOut: false,
  }),
}));

import { SectionRenderer } from "./SectionRenderer";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";

function activity(id: string, heading: string, body = "") {
  return { id, kind: "activity", heading, body_md: body, sort_order: 1 };
}

const common = {
  moduleId: MODULE,
  yearId: YEAR,
  subjectId: SUBJECT,
  yearLabel: "1st Year",
  subjectTitle: "CP1",
  reviewerCount: 12,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SectionRenderer — locked activities", () => {
  it("renders a compact locked strip instead of the pricing table", () => {
    const { container } = render(
      <SectionRenderer
        {...common}
        section={activity("a1", "Worked Exam Solutions")}
        index={4}
        unlockAll={false}
        freeSectionId="other"
      />
    );

    expect(screen.getByText("Worked Exam Solutions")).toBeInTheDocument();
    expect(screen.getByText(/reviewer — locked/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /unlock/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/unlock?")
    );
    expect(container.textContent).not.toContain("₱");
  });

  it("points the locked strip back at this module for the return trip", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("a1", "Code Lab")}
        index={5}
        unlockAll={false}
        freeSectionId="other"
      />
    );

    const href = screen.getByRole("link", { name: /unlock/i }).getAttribute("href");
    expect(href).toContain(
      `from=${encodeURIComponent(`/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`)}`
    );
  });

  it("shows one strip per locked reviewer and no price on the whole page", () => {
    const { container } = render(
      <>
        {["a1", "a2", "a3"].map((id, i) => (
          <SectionRenderer
            key={id}
            {...common}
            section={activity(id, `Reviewer ${i}`)}
            index={i}
            unlockAll={false}
            freeSectionId="other"
          />
        ))}
      </>
    );

    expect(screen.getAllByText(/reviewer — locked/i)).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /unlock/i })).toHaveLength(3);
    expect(container.textContent).not.toContain("₱");
  });

  it("still renders the subject's free sample in full", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("free-1", "Sample Reviewer", "Answer key body")}
        index={0}
        unlockAll={false}
        freeSectionId="free-1"
      />
    );

    expect(screen.getByText("Answer key body")).toBeInTheDocument();
    expect(screen.queryByText(/reviewer — locked/i)).not.toBeInTheDocument();
    expect(screen.getByText(/that was 1 of 12 reviewers/i)).toBeInTheDocument();
  });

  it("sends the free sample's upsell to /unlock, not a #subscribe anchor that may not exist", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("free-1", "Sample Reviewer", "Answer key body")}
        index={0}
        unlockAll={false}
        freeSectionId="free-1"
      />
    );

    expect(screen.getByRole("link", { name: /unlock all reviewers/i })).toHaveAttribute(
      "href",
      `/unlock?year=${YEAR}&subject=${SUBJECT}&from=${encodeURIComponent(
        `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`
      )}`
    );
  });

  it("logs unlock_click from the free sample's upsell, like the locked strip does", () => {
    // Without this the admin funnel's "Tapped Unlock" step undercounts every
    // reader who converted off the free sample.
    render(
      <div onClick={(e) => e.preventDefault()}>
        <SectionRenderer
          {...common}
          section={activity("free-1", "Sample Reviewer", "Answer key body")}
          index={0}
          unlockAll={false}
          freeSectionId="free-1"
        />
      </div>
    );

    fireEvent.click(screen.getByRole("link", { name: /unlock all reviewers/i }));

    expect(logEvent).toHaveBeenCalledWith("unlock_click", {
      year_id: YEAR,
      subject_id: SUBJECT,
    });
  });

  it("emits no #subscribe anchor — nothing links to it, and every locked strip duplicated the id", () => {
    const { container } = render(
      <>
        {["a1", "a2", "a3"].map((id, i) => (
          <SectionRenderer
            key={id}
            {...common}
            section={activity(id, `Reviewer ${i}`)}
            index={i}
            unlockAll={false}
            freeSectionId="other"
          />
        ))}
      </>
    );

    expect(container.querySelectorAll("#subscribe")).toHaveLength(0);
  });

  it("renders the body when the reader has unlocked the subject", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("a1", "Worked Exam Solutions", "Full solutions")}
        index={4}
        unlockAll={true}
        freeSectionId={null}
      />
    );

    expect(screen.getByText("Full solutions")).toBeInTheDocument();
    expect(screen.queryByText(/reviewer — locked/i)).not.toBeInTheDocument();
  });
});
