// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

const MODULE_PATH =
  "/year/11111111-1111-1111-1111-111111111111/subjects/22222222-2222-2222-2222-222222222222/modules/33333333-3333-3333-3333-333333333333";
vi.mock("next/navigation", () => ({ usePathname: () => MODULE_PATH }));

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => status,
}));

import { PaywallTeaser } from "./PaywallTeaser";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";

beforeEach(() => {
  logEvent.mockClear();
  status = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };
});

describe("PaywallTeaser", () => {
  it("reserves its space, invisibly, while the subscription check is in flight", () => {
    // Rendering nothing here let the teaser pop in above the module list once
    // the check resolved, shifting the whole page (CLS 0.24 on mobile).
    status = { subscribed: null, polling: false, unlocked: false, pollTimedOut: false };
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    const box = container.firstElementChild as HTMLElement;
    expect(box).not.toBeNull();
    // Same markup, so the same height at every viewport...
    expect(box.textContent).toContain("12 reviewers with answer keys in CP1");
    // ...but never painted, announced, or focusable, so a subscriber never
    // sees a paywall flash before it collapses.
    expect(box).toHaveClass("invisible");
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveAttribute("inert");
    expect(screen.queryByRole("link", { name: /unlock reviewers/i })).toBeNull();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it("shows the same box once the check confirms the reader has not paid", () => {
    status = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    const box = container.firstElementChild as HTMLElement;
    expect(box).not.toHaveClass("invisible");
    expect(box).not.toHaveAttribute("aria-hidden");
    expect(box).not.toHaveAttribute("inert");
  });

  it("renders nothing for a reader who already paid", () => {
    status = { subscribed: true, polling: false, unlocked: false, pollTimedOut: false };
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("stays hidden while a just-paid reader's payment is confirming", () => {
    for (const s of [
      { subscribed: false, polling: true, unlocked: false, pollTimedOut: false },
      { subscribed: false, polling: false, unlocked: false, pollTimedOut: true },
    ]) {
      status = s;
      const { container, unmount } = render(
        <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
      );
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
    expect(logEvent).not.toHaveBeenCalled();
  });

  it("keeps the value message and quotes no price when none is passed", () => {
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );

    expect(
      screen.getByText(/12 reviewers with answer keys in CP1 — practice exercises and full worked solutions\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/the first set is free to try\./i)).toBeInTheDocument();
    // The free set is the first module WITH reviewers, which is Unit VI in
    // Accounting and Kabanata 3 in Filipinolohiya, not "the first lesson" (QA CT-08).
    expect(screen.queryByText(/first lesson/i)).toBeNull();
    expect(container.textContent).not.toContain("₱");
  });

  it("quotes the starting price it is given and what it unlocks", () => {
    const { container } = render(
      <PaywallTeaser
        yearId={YEAR}
        subjectId={SUBJECT}
        subjectTitle="CP1"
        reviewerCount={12}
        fromPrice={{ amountLabel: "₱49", term: "for a month" }}
      />
    );

    expect(container.textContent).toContain("From ₱49 — unlocks every reviewer in CP1 for a month.");
  });

  it("carries the social-proof line", () => {
    render(<PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" />);
    expect(screen.getByText("Students rate it 4.7/5 · Used at 8+ universities")).toBeInTheDocument();
  });

  it("no longer advertises block pricing", () => {
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    expect(container.querySelector('a[href="/for-blocks"]')).toBeNull();
  });

  it("defaults its CTA to /unlock, carrying the current module path as the return trip", () => {
    render(<PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" />);

    expect(screen.getByRole("link", { name: /unlock reviewers/i })).toHaveAttribute(
      "href",
      `/unlock?year=${YEAR}&subject=${SUBJECT}&from=${encodeURIComponent(MODULE_PATH)}`
    );
  });

  it("uses an explicit from path over the current pathname", () => {
    const other = `/year/${YEAR}/subjects/${SUBJECT}/modules/44444444-4444-4444-4444-444444444444`;
    render(<PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" from={other} />);

    expect(screen.getByRole("link", { name: /unlock reviewers/i })).toHaveAttribute(
      "href",
      `/unlock?year=${YEAR}&subject=${SUBJECT}&from=${encodeURIComponent(other)}`
    );
  });

  it("logs paywall_teaser_view once when shown and paywall_teaser_click on the CTA", () => {
    const { rerender } = render(
      <div onClick={(e) => e.preventDefault()}>
        <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" />
      </div>
    );
    rerender(
      <div onClick={(e) => e.preventDefault()}>
        <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" />
      </div>
    );

    expect(logEvent.mock.calls.filter((c) => c[0] === "paywall_teaser_view")).toHaveLength(1);
    expect(logEvent).toHaveBeenCalledWith("paywall_teaser_view", {
      year_id: YEAR,
      subject_id: SUBJECT,
    });

    fireEvent.click(screen.getByRole("link", { name: /unlock reviewers/i }));
    expect(logEvent).toHaveBeenCalledWith("paywall_teaser_click", {
      year_id: YEAR,
      subject_id: SUBJECT,
    });
  });
});
