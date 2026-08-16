// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/lib/device", () => ({ getDeviceId: () => "device-1" }));

import {
  MAX_POLLS,
  MAX_REFRESHES,
  POLL_INTERVAL_MS,
  REFRESH_RETRY_MS,
  useSubscriptionStatus,
} from "./useSubscriptionStatus";

const SUBJECT = "22222222-2222-2222-2222-222222222222";

let statusCalls: string[];
let subscribedReplies: boolean[];

// jsdom refuses to let a spy replace location.replace, so swap the whole
// Location for one that delegates every read to the real thing (so
// history.replaceState below still drives window.location.search) and records
// the navigation the hook's escape hatch performs.
const realLocation = window.location;
const locationDescriptor = Object.getOwnPropertyDescriptor(window, "location")!;
const navigate = vi.fn();

// Each test gets its own year id so the hook's module-level cache can never
// leak an answer from a previous test.
let seq = 0;
function freshYear(): string {
  seq += 1;
  return `11111111-1111-1111-1111-${String(seq).padStart(12, "0")}`;
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function Probe({ yearId, name }: { yearId: string; name: string }) {
  const { subscribed, polling, unlocked, pollTimedOut } = useSubscriptionStatus(yearId, SUBJECT);
  return (
    <span data-testid={name}>
      {`subscribed=${subscribed} polling=${polling} unlocked=${unlocked} timedOut=${pollTimedOut}`}
    </span>
  );
}

beforeEach(() => {
  statusCalls = [];
  subscribedReplies = [];
  refresh.mockClear();
  navigate.mockClear();
  window.history.replaceState({}, "", "/year/x/subjects/y/modules/z");
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      get href() {
        return realLocation.href;
      },
      get search() {
        return realLocation.search;
      },
      replace: navigate,
    },
  });
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      statusCalls.push(String(url));
      const subscribed = subscribedReplies.shift() ?? false;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ subscribed }),
      } as Response);
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Object.defineProperty(window, "location", locationDescriptor);
});

describe("useSubscriptionStatus", () => {
  it("makes ONE status request for several consumers sharing a year and subject", async () => {
    const yearId = freshYear();
    render(
      <>
        <Probe yearId={yearId} name="teaser" />
        <Probe yearId={yearId} name="gate-1" />
        <Probe yearId={yearId} name="gate-2" />
      </>
    );

    await waitFor(() =>
      expect(screen.getByTestId("teaser")).toHaveTextContent("subscribed=false")
    );
    expect(screen.getByTestId("gate-2")).toHaveTextContent("subscribed=false");
    expect(statusCalls).toHaveLength(1);
    expect(statusCalls[0]).toContain(`yearId=${yearId}`);
    expect(statusCalls[0]).toContain(`subjectId=${SUBJECT}`);
  });

  it("reports a subscribed reader to every consumer", async () => {
    const yearId = freshYear();
    subscribedReplies = [true];
    render(
      <>
        <Probe yearId={yearId} name="a" />
        <Probe yearId={yearId} name="b" />
      </>
    );

    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("subscribed=true"));
    expect(screen.getByTestId("b")).toHaveTextContent("subscribed=true");
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=false");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("polls after ?payment=success and refreshes the route once when it confirms", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [false, false, true];

    render(
      <>
        <Probe yearId={yearId} name="a" />
        <Probe yearId={yearId} name="b" />
      </>
    );

    await advance(0);
    expect(screen.getByTestId("a")).toHaveTextContent("polling=true");

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("polling=true");

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true");
    expect(screen.getByTestId("b")).toHaveTextContent("unlocked=true");
    expect(screen.getByTestId("a")).toHaveTextContent("polling=false");

    // Two consumers, one route refresh.
    expect(refresh).toHaveBeenCalledTimes(1);

    // The interval is cleared once the poll confirms.
    const callsAfterUnlock = statusCalls.length;
    await advance(POLL_INTERVAL_MS * 3);
    expect(statusCalls).toHaveLength(callsAfterUnlock);
  });

  it("gives up after MAX_POLLS and reports the timeout", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");

    render(<Probe yearId={yearId} name="a" />);

    await advance(0);
    await advance(POLL_INTERVAL_MS * MAX_POLLS);

    expect(screen.getByTestId("a")).toHaveTextContent("timedOut=true");
    expect(screen.getByTestId("a")).toHaveTextContent("polling=false");
    // 1 initial check + MAX_POLLS attempts, then it stops.
    expect(statusCalls).toHaveLength(MAX_POLLS + 1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does not poll without ?payment=success", async () => {
    const yearId = freshYear();
    render(<Probe yearId={yearId} name="a" />);

    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("subscribed=false"));
    expect(screen.getByTestId("a")).toHaveTextContent("polling=false");
  });

  it("starts no poll when its only consumer unmounts while the first check is in flight", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");

    // Hold the first status request open so the unmount lands mid-flight —
    // exactly what StrictMode's double-mount does on every dev render.
    let release!: () => void;
    const inFlight = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((url: RequestInfo | URL) => {
        statusCalls.push(String(url));
        return inFlight.then(
          () => ({ ok: true, json: () => Promise.resolve({ subscribed: false }) }) as Response
        );
      })
    );

    const { unmount } = render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    expect(statusCalls).toHaveLength(1);

    unmount();
    release();
    await advance(0);

    // The entry the request belonged to is gone; resuming must not install an
    // interval no cleanup can ever reach.
    await advance(POLL_INTERVAL_MS * MAX_POLLS * 2);
    expect(statusCalls).toHaveLength(1);
  });

  it("retries the route refresh when the refreshed render comes back still locked", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [false, true];

    render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    await advance(POLL_INTERVAL_MS);

    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true");
    expect(refresh).toHaveBeenCalledTimes(1);

    // The probe is still mounted, so the server still rendered locked content.
    await advance(REFRESH_RETRY_MS);
    expect(refresh).toHaveBeenCalledTimes(MAX_REFRESHES);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("falls back to a full page load, without the payment marker, when refreshing never unlocks", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [false, true];

    render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    await advance(POLL_INTERVAL_MS);
    await advance(REFRESH_RETRY_MS * MAX_REFRESHES);

    expect(navigate).toHaveBeenCalledTimes(1);
    const target = String(navigate.mock.calls[0][0]);
    expect(target).toContain("/year/x/subjects/y/modules/z");
    // Dropping the marker is what stops the reload from looping forever.
    expect(target).not.toContain("payment=success");

    // And the strip stops claiming an unlock is moments away.
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=false");
    expect(screen.getByTestId("a")).toHaveTextContent("timedOut=true");
  });

  it("stops retrying once the refreshed render has replaced the locked content", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [false, true];

    const { unmount } = render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    await advance(POLL_INTERVAL_MS);
    expect(refresh).toHaveBeenCalledTimes(1);

    // A successful refresh unmounts every locked strip on the page.
    unmount();
    await advance(REFRESH_RETRY_MS * (MAX_REFRESHES + 2));

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
