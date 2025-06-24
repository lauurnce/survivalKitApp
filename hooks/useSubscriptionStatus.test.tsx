// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/lib/device", () => ({ getDeviceId: () => "device-1" }));
const resetSessionCache = vi.fn();
vi.mock("@/hooks/useSession", () => ({ resetSessionCache: () => resetSessionCache() }));

import {
  MAX_POLLS,
  POLL_INTERVAL_MS,
  planForSubject,
  retrySubscriptionCheck,
  useSubscriptionStatus,
  useYearEntitlements,
  resetYearEntitlementsCache,
  type PlanInfo,
} from "./useSubscriptionStatus";

const PLAN: PlanInfo = { scope: "subject", until: "2026-12-01T00:00:00.000Z" };

const SUBJECT = "22222222-2222-2222-2222-222222222222";

let statusCalls: string[];
let subscribedReplies: boolean[];
let yearReply: unknown;

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
  const { subscribed, polling, unlocked, pollTimedOut, plan } = useSubscriptionStatus(yearId, SUBJECT);
  return (
    <span data-testid={name}>
      {`subscribed=${subscribed} polling=${polling} unlocked=${unlocked} timedOut=${pollTimedOut} plan=${plan?.scope ?? "none"}`}
    </span>
  );
}

beforeEach(() => {
  statusCalls = [];
  subscribedReplies = [];
  yearReply = { subscribed: false, subjects: {} };
  refresh.mockClear();
  resetSessionCache.mockClear();
  resetYearEntitlementsCache();
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
      if (String(url).includes("list=subjects")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(yearReply) } as Response);
      }
      const subscribed = subscribedReplies.shift() ?? false;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(subscribed ? { subscribed, plan: PLAN } : { subscribed }),
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

  it("polls after ?payment=success and flips in place when it confirms — no refresh, no reload", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success&print=1");
    subscribedReplies = [false, false, true];

    render(
      <>
        <Probe yearId={yearId} name="a" />
        <Probe yearId={yearId} name="b" />
      </>
    );

    await advance(0);
    expect(screen.getByTestId("a")).toHaveTextContent("polling=true");
    // Back from checkout: the cached session answer is thrown away.
    expect(resetSessionCache).toHaveBeenCalledTimes(1);

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("polling=true");

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true");
    expect(screen.getByTestId("a")).toHaveTextContent("subscribed=true");
    expect(screen.getByTestId("a")).toHaveTextContent("plan=subject");
    expect(screen.getByTestId("b")).toHaveTextContent("unlocked=true");
    expect(screen.getByTestId("a")).toHaveTextContent("polling=false");

    // The page unlocks in place: nothing refreshes or reloads.
    expect(refresh).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    // The marker is gone from the URL; other params survive.
    expect(realLocation.search).toBe("?print=1");

    // The interval is cleared once the poll confirms.
    const callsAfterUnlock = statusCalls.length;
    await advance(POLL_INTERVAL_MS * 3);
    expect(statusCalls).toHaveLength(callsAfterUnlock);
  });

  it("confirms at once when the webhook beat the redirect back", async () => {
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [true];

    render(<Probe yearId={yearId} name="a" />);

    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true"));
    expect(screen.getByTestId("a")).toHaveTextContent("polling=false");
    expect(realLocation.search).toBe("");
    expect(statusCalls).toHaveLength(1);
  });

  it("passes the plan through for a reader who was already subscribed", async () => {
    const yearId = freshYear();
    subscribedReplies = [true];
    render(<Probe yearId={yearId} name="a" />);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("plan=subject"));
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=false");
    expect(resetSessionCache).not.toHaveBeenCalled();
  });

  it("asks the server every time, never the HTTP cache", async () => {
    const yearId = freshYear();
    render(<Probe yearId={yearId} name="a" />);
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("subscribed=false"));
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(init.cache).toBe("no-store");
  });

  it("retries after the poll timed out, and confirms on the retry", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");

    render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    await advance(POLL_INTERVAL_MS * MAX_POLLS);
    expect(screen.getByTestId("a")).toHaveTextContent("timedOut=true");

    subscribedReplies = [true];
    act(() => retrySubscriptionCheck(yearId, SUBJECT));
    expect(screen.getByTestId("a")).toHaveTextContent("polling=true");
    expect(screen.getByTestId("a")).toHaveTextContent("timedOut=false");

    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true");
    expect(screen.getByTestId("a")).toHaveTextContent("timedOut=false");
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

  it("never refreshes or reloads, even while a consumer stays mounted after the unlock", async () => {
    vi.useFakeTimers();
    const yearId = freshYear();
    window.history.replaceState({}, "", "/year/x/subjects/y/modules/z?payment=success");
    subscribedReplies = [false, true];

    render(<Probe yearId={yearId} name="a" />);
    await advance(0);
    await advance(POLL_INTERVAL_MS);
    expect(screen.getByTestId("a")).toHaveTextContent("unlocked=true");

    await advance(60_000);
    expect(refresh).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("useYearEntitlements", () => {
  function YearProbe({ yearId, subjectId }: { yearId: string; subjectId: string }) {
    const ents = useYearEntitlements(yearId);
    const plan = planForSubject(ents, subjectId);
    return <span data-testid={`y-${subjectId}`}>{`ready=${ents.ready} plan=${plan?.scope ?? "none"}`}</span>;
  }

  it("makes one request for every subject row and reports per-subject grants", async () => {
    const yearId = freshYear();
    yearReply = { subscribed: false, subjects: { s1: PLAN } };
    render(
      <>
        <YearProbe yearId={yearId} subjectId="s1" />
        <YearProbe yearId={yearId} subjectId="s2" />
      </>
    );
    await waitFor(() => expect(screen.getByTestId("y-s1")).toHaveTextContent("ready=true plan=subject"));
    expect(screen.getByTestId("y-s2")).toHaveTextContent("ready=true plan=none");
    expect(statusCalls).toHaveLength(1);
    expect(statusCalls[0]).toContain("list=subjects");
  });

  it("applies a year pass to every subject", async () => {
    const yearId = freshYear();
    yearReply = { subscribed: true, plan: { scope: "year", until: null }, subjects: {} };
    render(<YearProbe yearId={yearId} subjectId="s9" />);
    await waitFor(() => expect(screen.getByTestId("y-s9")).toHaveTextContent("plan=year"));
  });
});
