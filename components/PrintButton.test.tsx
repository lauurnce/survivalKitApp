// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
}));

import { PrintButton } from "./PrintButton";

const IDS = {
  yearId: "11111111-1111-1111-1111-111111111111",
  subjectId: "22222222-2222-2222-2222-222222222222",
  moduleId: "33333333-3333-3333-3333-333333333333",
};

beforeEach(() => {
  logEvent.mockClear();
  window.print = vi.fn();
});

describe("PrintButton", () => {
  it("logs print_click with the module and opens the print dialog", () => {
    render(<PrintButton {...IDS} />);
    fireEvent.click(screen.getByRole("button", { name: /print \/ save as pdf/i }));
    expect(logEvent).toHaveBeenCalledWith("print_click", {
      year_id: IDS.yearId,
      subject_id: IDS.subjectId,
      module_id: IDS.moduleId,
    });
    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("leaves itself out of the printout", () => {
    render(<PrintButton {...IDS} />);
    expect(screen.getByRole("button")).toHaveClass("print:hidden");
  });
});
