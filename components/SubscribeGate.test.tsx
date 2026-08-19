// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));
// getDeviceId() returns "" whenever localStorage is unreachable — Safari
// private browsing, partitioned third-party contexts, storage switched off.
let deviceId = "device-1";
vi.mock("@/lib/device", () => ({ getDeviceId: () => deviceId }));

import { SubscribeGate } from "./SubscribeGate";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";
const RETURN_PATH = `/year/${YEAR}/subjects/${SUBJECT}/modules/${MODULE}`;

let fetchCalls: Array<{ url: string; body: Record<string, unknown> }>;

beforeEach(() => {
  logEvent.mockClear();
  deviceId = "device-1";
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
  // jsdom doesn't implement navigation; stub it so the redirect doesn't throw.
  Object.defineProperty(window, "location", {
    value: { ...window.location, href: "", pathname: "/unlock" },
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SubscribeGate", () => {
  it("shows all three tiers", () => {
    render(
      <SubscribeGate
        yearId={YEAR}
        subjectId={SUBJECT}
        yearLabel="1st Year"
        subjectTitle="CP1"
        returnPath={RETURN_PATH}
      />
    );

    expect(screen.getByText("₱49")).toBeInTheDocument();
    expect(screen.getByText("₱99")).toBeInTheDocument();
    expect(screen.getByText("₱299")).toBeInTheDocument();
  });

  it("sends the supplied returnPath, not the page it is rendered on", async () => {
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={RETURN_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock — ₱99/i }));

    await waitFor(() => expect(fetchCalls).toHaveLength(1));
    expect(fetchCalls[0].url).toBe("/api/subscribe");
    expect(fetchCalls[0].body).toMatchObject({
      yearId: YEAR,
      subjectId: SUBJECT,
      plan: "subject_sem",
      returnPath: RETURN_PATH,
    });
    expect(fetchCalls[0].body.returnPath).not.toBe("/unlock");
  });

  it("omits subjectId for the whole-year plan", async () => {
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={RETURN_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock everything/i }));

    await waitFor(() => expect(fetchCalls).toHaveLength(1));
    expect(fetchCalls[0].body).toMatchObject({ yearId: YEAR, plan: "year_sem" });
    expect(fetchCalls[0].body).not.toHaveProperty("subjectId");
  });

  it("logs subscribe_click — the growth funnel aggregates it", async () => {
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={RETURN_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock — ₱49/i }));

    expect(logEvent).toHaveBeenCalledWith("subscribe_click", {
      year_id: YEAR,
      subject_id: SUBJECT,
    });
  });

  it("leaves returnPath out when there is no safe path to return to", async () => {
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={null} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock — ₱99/i }));

    await waitFor(() => expect(fetchCalls).toHaveLength(1));
    expect(fetchCalls[0].body.returnPath).toBeUndefined();
  });

  it("tells the reader what is wrong when this browser gives us no device id", async () => {
    // The terminal step of the only purchase path in the app: before this, the
    // tap did nothing at all — no error, no spinner, no request.
    deviceId = "";
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={RETURN_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock — ₱99/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/storage|private browsing/i);
    expect(fetchCalls).toHaveLength(0);
    expect(screen.getByRole("button", { name: /unlock — ₱99/i })).not.toBeDisabled();
  });

  it("shows the API error inline and re-enables the buttons", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
      Promise.resolve(new Response(JSON.stringify({ error: "Unknown subject" }), { status: 404 }))
    );
    render(<SubscribeGate yearId={YEAR} subjectId={SUBJECT} returnPath={RETURN_PATH} />);

    fireEvent.click(screen.getByRole("button", { name: /unlock — ₱99/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unknown subject");
    expect(screen.getByRole("button", { name: /unlock — ₱99/i })).not.toBeDisabled();
  });
});
