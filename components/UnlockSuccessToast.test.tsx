// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

import { UnlockSuccessToast } from "./UnlockSuccessToast";

beforeEach(() => {
  searchParams.delete("payment");
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UnlockSuccessToast", () => {
  it("renders nothing without the payment=success marker", () => {
    const { container } = render(<UnlockSuccessToast />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("announces a successful payment when the marker is present", () => {
    searchParams.set("payment", "success");
    render(<UnlockSuccessToast />);
    expect(screen.getByText(/payment successful — module unlocked/i)).toBeInTheDocument();
  });

  it("auto-dismisses after six seconds and never comes back", () => {
    searchParams.set("payment", "success");
    render(<UnlockSuccessToast />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByText(/payment successful — module unlocked/i)).not.toBeInTheDocument();

    // A later re-render (the subscription hook refreshes the route) must not
    // resurrect the toast.
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.queryByText(/payment successful — module unlocked/i)).not.toBeInTheDocument();
  });

  it("ignores any payment marker other than success", () => {
    searchParams.set("payment", "failed");
    const { container } = render(<UnlockSuccessToast />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(container).toBeEmptyDOMElement();
  });
});
