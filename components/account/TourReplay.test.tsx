import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourReplay } from "./TourReplay";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  localStorage.clear();
  pushMock.mockReset();
});

describe("TourReplay", () => {
  it("is always visible with its title and replay trigger", () => {
    render(<TourReplay />);
    expect(screen.getByRole("heading", { name: /guided tour/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /replay tour/i })).toBeInTheDocument();
  });

  it("clears every tour's completion state and navigates to the dashboard", () => {
    localStorage.setItem("bsit:tour:landing", "1");
    localStorage.setItem("bsit:tour:dashboard", "1");
    localStorage.setItem("bsit:tour:profile", "1");
    localStorage.setItem("some-unrelated-key", "keep me");

    render(<TourReplay />);
    fireEvent.click(screen.getByRole("button", { name: /replay tour/i }));

    expect(localStorage.getItem("bsit:tour:landing")).toBeNull();
    expect(localStorage.getItem("bsit:tour:dashboard")).toBeNull();
    expect(localStorage.getItem("bsit:tour:profile")).toBeNull();
    expect(localStorage.getItem("some-unrelated-key")).toBe("keep me");
    expect(pushMock).toHaveBeenCalledWith("/account");
  });
});
