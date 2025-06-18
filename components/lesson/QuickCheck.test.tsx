// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

import { QuickCheck } from "./QuickCheck";

const QUESTIONS = [
  { id: "q1", prompt: "Index of the last element of int a[10]?", choices: ["10", "9"], answer: 1, why: "Arrays start at 0." },
  { id: "q2", prompt: "11 % 2?", code: "11 % 2", choices: ["1", "5"], answer: 0, why: "Remainder." },
];
const IDS = { moduleId: "m1", subjectId: "s", yearId: "y" };

beforeEach(() => logEvent.mockClear());

describe("QuickCheck", () => {
  it("reveals the reason and logs a correct first answer once", () => {
    render(<QuickCheck {...IDS} questions={QUESTIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct. Arrays start at 0.");
    expect(logEvent).toHaveBeenCalledWith("quick_check_correct", { module_id: "m1", subject_id: "s", year_id: "y" });

    // Locked after the first answer: no second event.
    fireEvent.click(screen.getByRole("button", { name: /^10/ }));
    expect(logEvent).toHaveBeenCalledTimes(1);
  });

  it("logs a wrong answer and points at the right one", () => {
    render(<QuickCheck {...IDS} questions={QUESTIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite. Remainder.");
    expect(screen.getByRole("button", { name: /^1\s*\(correct answer\)$/ })).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("quick_check_wrong", { module_id: "m1", subject_id: "s", year_id: "y" });
  });

  it("shows a score once every question is answered", () => {
    render(<QuickCheck {...IDS} questions={QUESTIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    expect(screen.queryByText(/of 2 right/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByText(/1 of 2 right/)).toBeInTheDocument();
  });

  it("renders code under the prompt", () => {
    render(<QuickCheck {...IDS} questions={QUESTIONS} />);
    expect(screen.getByText("11 % 2", { selector: "code" })).toBeInTheDocument();
  });

  it("renders nothing without questions", () => {
    const { container } = render(<QuickCheck {...IDS} questions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
