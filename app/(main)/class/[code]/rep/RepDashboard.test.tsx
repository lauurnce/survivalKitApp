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

  it("shows a 403 error state when the device isn't the class rep", async () => {
    const fetchMock = vi.fn(() => jsonResponse({ error: "forbidden" }, 403));
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);

    expect(
      await screen.findByText("This isn't your class dashboard.")
    ).toBeInTheDocument();
  });

  it("shows a 404 error state when the class doesn't exist", async () => {
    const fetchMock = vi.fn(() => jsonResponse({ error: "not_found" }, 404));
    vi.stubGlobal("fetch", fetchMock);

    render(<RepDashboard code={CODE} />);

    expect(await screen.findByText("Class not found.")).toBeInTheDocument();
  });

  it("copies the invite link to the clipboard with the origin-based join URL", async () => {
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
        `${window.location.origin}/class/${CODE}/join`
      )
    );
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});
