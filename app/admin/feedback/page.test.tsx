// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// next/navigation's router is a stable object; the mock must be too, or the
// page's fetch effect (which depends on it) re-runs every render.
const replaceMock = vi.fn();
const router = { replace: replaceMock, push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

import AdminFeedbackPage from "./page";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

const OK_BODY = {
  data: [
    {
      id: "feedback-1",
      created_at: "2026-07-18T10:00:00Z",
      module_name: "Introduction to Programming",
      app_rating: 5,
      module_rating: 4,
      feedback_text: "Great course!",
      user_email: null,
      is_anonymous: true,
      is_quality_approved: true,
      coupon_code: null,
    },
  ],
  pagination: { page: 1, limit: 50, total: 1 },
  stats: {
    total_feedback: 1,
    avg_app_rating: 5,
    avg_module_rating: 4,
    pct_approved: 100,
    total_codes_generated: 0,
    total_codes_redeemed: 0,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AdminFeedbackPage", () => {
  it("sorting by Module requests sort=module, a key the API accepts", async () => {
    const fetchMock = vi.fn((_url: string) => jsonResponse(OK_BODY));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);

    fireEvent.click(await screen.findByRole("button", { name: /^Module/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const params = new URL(fetchMock.mock.calls[1][0], "http://x").searchParams;
    expect(params.get("sort")).toBe("module");
  });

  it("surfaces a failed refetch instead of silently leaving the stale table up", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(OK_BODY))
      .mockImplementation(() => jsonResponse({ error: "Failed to fetch feedback" }, 500));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);

    fireEvent.click(await screen.findByRole("button", { name: /^Module/ }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed to fetch feedback");
    expect(alert).toHaveTextContent(/last loaded results/i);
    // The stale rows stay visible underneath the error.
    expect(screen.getByText("Introduction to Programming")).toBeInTheDocument();
  });

  it("clears the error once a later request succeeds", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(OK_BODY))
      .mockImplementationOnce(() => jsonResponse({ error: "boom" }, 500))
      .mockImplementation(() => jsonResponse(OK_BODY));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);

    fireEvent.click(await screen.findByRole("button", { name: /^Module/ }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: /^Date/ }));

    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});

const EMPTY_BODY = {
  ...OK_BODY,
  data: [],
  pagination: { page: 1, limit: 50, total: 0 },
};

describe("AdminFeedbackPage table polish (GT-15)", () => {
  it("debounces search and sends one request for the final text", async () => {
    const fetchMock = vi.fn((_url: string) => jsonResponse(OK_BODY));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);
    await screen.findByText("Introduction to Programming");

    const box = screen.getByRole("searchbox", { name: /search feedback/i });
    for (const text of ["p", "py", "pyt", "pyth"]) fireEvent.change(box, { target: { value: text } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const params = new URL(fetchMock.mock.calls[1][0], "http://x").searchParams;
    expect(params.get("search")).toBe("pyth");
  });

  it("ignores a slow earlier response that lands after a newer one", async () => {
    let releaseFirstSearch: (v: Response) => void = () => {};
    const SLOW_BODY = { ...OK_BODY, data: [{ ...OK_BODY.data[0], id: "old", module_name: "Stale Module" }] };
    const NEW_BODY = { ...OK_BODY, data: [{ ...OK_BODY.data[0], id: "new", module_name: "Fresh Module" }] };
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(OK_BODY))
      .mockImplementationOnce(() => new Promise<Response>((r) => { releaseFirstSearch = r; }))
      .mockImplementation(() => jsonResponse(NEW_BODY));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);
    await screen.findByText("Introduction to Programming");

    fireEvent.click(screen.getByRole("button", { name: /^Module/ })); // request 2: hangs
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: /^Date/ })); // request 3: answers
    await screen.findByText("Fresh Module");

    releaseFirstSearch(new Response(JSON.stringify(SLOW_BODY), { status: 200 }));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText("Stale Module")).not.toBeInTheDocument();
    expect(screen.getByText("Fresh Module")).toBeInTheDocument();
  });

  it("says there's no feedback instead of 'Showing 1 to 0 of 0'", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(EMPTY_BODY)));
    render(<AdminFeedbackPage />);
    expect(await screen.findByText(/no feedback matches/i)).toBeInTheDocument();
    expect(screen.queryByText(/Showing 1 to 0/)).not.toBeInTheDocument();
  });

  it("starts a new column descending, toggles the same column, and shows the real direction", async () => {
    const fetchMock = vi.fn((_url: string) => jsonResponse(OK_BODY));
    vi.stubGlobal("fetch", fetchMock);
    render(<AdminFeedbackPage />);
    const dateHeader = await screen.findByRole("columnheader", { name: /^Date/ });
    expect(dateHeader).toHaveAttribute("aria-sort", "descending");

    fireEvent.click(screen.getByRole("button", { name: /^Date/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(new URL(fetchMock.mock.calls[1][0], "http://x").searchParams.get("order")).toBe("asc");
    await waitFor(() => expect(screen.getByRole("columnheader", { name: /^Date/ })).toHaveAttribute("aria-sort", "ascending"));
    expect(screen.getByRole("button", { name: /^Date/ })).toHaveTextContent("↑");

    fireEvent.click(screen.getByRole("button", { name: /^Module/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const p = new URL(fetchMock.mock.calls[2][0], "http://x").searchParams;
    expect(p.get("sort")).toBe("module");
    expect(p.get("order")).toBe("desc");
  });

  it("sends an expired admin session back to the login page", async () => {
    replaceMock.mockReset();
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse({ error: "Admin access required" }, 401)));
    render(<AdminFeedbackPage />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/login"));
  });
});
