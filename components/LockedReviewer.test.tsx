// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => status,
}));

import { LockedReviewer } from "./LockedReviewer";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const FROM = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;

beforeEach(() => {
  logEvent.mockClear();
  status = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };
});

describe("LockedReviewer", () => {
  it("renders a compact locked strip with no price anywhere in it", () => {
    const { container } = render(
      <LockedReviewer yearId={YEAR} subjectId={SUBJECT} from={FROM} />
    );

    expect(screen.getByText(/reviewer — locked/i)).toBeInTheDocument();
    expect(screen.getByText("Drills, code labs, and full solutions.")).toBeInTheDocument();
    expect(container.textContent).not.toContain("₱");
  });

  it("sends the reader to /unlock carrying the year, subject, and the module to return to", () => {
    render(<LockedReviewer yearId={YEAR} subjectId={SUBJECT} from={FROM} />);

    const cta = screen.getByRole("link", { name: /unlock/i });
    expect(cta).toHaveAttribute(
      "href",
      `/unlock?year=${YEAR}&subject=${SUBJECT}&from=${encodeURIComponent(FROM)}`
    );
  });

  it("logs unlock_click when the reader taps Unlock", () => {
    // The wrapper swallows the anchor's default action so jsdom doesn't try to
    // navigate away mid-test.
    render(
      <div onClick={(e) => e.preventDefault()}>
        <LockedReviewer yearId={YEAR} subjectId={SUBJECT} from={FROM} />
      </div>
    );

    fireEvent.click(screen.getByRole("link", { name: /unlock/i }));

    expect(logEvent).toHaveBeenCalledWith("unlock_click", {
      year_id: YEAR,
      subject_id: SUBJECT,
    });
  });

  it("replaces the CTA with a progress note while the post-payment poll runs", () => {
    status = { subscribed: false, polling: true, unlocked: false, pollTimedOut: false };
    render(<LockedReviewer yearId={YEAR} subjectId={SUBJECT} from={FROM} />);

    expect(screen.getByText(/unlocking access/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /unlock →/i })).not.toBeInTheDocument();
  });

  it("tells the reader to refresh when the poll times out", () => {
    status = { subscribed: false, polling: false, unlocked: false, pollTimedOut: true };
    render(<LockedReviewer yearId={YEAR} subjectId={SUBJECT} from={FROM} />);

    expect(screen.getByText(/still processing/i)).toBeInTheDocument();
  });
});
