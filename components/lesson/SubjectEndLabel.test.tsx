// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let completed = new Set<string>();
vi.mock("@/lib/progress", () => ({
  fetchCompletedModules: vi.fn(() => Promise.resolve(completed)),
}));

import { SubjectEndLabel } from "./SubjectEndLabel";

beforeEach(() => {
  completed = new Set();
});

describe("SubjectEndLabel (QA CT-14)", () => {
  it("does not congratulate a reader with nothing marked done", async () => {
    render(<SubjectEndLabel moduleIds={["m1", "m2"]} />);
    expect(screen.getByText("End of this subject")).toBeInTheDocument();
    await Promise.resolve();
    expect(screen.queryByText(/finished this subject/i)).toBeNull();
  });

  it("stays neutral when only some modules are done", async () => {
    completed = new Set(["m2"]);
    render(<SubjectEndLabel moduleIds={["m1", "m2"]} />);
    await Promise.resolve();
    expect(screen.queryByText(/finished this subject/i)).toBeNull();
  });

  it("says the subject is finished once progress confirms every module", async () => {
    completed = new Set(["m1", "m2"]);
    render(<SubjectEndLabel moduleIds={["m1", "m2"]} />);
    expect(await screen.findByText(/you.ve finished this subject/i)).toBeInTheDocument();
  });
});
