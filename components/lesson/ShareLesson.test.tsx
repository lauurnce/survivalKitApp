// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

import { ShareLesson } from "./ShareLesson";

const PROPS = {
  path: "/year/y/subjects/s/modules/m1",
  moduleTitle: "Lesson 1: Programming Concepts",
  subjectTitle: "Computer Programming 1",
  moduleId: "m1",
  subjectId: "s",
  yearId: "y",
};
const TAGGED = "utm_source=lesson_share&utm_medium=groupchat&utm_campaign=lesson";

beforeEach(() => logEvent.mockClear());
afterEach(() => vi.unstubAllGlobals());

describe("ShareLesson", () => {
  it("opens the share sheet with a tagged lesson link", async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share: shareFn });
    render(<ShareLesson {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to groupmates" }));

    await waitFor(() => expect(shareFn).toHaveBeenCalled());
    const arg = shareFn.mock.calls[0][0];
    expect(arg.title).toBe(PROPS.moduleTitle);
    expect(arg.url).toContain(`${PROPS.path}?${TAGGED}`);
    expect(logEvent).toHaveBeenCalledWith("lesson_share", { module_id: "m1", subject_id: "s", year_id: "y" });
  });

  it("copies the link when there is no share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: { writeText } });
    render(<ShareLesson {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to groupmates" }));

    await screen.findByRole("button", { name: "Link copied" });
    expect(writeText.mock.calls[0][0]).toContain(TAGGED);
  });

  it("treats closing the share sheet as done, not as a reason to copy", async () => {
    const shareFn = vi.fn().mockRejectedValue(new DOMException("closed", "AbortError"));
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, share: shareFn, clipboard: { writeText } });
    render(<ShareLesson {...PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: "Send to groupmates" }));

    await waitFor(() => expect(shareFn).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
  });
});
