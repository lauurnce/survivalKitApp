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
        freeSectionIds={["other"]}
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
        freeSectionIds={["other"]}
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
            freeSectionIds={["other"]}
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
        freeSectionIds={["free-1"]}
      />
    );

    expect(screen.getByText("Answer key body")).toBeInTheDocument();
    expect(screen.queryByText(/reviewer — locked/i)).not.toBeInTheDocument();
    expect(screen.getByText(/that was the free sample: 1 of 12 reviewers/i)).toBeInTheDocument();
  });

  it("renders every free-sample reviewer in full but upsells only under the last", () => {
    const free = ["free-1", "free-2", "free-3"];
    render(
      <>
        {free.map((id, i) => (
          <SectionRenderer
            key={id}
            {...common}
            section={activity(id, `Reviewer ${i}`, `Body ${i}`)}
            index={i}
            unlockAll={false}
            freeSectionIds={free}
          />
        ))}
        <SectionRenderer
          {...common}
          section={activity("locked-1", "Later Reviewer")}
          index={3}
          unlockAll={false}
          freeSectionIds={free}
        />
      </>
    );

    expect(screen.getByText("Body 0")).toBeInTheDocument();
    expect(screen.getByText("Body 1")).toBeInTheDocument();
    expect(screen.getByText("Body 2")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /unlock all reviewers/i })).toHaveLength(1);
    expect(screen.getByText(/that was the free sample: 3 of 12 reviewers/i)).toBeInTheDocument();
    // The section outside the sample still gets the locked strip.
    expect(screen.getAllByText(/reviewer — locked/i)).toHaveLength(1);
  });

  it("offers no upsell when the free sample is every reviewer in the subject", () => {
    // Operating Systems: 3 of 3 reviewers free. "Unlock the rest" sold nothing (QA CT-07).
    const free = ["f1", "f2", "f3"];
    const { container } = render(
      <>
        {free.map((id, i) => (
          <SectionRenderer
            key={id}
            {...common}
            reviewerCount={3}
            section={activity(id, `Reviewer ${i}`, `Body ${i}`)}
            index={i}
            unlockAll={false}
            freeSectionIds={free}
          />
        ))}
      </>
    );

    expect(screen.getByText("Body 2")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /unlock/i })).toBeNull();
    expect(container.textContent).not.toMatch(/free sample/i);
  });

  it("sends the free sample's upsell to /unlock, not a #subscribe anchor that may not exist", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("free-1", "Sample Reviewer", "Answer key body")}
        index={0}
        unlockAll={false}
        freeSectionIds={["free-1"]}
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
          freeSectionIds={["free-1"]}
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
            freeSectionIds={["other"]}
          />
        ))}
      </>
    );

    expect(container.querySelectorAll("#subscribe")).toHaveLength(0);
  });

  // `ink` flips to the light colour in dark mode, so a `dark:bg-ink` pill
  // turned into a light slab with 1.71:1 text. `paper` already flips.
  it("keeps the Pro activity pill on the theme-aware paper surface in dark mode", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("a1", "Worked Exam Solutions")}
        index={4}
        unlockAll={false}
        freeSectionIds={["other"]}
      />
    );

    const pill = screen.getByText("Pro activity").parentElement!;
    expect(pill).toHaveClass("bg-paper/90");
    expect(pill.className).not.toMatch(/dark:bg-(ink|navy|taupe)/);
  });

  it("renders the body when the reader has unlocked the subject", () => {
    render(
      <SectionRenderer
        {...common}
        section={activity("a1", "Worked Exam Solutions", "Full solutions")}
        index={4}
        unlockAll={true}
        freeSectionIds={[]}
      />
    );

    expect(screen.getByText("Full solutions")).toBeInTheDocument();
    expect(screen.queryByText(/reviewer — locked/i)).not.toBeInTheDocument();
  });
});
