// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { RepDashboard } from "./RepDashboard";

const CODE = "ABC234";
const YEAR_ID = "40000000-0004-0004-0004-000000000004";
const SUBJECT_ID = "30000000-0003-0003-0003-000000000003";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

function fullDashboard(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    summary: {
      seatsFilled: 2,
      seatCap: 10,
      expiresAt: "2026-08-15T00:00:00.000Z",
      subjectId: SUBJECT_ID,
      yearId: YEAR_ID,
      scope: "subject",
      ...((overrides.summary as object) ?? {}),
    },
    pending: (overrides.pending as unknown[]) ?? [
      { id: "req-1", createdAt: "2026-07-17T10:00:00.000Z" },
    ],
    roster: (overrides.roster as unknown[]) ?? [
      { ordinal: 1, completed: 5, total: 10 },
      { ordinal: 2, completed: 10, total: 10 },
    ],
  };
}

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...globalThis.navigator,
    clipboard: { writeText: vi.fn(() => Promise.resolve()) },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("RepDashboard", () => {
  it("loads and renders summary stats, pending requests, and roster", async () => {
    const fetchMock = vi.fn(() => jsonResponse(fullDashboard()));
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);

    expect(await screen.findByText("Your class")).toBeInTheDocument();

    // Summary stats
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/10")).toBeInTheDocument();
    // Class average: (5/10 + 10/10) / 2 = 0.75 -> 75%
    expect(screen.getByText("75%")).toBeInTheDocument();

    // Pending requests
    expect(screen.getByText("Pending requests (1)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();

    // Roster
    expect(screen.getByText("Roster (2)")).toBeInTheDocument();
    expect(screen.getByText("Classmate 1")).toBeInTheDocument();
    expect(screen.getByText("Classmate 2")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(`/api/class/${CODE}/rep`);
  });

  it("computes class average as 0 when roster is empty", async () => {
    const fetchMock = vi.fn(() =>
      jsonResponse(fullDashboard({ roster: [], pending: [] }))
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);

    expect(await screen.findByText("Your class")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Roster (0)")).toBeInTheDocument();
  });

  it("approves a pending request: posts decision then reloads data", async () => {
    let loadCount = 0;
    const fetchMock = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/rep") && !init) {
        loadCount += 1;
        if (loadCount === 1) return jsonResponse(fullDashboard());
        return jsonResponse(fullDashboard({ pending: [] }));
      }
      if (u.endsWith("/rep/decide")) {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(init!.body as string)).toEqual({
          requestId: "req-1",
          decision: "approve",
        });
        return jsonResponse({ ok: true });
      }
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);
    expect(await screen.findByText("Pending requests (1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(loadCount).toBe(2));
    await waitFor(() =>
      expect(screen.queryByText(/Pending requests/)).not.toBeInTheDocument()
    );
  });

  it("rejects a pending request: posts decision then reloads data", async () => {
    let loadCount = 0;
    const fetchMock = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/rep") && !init) {
        loadCount += 1;
        if (loadCount === 1) return jsonResponse(fullDashboard());
        return jsonResponse(fullDashboard({ pending: [] }));
      }
      if (u.endsWith("/rep/decide")) {
        expect(JSON.parse(init!.body as string)).toEqual({
          requestId: "req-1",
          decision: "reject",
        });
        return jsonResponse({ ok: true });
      }
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);
    expect(await screen.findByText("Pending requests (1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(loadCount).toBe(2));
    await waitFor(() =>
      expect(screen.queryByText(/Pending requests/)).not.toBeInTheDocument()
    );
  });

  it("shows a clear message when approving hits the 409 'full' seat cap error", async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/rep") && !init) return jsonResponse(fullDashboard());
      if (u.endsWith("/rep/decide")) return jsonResponse({ error: "full" }, 409);
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);
    expect(await screen.findByText("Pending requests (1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(
      await screen.findByText("Class is full — no seats left")
    ).toBeInTheDocument();
    // Pending list should still be showing — not silently reloaded away.
    expect(screen.getByText("Pending requests (1)")).toBeInTheDocument();
  });

  describe("error states map each status to an accurate message with a way out", () => {
    const cases: { status: number; body: unknown; text: RegExp; retry: boolean }[] = [
      { status: 401, body: { error: "unauthorized" }, text: /device you used to set up the class/i, retry: true },
      { status: 403, body: { error: "forbidden" }, text: /This isn't your class dashboard\./, retry: false },
      { status: 404, body: { error: "not_found" }, text: /Class not found\./, retry: false },
      { status: 429, body: { error: "rate_limited" }, text: /too many requests/i, retry: true },
      { status: 500, body: { error: "boom" }, text: /couldn't load your class dashboard/i, retry: true },
      { status: 503, body: {}, text: /couldn't load your class dashboard/i, retry: true },
    ];

    it.each(cases)("$status", async ({ status, body, text, retry }) => {
      vi.stubGlobal("fetch", vi.fn(() => jsonResponse(body, status)));
      render(<RepDashboard code={CODE} />);

      expect(await screen.findByText(text)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
      expect(!!screen.queryByRole("button", { name: /try again/i })).toBe(retry);
      if (status !== 404) expect(screen.queryByText("Class not found.")).not.toBeInTheDocument();
    });

    it("401 gives the rep a recovery path: retry here, or email to move the class", async () => {
      vi.stubGlobal("fetch", vi.fn(() => jsonResponse({ error: "unauthorized" }, 401)));
      render(<RepDashboard code={CODE} />);

      await screen.findByText(/device you used to set up the class/i);
      const email = screen.getByRole("link", { name: /email us/i });
      expect(email.getAttribute("href")).toMatch(/^mailto:/);
      expect(email.getAttribute("href")).toContain(CODE);
    });

    it("403 points a student to the join page instead", async () => {
      vi.stubGlobal("fetch", vi.fn(() => jsonResponse({ error: "forbidden" }, 403)));
      render(<RepDashboard code={CODE} />);

      await screen.findByText("This isn't your class dashboard.");
      expect(screen.getByRole("link", { name: /join this class/i })).toHaveAttribute(
        "href",
        `/class/${CODE}/join`
      );
    });

    it("network failure shows a retryable error", async () => {
      vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("offline"))));
      render(<RepDashboard code={CODE} />);

      expect(await screen.findByText(/couldn't load your class dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("Try again refetches and recovers into the dashboard", async () => {
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(() => jsonResponse({ error: "boom" }, 500))
        .mockImplementation(() => jsonResponse(fullDashboard()));
      vi.stubGlobal("fetch", fetchMock);
      render(<RepDashboard code={CODE} />);

      fireEvent.click(await screen.findByRole("button", { name: /try again/i }));
      expect(await screen.findByText("Your class")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it("copies the invite link to the clipboard with the origin-based, UTM-tagged join URL", async () => {
    const fetchMock = vi.fn(() => jsonResponse(fullDashboard()));
    vi.stubGlobal("fetch", fetchMock);
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      clipboard: { writeText },
    });

    render(<RepDashboard code={CODE} />);
    const button = await screen.findByRole("button", { name: "Copy invite link" });

    fireEvent.click(button);

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/class/${CODE}/join?utm_source=class_invite&utm_medium=referral&utm_campaign=class_rep`
      )
    );
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});

describe("RepDashboard polling and polish (GT-13)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls every 30s while visible and badges requests that arrived since opening", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const later = fullDashboard({
      pending: [
        { id: "req-1", createdAt: "2026-07-17T10:00:00.000Z" },
        { id: "req-2", createdAt: "2026-07-18T02:00:00.000Z" },
        { id: "req-3", createdAt: "2026-07-18T03:00:00.000Z" },
      ],
    });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(fullDashboard()))
      .mockImplementation(() => jsonResponse(later));
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);
    expect(await screen.findByText("Pending requests (1)")).toBeInTheDocument();
    expect(screen.queryByText(/new$/)).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Pending requests (3)")).toBeInTheDocument();
    expect(screen.getByText("2 new")).toBeInTheDocument();
  });

  it("doesn't poll while the tab is hidden, and refreshes when it comes back", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi.fn(() => jsonResponse(fullDashboard()));
    vi.stubGlobal("fetch", fetchMock);
    let visibility: DocumentVisibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);

    render(<RepDashboard code={CODE} />);
    await screen.findByText("Your class");
    visibility = "hidden";
    await vi.advanceTimersByTimeAsync(90_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("keeps the dashboard up when a background poll fails", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(fullDashboard()))
      .mockImplementation(() => Promise.reject(new Error("offline")));
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);
    await screen.findByText("Your class");
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Your class")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a loading state instead of a blank page", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<RepDashboard code={CODE} />);
    expect(screen.getByText(/loading your class/i)).toBeInTheDocument();
  });

  it("dates each request and the expiry on the Manila calendar", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(fullDashboard())));
    render(<RepDashboard code={CODE} />);
    // 2026-07-17 10:00Z is 6:00 PM in Manila; 2026-08-15 00:00Z is Aug 15 there.
    expect(await screen.findByText(/Jul 17, 2026, 6:00 PM/)).toBeInTheDocument();
    expect(screen.getByText("Aug 15, 2026")).toBeInTheDocument();
  });

  it("hints how to fill an empty roster", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(fullDashboard({ roster: [], pending: [] }))));
    render(<RepDashboard code={CODE} />);
    expect(await screen.findByText(/share the invite link/i)).toBeInTheDocument();
  });

  it("shows the invite link to copy by hand when the clipboard is refused", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(fullDashboard())));
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      clipboard: { writeText: vi.fn(() => Promise.reject(new Error("denied"))) },
    });
    render(<RepDashboard code={CODE} />);
    fireEvent.click(await screen.findByRole("button", { name: "Copy invite link" }));
    const field = await screen.findByRole("textbox", { name: /invite link/i });
    expect((field as HTMLInputElement).value).toContain(`/class/${CODE}/join`);
  });
});
