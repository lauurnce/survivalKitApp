// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const session = { ready: true, signedIn: true, userId: "u1", overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({ useSession: () => session }));

const statusCalls: [string, string][] = [];
let status = { subscribed: null as boolean | null, polling: false, unlocked: false, pollTimedOut: false };
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: (yearId: string, subjectId: string) => {
    statusCalls.push([yearId, subjectId]);
    return status;
  },
}));

import { printAccessFrom, usePrintAccess } from "./PrintAccess";

const IN = { ready: true, signedIn: true };
const st = (subscribed: boolean | null, extra: Partial<{ polling: boolean; pollTimedOut: boolean }> = {}) => ({
  subscribed,
  polling: false,
  pollTimedOut: false,
  ...extra,
});

describe("printAccessFrom", () => {
  it("is loading until the session is known", () => {
    expect(printAccessFrom({ ready: false, signedIn: false }, null, false)).toBe("loading");
  });

  it("is signed-out for an anonymous reader, whatever the status", () => {
    expect(printAccessFrom({ ready: true, signedIn: false }, null, false)).toBe("signed-out");
    expect(printAccessFrom({ ready: true, signedIn: false }, st(true), false)).toBe("signed-out");
  });

  it("is loading while a signed-in reader's entitlement is in flight", () => {
    expect(printAccessFrom(IN, null, false)).toBe("loading");
    expect(printAccessFrom(IN, st(null), false)).toBe("loading");
  });

  it("is entitled when the subscription check says so (subject or year plan)", () => {
    expect(printAccessFrom(IN, st(true), false)).toBe("entitled");
  });

  it("is unpaid for a signed-in reader without the subject", () => {
    expect(printAccessFrom(IN, st(false), false)).toBe("unpaid");
  });

  it("waits out the post-payment poll before calling a reader unpaid", () => {
    expect(printAccessFrom(IN, st(false, { polling: true }), true)).toBe("loading");
    expect(printAccessFrom(IN, st(false), true)).toBe("loading");
    expect(printAccessFrom(IN, st(false, { pollTimedOut: true }), true)).toBe("unpaid");
  });
});

function Probe() {
  const { access, probe } = usePrintAccess("Y", "S");
  return (
    <>
      <span data-testid="access">{access}</span>
      {probe}
    </>
  );
}

describe("usePrintAccess", () => {
  beforeEach(() => {
    statusCalls.length = 0;
    session.ready = true;
    session.signedIn = true;
    status = { subscribed: null, polling: false, unlocked: false, pollTimedOut: false };
  });

  it("asks about this year and subject for a signed-in reader", async () => {
    status = { ...status, subscribed: false };
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("access")).toHaveTextContent("unpaid"));
    expect(statusCalls).toContainEqual(["Y", "S"]);
  });

  it("never asks about a signed-out reader", () => {
    session.signedIn = false;
    render(<Probe />);
    expect(screen.getByTestId("access")).toHaveTextContent("signed-out");
    expect(statusCalls).toHaveLength(0);
  });

  it("stops listening once entitled, so a post-payment unlock can settle", async () => {
    status = { ...status, subscribed: true };
    const { rerender } = render(<Probe />);
    await waitFor(() => expect(screen.getByTestId("access")).toHaveTextContent("entitled"));
    statusCalls.length = 0;
    rerender(<Probe />);
    expect(statusCalls).toHaveLength(0);
    expect(screen.getByTestId("access")).toHaveTextContent("entitled");
  });
});
