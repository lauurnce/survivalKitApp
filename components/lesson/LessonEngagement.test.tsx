// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const logEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ logEvent: (...args: unknown[]) => logEvent(...args) }));

import { LessonEngagement } from "./LessonEngagement";

const NEXT = { href: "/year/y/subjects/s/modules/m2", title: "Lesson 2: Introduction to C" };
const IDS = { moduleId: "m1", subjectId: "s", yearId: "y" };

// jsdom has no layout: give the lesson body a fixed box and drive scrollY.
function mountBody(top = 0, height = 1000) {
  const body = document.createElement("article");
  body.id = "lesson-body";
  body.getBoundingClientRect = () =>
    ({ top: top - window.scrollY, height, bottom: 0, left: 0, right: 0, width: 0, x: 0, y: 0, toJSON() {} }) as DOMRect;
  document.body.appendChild(body);
  return body;
}

async function scrollTo(y: number) {
  await act(async () => {
    window.scrollY = y;
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}

beforeEach(() => {
  logEvent.mockClear();
  window.innerHeight = 200;
  window.scrollY = 0;
});

afterEach(() => {
  document.getElementById("lesson-body")?.remove();
});

describe("LessonEngagement", () => {
  it("tracks progress and logs halfway and end once each", async () => {
    mountBody();
    render(<LessonEngagement {...IDS} totalMinutes={6} next={NEXT} />);
    await scrollTo(0);
    expect(screen.getByRole("progressbar", { name: "Lesson progress" })).toHaveAttribute("aria-valuenow", "20");
    expect(logEvent).not.toHaveBeenCalled();

    await scrollTo(350);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith("lesson_halfway", { module_id: "m1", subject_id: "s", year_id: "y" });

    await scrollTo(400);
    await scrollTo(900);
    expect(logEvent.mock.calls.map((c) => c[0])).toEqual(["lesson_halfway", "lesson_end"]);
  });

  it("shows the next-lesson bar from 60% with time left, and logs the tap", async () => {
    mountBody();
    render(<LessonEngagement {...IDS} totalMinutes={6} next={NEXT} />);
    await scrollTo(200); // 40%
    expect(screen.queryByRole("link", { name: /next lesson/i })).not.toBeInTheDocument();

    await scrollTo(500); // 70%
    const link = screen.getByRole("link", { name: "Next lesson: Lesson 2: Introduction to C" });
    expect(link).toHaveAttribute("href", NEXT.href);
    expect(link).toHaveTextContent("2 min left");

    fireEvent.click(link);
    expect(logEvent).toHaveBeenCalledWith("next_lesson_click", { module_id: "m1", subject_id: "s", year_id: "y" });
  });

  it("can be dismissed", async () => {
    mountBody();
    render(<LessonEngagement {...IDS} totalMinutes={6} next={NEXT} />);
    await scrollTo(500);
    fireEvent.click(screen.getByRole("button", { name: "Hide next lesson bar" }));
    expect(screen.queryByRole("link", { name: /next lesson/i })).not.toBeInTheDocument();
  });

  it("has no bar on a subject's last lesson", async () => {
    mountBody();
    render(<LessonEngagement {...IDS} totalMinutes={6} next={null} />);
    await scrollTo(700);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
