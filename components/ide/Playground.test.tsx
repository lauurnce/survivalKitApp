import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn(() => Promise.resolve()) }));
vi.mock("./CodeEditor", () => ({ CodeEditor: () => null }));
vi.mock("@/lib/ide/runners", () => ({
  getRunner: vi.fn(async () => ({
    run: vi.fn(async () => ({ stdout: "ok", stderr: "", exitCode: 0, timedOut: false, durationMs: 1 })),
  })),
}));

import { logEvent } from "@/lib/analytics";
import { Playground } from "./Playground";

describe("Playground code_run tracking", () => {
  beforeEach(() => vi.mocked(logEvent).mockClear());

  it("logs code_run with the module id when Run is pressed", () => {
    render(<Playground languageId="python" initialCode="print(1)" moduleId="m1" />);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(logEvent).toHaveBeenCalledWith("code_run", { module_id: "m1" });
  });

  it("logs code_run without a module id on the standalone playground", () => {
    render(<Playground languageId="python" initialCode="print(1)" />);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(logEvent).toHaveBeenCalledWith("code_run", {});
  });
});
