import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentLessons } from "./RecentLessons";
import { RECENT_LESSONS_KEY } from "@/lib/retention/recentLessons";

afterEach(() => localStorage.clear());

function store(lessons: object[]) {
  localStorage.setItem(RECENT_LESSONS_KEY, JSON.stringify(lessons));
}

const entry = (moduleId: string, yearId = "y1") => ({
  yearId,
  subjectId: "s1",
  moduleId,
  moduleTitle: `Lesson ${moduleId}`,
  subjectTitle: "Computer Programming 1",
  visitedAt: Date.now(),
});

describe("RecentLessons", () => {
  it("renders nothing for a first-time visitor", () => {
    const { container } = render(<RecentLessons />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the latest lesson, then the older ones", () => {
    store([entry("1"), entry("2"), entry("3"), entry("4")]);
    render(<RecentLessons />);
    expect(screen.getByText("Pick up where you left off")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/year/y1/subjects/s1/modules/1",
      "/year/y1/subjects/s1/modules/2",
      "/year/y1/subjects/s1/modules/3",
    ]);
    expect(screen.getByText(/Opened today/)).toBeInTheDocument();
  });

  it("filters to one year when asked", () => {
    store([entry("1", "y2"), entry("2", "y1")]);
    render(<RecentLessons yearId="y1" extra={0} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("Lesson 2")).toBeInTheDocument();
  });
});
