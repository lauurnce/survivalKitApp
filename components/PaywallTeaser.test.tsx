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
  it("renders nothing while the subscription check is still in flight", () => {
    status = { subscribed: null, polling: false, unlocked: false, pollTimedOut: false };
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it("renders nothing for a reader who already paid", () => {
    status = { subscribed: true, polling: false, unlocked: false, pollTimedOut: false };
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the value message but quotes no price", () => {
    const { container } = render(
      <PaywallTeaser yearId={YEAR} subjectId={SUBJECT} subjectTitle="CP1" reviewerCount={12} />
    );

    expect(
      screen.getByText(/12 reviewers with answer keys in CP1 — drills, code labs, and full solutions\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/the first one's free\./i)).toBeInTheDocument();
    expect(container.textContent).not.toContain("₱");
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
