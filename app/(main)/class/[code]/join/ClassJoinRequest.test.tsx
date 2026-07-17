// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

vi.mock("@/lib/device", () => ({
  getDeviceId: vi.fn(() => "device-1"),
}));

import { ClassJoinRequest } from "./ClassJoinRequest";
import { getDeviceId } from "@/lib/device";

const CODE = "ABC234";
const YEAR_ID = "40000000-0004-0004-0004-000000000004";
const SUBJECT_ID = "30000000-0003-0003-0003-000000000003";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  // shouldAdvanceTime lets real wall-clock time keep fake timers ticking in
  // the background, so RTL's findBy/waitFor (which poll via real setTimeout
  // under the hood) still resolve while setInterval-based polling in the
  // component remains under our explicit control via advanceTimersByTimeAsync.
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ClassJoinRequest", () => {
  it("renders the initial 'Request to join' state without calling fetch", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ClassJoinRequest code={CODE} />);
    expect(screen.getByRole("button", { name: "Request to join →" })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("transitions idle -> pending after POST returns status 'pending', and starts polling", async () => {
    const fetchMock = vi.fn(() => jsonResponse({ status: "pending" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));

    await waitFor(() => expect(getDeviceId).toHaveBeenCalled());
    await act(async () => {
      await Promise.resolve();
    });

    expect(await screen.findByText("Waiting for approval")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(`/api/class/${CODE}/request`, { method: "POST" });
  });

  it("transitions pending -> approved once polling sees status 'approved', showing the redirect button", async () => {
    let pollCount = 0;
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith("/request")) return jsonResponse({ status: "pending" });
      if (u.endsWith("/request/status")) {
        pollCount += 1;
        if (pollCount >= 2) {
          return jsonResponse({ status: "approved", subjectId: SUBJECT_ID, yearId: YEAR_ID });
        }
        return jsonResponse({ status: "pending" });
      }
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(await screen.findByText("Waiting for approval")).toBeInTheDocument();

    // Advance past two 3s poll ticks.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(await screen.findByText("You're in!")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Start studying →" });
    expect(link).toHaveAttribute("href", `/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules`);
  });

  it("links to the year's subject list when the approved class is an all-subjects class (subjectId null)", async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith("/request")) return jsonResponse({ status: "pending" });
      return jsonResponse({ status: "approved", subjectId: null, yearId: YEAR_ID });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    const link = await screen.findByRole("link", { name: "Start studying →" });
    expect(link).toHaveAttribute("href", `/year/${YEAR_ID}`);
  });

  it("skips the pending state when POST itself returns 'approved' immediately", async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith("/request")) return jsonResponse({ status: "approved" });
      if (u.endsWith("/request/status")) {
        return jsonResponse({ status: "approved", subjectId: SUBJECT_ID, yearId: YEAR_ID });
      }
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));

    expect(await screen.findByText("You're in!")).toBeInTheDocument();
    expect(screen.queryByText("Waiting for approval")).not.toBeInTheDocument();
  });

  it("shows the rejected message when polling sees status 'rejected'", async () => {
    let pollCount = 0;
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith("/request")) return jsonResponse({ status: "pending" });
      if (u.endsWith("/request/status")) {
        pollCount += 1;
        if (pollCount >= 1) return jsonResponse({ status: "rejected" });
        return jsonResponse({ status: "pending" });
      }
      throw new Error(`unexpected url: ${u}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(
      await screen.findByText("Your request wasn't approved. Check with your class rep.")
    ).toBeInTheDocument();
  });

  it("shows the not_found error message when POST fails with error 'not_found'", async () => {
    const fetchMock = vi.fn(() => jsonResponse({ error: "not_found" }, 404));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));

    expect(
      await screen.findByText("That link doesn't match an active class.")
    ).toBeInTheDocument();
  });

  it("shows the rate_limited error message when POST fails with error 'rate_limited'", async () => {
    const fetchMock = vi.fn(() => jsonResponse({ error: "rate_limited" }, 429));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));

    expect(
      await screen.findByText("Too many attempts. Try again in a minute.")
    ).toBeInTheDocument();
  });

  it("shows a generic error message on network failure", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error("network down")));
    vi.stubGlobal("fetch", fetchMock);

    render(<ClassJoinRequest code={CODE} />);
    fireEvent.click(screen.getByRole("button", { name: "Request to join →" }));

    expect(await screen.findByText("Something went wrong. Try again.")).toBeInTheDocument();
  });
});
