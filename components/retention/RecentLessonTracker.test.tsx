import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { RecentLessonTracker } from "./RecentLessonTracker";
import { readRecentLessons } from "@/lib/retention/recentLessons";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

afterEach(() => {
  localStorage.clear();
  document.title = "";
});

describe("RecentLessonTracker", () => {
  it("records a lesson once its title is in place", async () => {
    pathname = "/year/y1/subjects/s1/modules/m1";
    document.title = "BSIT Survival Kit";
    render(<RecentLessonTracker />);
    expect(readRecentLessons()).toEqual([]);

    await act(async () => {
      document.title = "Arrays · Computer Programming 1 — BSIT Survival Kit";
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(readRecentLessons()).toMatchObject([
      { yearId: "y1", subjectId: "s1", moduleId: "m1", moduleTitle: "Arrays", subjectTitle: "Computer Programming 1" },
    ]);
  });

  it("ignores pages that are not lessons", () => {
    pathname = "/year";
    document.title = "Arrays · Computer Programming 1 — BSIT Survival Kit";
    render(<RecentLessonTracker />);
    expect(readRecentLessons()).toEqual([]);
  });
});
