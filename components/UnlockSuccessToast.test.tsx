// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({ useSubscriptionStatus: () => status }));

import { UnlockSuccessToast } from "./UnlockSuccessToast";

const base: SubscriptionStatus = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };
const props = { yearId: "y", subjectId: "s", subjectTitle: "Computer Programming 1" };
const COPY = "Payment successful — Computer Programming 1 is unlocked.";

beforeEach(() => {
  status = { ...base };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UnlockSuccessToast", () => {
  it("renders nothing for an ordinary visit, subscribed or not", () => {
    const { container, rerender } = render(<UnlockSuccessToast {...props} />);
    expect(container).toBeEmptyDOMElement();
    status = { ...base, subscribed: true };
    rerender(<UnlockSuccessToast {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("waits while the payment is still being confirmed", () => {
    status = { ...base, polling: true };
    const { container } = render(<UnlockSuccessToast {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the unlock once the poll confirms it", () => {
    status = { ...base, polling: true };
    const { rerender } = render(<UnlockSuccessToast {...props} />);
    status = { ...base, subscribed: true, unlocked: true };
    rerender(<UnlockSuccessToast {...props} />);
    expect(screen.getByRole("status")).toHaveTextContent(COPY);
  });

  it("auto-dismisses after six seconds and never comes back", () => {
    status = { ...base, subscribed: true, unlocked: true };
    const { rerender } = render(<UnlockSuccessToast {...props} />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByText(COPY)).not.toBeInTheDocument();

    status = { ...status };
    rerender(<UnlockSuccessToast {...props} />);
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.queryByText(COPY)).not.toBeInTheDocument();
  });
});
