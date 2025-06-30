// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
}));

let session = { ready: true, signedIn: true, userId: "u1" as string | null, overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({
  useSession: () => session,
}));

// Keyed like the real store: a year plan answers true for every subject of its
// year, a subject plan only for its own subject. null = still loading.
let entitled: (yearId: string, subjectId: string) => boolean | null = () => true;
let polling = false;
let pollTimedOut = false;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: (yearId: string, subjectId: string) => ({
    subscribed: entitled(yearId, subjectId),
    polling,
    unlocked: false,
    pollTimedOut,
  }),
}));

import {
  PrintButton,
  PRINT_GATE_TITLE,
  PRINT_UNPAID_CTA,
  printGateBody,
  printUnpaidTitle,
} from "./PrintButton";
import { PRINT_AFTER_UNLOCK_KEY } from "@/lib/printReady";
import { parseModuleRoute, safeReturnPath } from "@/lib/subscribeRedirect";
import { safeNextPath } from "@/lib/auth/safeNext";

const IDS = {
  yearId: "11111111-1111-1111-1111-111111111111",
  subjectId: "22222222-2222-2222-2222-222222222222",
  moduleId: "33333333-3333-3333-3333-333333333333",
  subjectTitle: "Computer Programming 1",
};
const OTHER_SUBJECT = "44444444-4444-4444-4444-444444444444";
const MODULE_PATH = `/year/${IDS.yearId}/subjects/${IDS.subjectId}/modules/${IDS.moduleId}`;

function signedIn() {
  session = { ready: true, signedIn: true, userId: "u1", overallDone: 0, overallTotal: 0 };
}
function signedOut() {
  session = { ready: true, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };
}
function sessionLoading() {
  session = { ready: false, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };
}
const subjectPlan = (y: string, s: string) => y === IDS.yearId && s === IDS.subjectId;
const yearPlan = (y: string) => y === IDS.yearId;
const unpaid = () => false;
const statusLoading = () => null;

function clickPrint() {
  fireEvent.click(screen.getByRole("button", { name: /print \/ save as pdf/i }));
}

const settle = () => new Promise((r) => setTimeout(r, 50));

beforeEach(() => {
  logEvent.mockClear();
  window.print = vi.fn();
  signedIn();
  entitled = subjectPlan;
  polling = false;
  pollTimedOut = false;
  window.history.replaceState(null, "", MODULE_PATH);
  sessionStorage.clear();
});

afterEach(() => {
  document.querySelectorAll("[data-reader-unlock]").forEach((n) => n.remove());
});

describe("PrintButton — entitled", () => {
  it("logs print_click with the module and opens the print dialog (subject plan)", async () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(logEvent).toHaveBeenCalledWith("print_click", {
      year_id: IDS.yearId,
      subject_id: IDS.subjectId,
      module_id: IDS.moduleId,
    });
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith("print_gate_shown", expect.anything());
  });

  it("prints on another subject of the same year for a year-plan reader", async () => {
    entitled = yearPlan;
    render(<PrintButton {...IDS} subjectId={OTHER_SUBJECT} />);
    clickPrint();
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("waits for paid bodies still on their way before printing", async () => {
    const marker = document.createElement("span");
    marker.setAttribute("data-reader-unlock", "pending");
    document.body.appendChild(marker);
    render(<PrintButton {...IDS} />);
    clickPrint();
    await new Promise((r) => setTimeout(r, 300));
    expect(window.print).not.toHaveBeenCalled();
    marker.remove();
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
  });

  it("shows no lock", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.queryByTestId("print-lock")).not.toBeInTheDocument();
  });

  it("leaves itself out of the printout", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.getByRole("button")).toHaveClass("print:hidden");
  });
});

describe("PrintButton — signed in, not entitled to this subject", () => {
  beforeEach(() => {
    entitled = unpaid;
  });

  it("is visible with a small lock", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.getByRole("button", { name: /print \/ save as pdf/i })).toBeVisible();
    expect(screen.getByTestId("print-lock")).toBeInTheDocument();
  });

  it("does not print; it offers the subject unlock", async () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: printUnpaidTitle(IDS.subjectTitle) });
    expect(dialog).toHaveTextContent("Downloading lessons is part of the Computer Programming 1 unlock");
    expect(logEvent).toHaveBeenCalledWith("print_click", expect.anything());
    // /api/events stores no properties, so the unpaid prompt is not logged as
    // print_gate_shown (it would be indistinguishable from the sign-up prompt).
    expect(logEvent).not.toHaveBeenCalledWith("print_gate_shown", expect.anything());
  });

  it("does not print for a subject-plan reader on another subject", async () => {
    entitled = subjectPlan;
    render(<PrintButton {...IDS} subjectId={OTHER_SUBJECT} />);
    clickPrint();
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("links into /unlock with a return path the checkout accepts, and parks the print intent", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([PRINT_UNPAID_CTA]);
    const url = new URL(links[0].getAttribute("href")!, "https://x.test");
    expect(url.pathname).toBe("/unlock");
    expect(url.searchParams.get("year")).toBe(IDS.yearId);
    expect(url.searchParams.get("subject")).toBe(IDS.subjectId);
    const from = url.searchParams.get("from");
    expect(from).toBe(MODULE_PATH);
    // The same validators the unlock page and checkout run.
    expect(safeReturnPath(from, IDS.yearId, IDS.subjectId)).toBe(MODULE_PATH);
    expect(parseModuleRoute(from)).not.toBeNull();

    links[0].addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(links[0]);
    expect(JSON.parse(sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY)!)).toMatchObject({ path: MODULE_PATH });
  });

  it("focuses the unlock link and closes on Escape or Not now", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(screen.getByRole("link", { name: PRINT_UNPAID_CTA })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    clickPrint();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("PrintButton — signed out", () => {
  beforeEach(signedOut);

  it("is still visible", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.getByRole("button", { name: /print \/ save as pdf/i })).toBeVisible();
  });

  it("does not print; it asks the reader to sign up first", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(window.print).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: PRINT_GATE_TITLE });
    expect(dialog).toHaveTextContent(printGateBody(IDS.subjectTitle));
    expect(dialog).not.toHaveTextContent(/free to download|downloading .* is free/i);
    expect(logEvent).toHaveBeenCalledWith("print_click", expect.anything());
    expect(logEvent).toHaveBeenCalledWith("print_gate_shown", {
      year_id: IDS.yearId,
      subject_id: IDS.subjectId,
      module_id: IDS.moduleId,
    });
  });

  it("never prints even when the store would say subscribed", async () => {
    entitled = () => true;
    render(<PrintButton {...IDS} />);
    clickPrint();
    await settle();
    expect(window.print).not.toHaveBeenCalled();
  });

  it("offers Sign up first and Log in second, both returning here with ?print=1", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Sign up free", "Log in"]);
    for (const [link, path] of [
      [links[0], "/signup"],
      [links[1], "/login"],
    ] as const) {
      const url = new URL(link.getAttribute("href")!, "https://x.test");
      expect(url.pathname).toBe(path);
      expect(url.searchParams.get("next")).toBe(`${MODULE_PATH}?print=1`);
      expect(safeNextPath(url.searchParams.get("next"))).toBe(`${MODULE_PATH}?print=1`);
    }
  });

  it("focuses Sign up and closes on Escape or Not now", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(screen.getByRole("link", { name: "Sign up free" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    clickPrint();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is kept out of a printout", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(screen.getByRole("dialog").parentElement).toHaveClass("print:hidden");
  });
});

describe("PrintButton — clicked before access is known", () => {
  it("waits for the session, then prints for an entitled reader", async () => {
    sessionLoading();
    const { rerender } = render(<PrintButton {...IDS} />);
    clickPrint();
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    signedIn();
    rerender(<PrintButton {...IDS} />);
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
  });

  it("waits for the entitlement check, never printing early", async () => {
    entitled = statusLoading;
    const { rerender } = render(<PrintButton {...IDS} />);
    clickPrint();
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    entitled = unpaid;
    rerender(<PrintButton {...IDS} />);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(window.print).not.toHaveBeenCalled();
  });

  it("waits, then shows the sign-up gate for a signed-out reader", () => {
    sessionLoading();
    const { rerender } = render(<PrintButton {...IDS} />);
    clickPrint();
    signedOut();
    rerender(<PrintButton {...IDS} />);
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: PRINT_GATE_TITLE })).toBeInTheDocument();
  });
});

describe("PrintButton — back from sign-up with ?print=1", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", `${MODULE_PATH}?from=dashboard&print=1#top`);
  });

  it("prints once for an entitled reader and strips the marker", async () => {
    const { rerender } = render(<PrintButton {...IDS} />);
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
    expect(window.location.search).toBe("?from=dashboard");
    expect(window.location.hash).toBe("#top");
    rerender(<PrintButton {...IDS} />);
    await settle();
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("shows the unlock prompt, not the dialog, for a reader who is still unpaid", async () => {
    entitled = unpaid;
    render(<PrintButton {...IDS} />);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: printUnpaidTitle(IDS.subjectTitle) })).toBeInTheDocument(),
    );
    expect(window.print).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?from=dashboard");
  });

  it("does nothing until the session is known", () => {
    sessionLoading();
    render(<PrintButton {...IDS} />);
    expect(window.location.search).toContain("print=1");
    expect(window.print).not.toHaveBeenCalled();
  });

  it("does nothing, and keeps the marker, until the entitlement is known", async () => {
    entitled = statusLoading;
    render(<PrintButton {...IDS} />);
    await settle();
    expect(window.location.search).toContain("print=1");
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("strips the marker but never prints for a reader who is still signed out", async () => {
    signedOut();
    render(<PrintButton {...IDS} />);
    expect(window.location.search).toBe("?from=dashboard");
    await settle();
    expect(window.print).not.toHaveBeenCalled();
  });

  it("waits for a subscriber's reviewers before printing", async () => {
    const marker = document.createElement("span");
    marker.setAttribute("data-reader-unlock", "pending");
    document.body.appendChild(marker);
    render(<PrintButton {...IDS} />);
    await new Promise((r) => setTimeout(r, 300));
    expect(window.print).not.toHaveBeenCalled();
    marker.remove();
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
  });
});

describe("PrintButton — back from checkout after the unlock prompt", () => {
  function park(path = MODULE_PATH) {
    sessionStorage.setItem(PRINT_AFTER_UNLOCK_KEY, JSON.stringify({ path, at: Date.now() }));
  }

  beforeEach(() => {
    window.history.replaceState(null, "", `${MODULE_PATH}?payment=success`);
  });

  it("waits out the payment poll, then prints once access is confirmed", async () => {
    park();
    entitled = unpaid;
    polling = true;
    const { rerender } = render(<PrintButton {...IDS} />);
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    entitled = subjectPlan;
    polling = false;
    rerender(<PrintButton {...IDS} />);
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
    expect(sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY)).toBeNull();
  });

  it("does nothing if the payment never lands", async () => {
    park();
    entitled = unpaid;
    pollTimedOut = true;
    render(<PrintButton {...IDS} />);
    await settle();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY)).toBeNull();
  });

  it("does not print without a parked intent", async () => {
    render(<PrintButton {...IDS} />);
    await settle();
    expect(window.print).not.toHaveBeenCalled();
  });

  it("ignores an intent parked for another module", async () => {
    park(`/year/${IDS.yearId}/subjects/${IDS.subjectId}/modules/55555555-5555-5555-5555-555555555555`);
    render(<PrintButton {...IDS} />);
    await settle();
    expect(window.print).not.toHaveBeenCalled();
  });
});
