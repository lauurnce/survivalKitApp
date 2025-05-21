import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamCountdown } from "./ExamCountdown";

afterEach(() => vi.useRealTimers());

function at(iso: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${iso}+08:00`));
}

describe("ExamCountdown", () => {
  it("counts down to December finals", () => {
    at("2026-10-31T10:00:00");
    render(<ExamCountdown href="/year" />);
    expect(screen.getByText("Finals start in 39 days")).toBeInTheDocument();
    expect(screen.getByText(/Dec 9–Dec 19/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start reviewing/ })).toHaveAttribute("href", "/year");
  });

  it("says finals week while it runs", () => {
    at("2026-12-10T10:00:00");
    render(<ExamCountdown />);
    expect(screen.getByText("Finals week")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders nothing on a break, far from exams", () => {
    at("2026-12-25T10:00:00");
    const { container } = render(<ExamCountdown />);
    expect(container).toBeEmptyDOMElement();
  });
});
