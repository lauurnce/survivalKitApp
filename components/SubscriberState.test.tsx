// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => status,
  retrySubscriptionCheck: vi.fn(),
}));

import { SubscriberProBanner } from "./SubscriberState";

const base: SubscriptionStatus = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };
const props = { yearId: "y", subjectId: "s", unlockAll: false, subjectTitle: "Computer Programming 1", yearLabel: "1st Year" };

beforeEach(() => {
  status = { ...base };
});

describe("SubscriberProBanner (modules list)", () => {
  it("renders nothing for a reader without access, or while loading", () => {
    const { container, rerender } = render(<SubscriberProBanner {...props} />);
    expect(container).toBeEmptyDOMElement();
    status = { ...base, subscribed: null };
    rerender(<SubscriberProBanner {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names the subject plan and its end date", () => {
    status = { ...base, subscribed: true, plan: { scope: "subject", until: "2026-12-01T00:00:00Z" } };
    render(<SubscriberProBanner {...props} />);
    expect(screen.getByText("Unlocked · Computer Programming 1 · access until Dec 1, 2026")).toBeInTheDocument();
  });

  it("names a year pass", () => {
    status = { ...base, subscribed: true, plan: { scope: "year", until: "2027-01-31T00:00:00Z" } };
    render(<SubscriberProBanner {...props} />);
    expect(screen.getByText("1st Year pass · until Jan 31, 2027")).toBeInTheDocument();
  });

  it("keeps the dev-flag Pro strip under UNLOCK_ALL", () => {
    render(<SubscriberProBanner {...props} unlockAll />);
    expect(screen.getByText("You have Pro access")).toBeInTheDocument();
  });
});
