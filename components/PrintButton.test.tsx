// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
}));

let session = { ready: true, signedIn: true, userId: "u1", overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({
  useSession: () => session,
}));

import { PrintButton, PRINT_GATE_TITLE } from "./PrintButton";

const IDS = {
  yearId: "11111111-1111-1111-1111-111111111111",
  subjectId: "22222222-2222-2222-2222-222222222222",
  moduleId: "33333333-3333-3333-3333-333333333333",
};
const MODULE_PATH = `/year/${IDS.yearId}/subjects/${IDS.subjectId}/modules/${IDS.moduleId}`;

function signedIn() {
  session = { ready: true, signedIn: true, userId: "u1", overallDone: 0, overallTotal: 0 };
}
function signedOut() {
  session = { ready: true, signedIn: false, userId: null as unknown as string, overallDone: 0, overallTotal: 0 };
}
function loading() {
  session = { ready: false, signedIn: false, userId: null as unknown as string, overallDone: 0, overallTotal: 0 };
}

function clickPrint() {
  fireEvent.click(screen.getByRole("button", { name: /print \/ save as pdf/i }));
}

beforeEach(() => {
  logEvent.mockClear();
  window.print = vi.fn();
  signedIn();
});

describe("PrintButton — signed in", () => {
  it("logs print_click with the module and opens the print dialog", () => {
    render(<PrintButton {...IDS} />);
    clickPrint();
    expect(logEvent).toHaveBeenCalledWith("print_click", {
      year_id: IDS.yearId,
      subject_id: IDS.subjectId,
      module_id: IDS.moduleId,
    });
    expect(window.print).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("leaves itself out of the printout", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.getByRole("button")).toHaveClass("print:hidden");
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
    expect(dialog).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("print_click", expect.anything());
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

describe("PrintButton — clicked before the session is known", () => {
  it("waits, then prints for a signed-in reader", () => {
    loading();
    const { rerender } = render(<PrintButton {...IDS} />);
    clickPrint();
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    signedIn();
    rerender(<PrintButton {...IDS} />);
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("waits, then shows the gate for a signed-out reader", () => {
    loading();
    const { rerender } = render(<PrintButton {...IDS} />);
    clickPrint();
    signedOut();
    rerender(<PrintButton {...IDS} />);
    expect(window.print).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
