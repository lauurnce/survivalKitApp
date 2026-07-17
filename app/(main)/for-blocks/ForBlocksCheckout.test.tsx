// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/device", () => ({
  getDeviceId: vi.fn(() => "device-1"),
}));

import { ForBlocksCheckout, type YearOption } from "./ForBlocksCheckout";
import { getDeviceId } from "@/lib/device";

const YEAR_1 = "00000000-0000-0000-0000-000000000001";
const YEAR_2 = "00000000-0000-0000-0000-000000000002";
const SUBJ_1 = "10000000-0001-0001-0001-000000000001";
const SUBJ_2 = "10000000-0001-0001-0001-000000000002";

const YEARS: YearOption[] = [
  {
    id: YEAR_1,
    label: "1st Year",
    subjects: [
      { id: SUBJ_1, title: "Computer Programming 1" },
      { id: SUBJ_2, title: "Discrete Math" },
    ],
  },
  { id: YEAR_2, label: "2nd Year", subjects: [] },
];

let fetchCalls: Array<{ url: string; body: Record<string, unknown> }>;

beforeEach(() => {
  fetchCalls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : {} });
      return Promise.resolve(
        new Response(JSON.stringify({ checkoutUrl: "https://pm.link/x" }), { status: 200 })
      );
    })
  );
  // jsdom doesn't implement navigation; stub it so handlePay doesn't throw.
  Object.defineProperty(window, "location", {
    value: { ...window.location, href: "" },
    writable: true,
  });
});

describe("ForBlocksCheckout", () => {
  it("defaults to scope='subject' with the 799 base price shown", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    expect(screen.getAllByText("₱799").length).toBeGreaterThan(0);
  });

  it("switches the base price to 999 when All Subjects is selected", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    fireEvent.click(screen.getByRole("button", { name: "All Subjects" }));
    expect(screen.getAllByText("₱999").length).toBeGreaterThan(0);
  });

  it("recomputes the total live as the seat slider moves", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "20" } });
    // 799 base + 9 extra * 59 = 1330
    expect(screen.getByText("₱1,330")).toBeInTheDocument();
  });

  it("shows the subject dropdown only for scope='subject'", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "All Subjects" }));
    expect(screen.queryByLabelText("Subject")).not.toBeInTheDocument();
  });

  it("disables Pay when scope='subject' and the year has no subjects", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: YEAR_2 } });
    expect(screen.getByRole("button", { name: /Pay with/ })).toBeDisabled();
  });

  it("enables Pay once a year and subject are selected", () => {
    render(<ForBlocksCheckout years={YEARS} />);
    expect(screen.getByRole("button", { name: /Pay with/ })).not.toBeDisabled();
  });

  it("calls getDeviceId and posts scope/yearId/subjectId/seats before redirecting", async () => {
    render(<ForBlocksCheckout years={YEARS} />);
    fireEvent.click(screen.getByRole("button", { name: /Pay with/ }));
    await waitFor(() => expect(fetchCalls).toHaveLength(1));
    expect(getDeviceId).toHaveBeenCalled();
    expect(fetchCalls[0].url).toBe("/api/class/checkout");
    expect(fetchCalls[0].body).toMatchObject({
      scope: "subject",
      yearId: YEAR_1,
      subjectId: SUBJ_1,
      seats: 11,
    });
  });

  it("shows the inline API error message and re-enables Pay on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve(new Response(JSON.stringify({ error: "invalid_request" }), { status: 400 }))
    );
    render(<ForBlocksCheckout years={YEARS} />);
    fireEvent.click(screen.getByRole("button", { name: /Pay with/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("invalid_request");
    expect(screen.getByRole("button", { name: /Pay with/ })).not.toBeDisabled();
  });
});
