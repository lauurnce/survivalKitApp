// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
