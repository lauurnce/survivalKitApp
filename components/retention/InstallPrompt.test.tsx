import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { InstallPrompt } from "./InstallPrompt";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));
import { INSTALL_DISMISSED_KEY } from "@/lib/retention/installPrompt";
import { RECENT_LESSONS_KEY } from "@/lib/retention/recentLessons";

const ANDROID = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1";

function readLessons(n: number) {
  const list = Array.from({ length: n }, (_, i) => ({
    yearId: "y", subjectId: "s", moduleId: `m${i}`, moduleTitle: `L${i}`, subjectTitle: "CP1", visitedAt: 1,
  }));
  localStorage.setItem(RECENT_LESSONS_KEY, JSON.stringify(list));
}

function setUA(ua: string) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
}

function fireInstallable() {
  const prompt = vi.fn(async () => {});
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome: "accepted" as const }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return prompt;
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("InstallPrompt", () => {
  it("stays hidden for a first-lesson reader", () => {
    setUA(ANDROID);
    readLessons(1);
    render(<InstallPrompt />);
    fireInstallable();
    expect(screen.queryByText(/home screen/i)).not.toBeInTheDocument();
  });

  it("offers the browser's install dialog on Android once installable", async () => {
    setUA(ANDROID);
    readLessons(2);
    render(<InstallPrompt />);
    expect(screen.queryByRole("button", { name: "Add to home screen" })).not.toBeInTheDocument();
    const prompt = fireInstallable();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Add to home screen" }));
    });
    expect(prompt).toHaveBeenCalled();
  });

  it("shows iPhone Safari the Share → Add to Home Screen steps", () => {
    setUA(IPHONE);
    readLessons(3);
    render(<InstallPrompt />);
    expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith("install_prompt_shown");
    expect(screen.queryByRole("button", { name: "Add to home screen" })).not.toBeInTheDocument();
  });

  it("remembers Not now", () => {
    setUA(IPHONE);
    readLessons(3);
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(screen.queryByText("Keep your lessons one tap away")).not.toBeInTheDocument();
    expect(Number(localStorage.getItem(INSTALL_DISMISSED_KEY))).toBeGreaterThan(0);
  });
});
