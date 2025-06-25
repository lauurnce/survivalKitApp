// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({ useSubscriptionStatus: () => status }));

import { useShowUpsell } from "./useShowUpsell";

function Probe() {
  return <span data-testid="p">{String(useShowUpsell("y", "s"))}</span>;
}

const base: SubscriptionStatus = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };

function clearCookies() {
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

beforeEach(() => {
  status = { ...base };
  window.history.replaceState({}, "", "/year/y/subjects/s/modules/m");
  clearCookies();
});
afterEach(clearCookies);

describe("useShowUpsell", () => {
  it("shows the upsell to a reader known not to be subscribed", () => {
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("true");
  });

  it("hides it from a subscriber (subject plan or year pass alike)", () => {
    status = { ...base, subscribed: true, plan: { scope: "year", until: null } };
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false");
  });

  it("hides it while a payment is being confirmed, and after the poll times out", () => {
    status = { ...base, polling: true };
    const { rerender } = render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false");
    status = { ...base, pollTimedOut: true };
    rerender(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false");
  });

  it("hides it on the way back from checkout, before any answer", () => {
    status = { ...base, subscribed: null };
    window.history.replaceState({}, "", "/year/y/subjects/s/modules/m?payment=success");
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false");
  });

  it("keeps the locked view for a signed-out reader while the status loads", () => {
    status = { ...base, subscribed: null };
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("true");
  });

  it("holds it back for a signed-in reader while the status loads", () => {
    status = { ...base, subscribed: null };
    document.cookie = "sb-abcdef-auth-token.0=base64-xyz; path=/";
    render(<Probe />);
    expect(screen.getByTestId("p")).toHaveTextContent("false");
  });
});
