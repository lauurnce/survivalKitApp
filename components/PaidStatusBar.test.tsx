// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

let status: SubscriptionStatus;
const retry = vi.fn();
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => status,
  retrySubscriptionCheck: (...a: unknown[]) => retry(...a),
}));

import { PaidStatusBar } from "./PaidStatusBar";

const props = { yearId: "y", subjectId: "s", subjectTitle: "Computer Programming 1", yearLabel: "1st Year" };
const base: SubscriptionStatus = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };

beforeEach(() => {
  status = { ...base };
  retry.mockClear();
});

describe("PaidStatusBar", () => {
  it("renders nothing while the status loads", () => {
    status = { ...base, subscribed: null };
    const { container } = render(<PaidStatusBar {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a reader without access", () => {
    const { container } = render(<PaidStatusBar {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a subject plan with its access end date", () => {
    status = { ...base, subscribed: true, plan: { scope: "subject", until: "2026-12-01T00:00:00Z" } };
    render(<PaidStatusBar {...props} />);
    expect(screen.getByText("Unlocked · Computer Programming 1 · access until Dec 1, 2026")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows a year pass by the year's label", () => {
    status = { ...base, subscribed: true, plan: { scope: "year", until: "2027-01-31T00:00:00Z" } };
    render(<PaidStatusBar {...props} tone="dark" />);
    expect(screen.getByText("1st Year pass · until Jan 31, 2027")).toBeInTheDocument();
  });

  it("still says unlocked when the server sent no plan details", () => {
    status = { ...base, subscribed: true };
    render(<PaidStatusBar {...props} />);
    expect(screen.getByText("Unlocked · Computer Programming 1")).toBeInTheDocument();
  });

  it("says the payment is being unlocked while the poll runs", () => {
    status = { ...base, polling: true };
    render(<PaidStatusBar {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent("Payment received — unlocking…");
  });

  it("offers a retry, not an upsell, when the poll window runs out", () => {
    status = { ...base, pollTimedOut: true };
    render(<PaidStatusBar {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Payment received — your access is being confirmed, this can take a minute.",
    );
    expect(screen.queryByText(/unlock/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Check again" }));
    expect(retry).toHaveBeenCalledWith("y", "s");
  });
});
