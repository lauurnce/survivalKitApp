// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LessonOverview } from "./LessonOverview";
import { sectionAnchor } from "@/lib/lesson/anchors";

const words = (n: number) => Array.from({ length: n }, () => "w").join(" ");

const SECTIONS = [
  { id: "a", kind: "content", heading: "What Is a Computer?", body_md: words(400) },
  { id: "b", kind: "content", heading: "Algorithms", body_md: words(400), ide_language: "c" },
  { id: "c", kind: "activity", heading: "Practice Exercises", body_md: "" },
  { id: "d", kind: "activity", heading: "Worked Solutions", body_md: "" },
];

describe("LessonOverview", () => {
  it("states length and shape before the first paragraph", () => {
    render(<LessonOverview sections={SECTIONS} />);
    const nav = screen.getByRole("navigation", { name: "In this lesson" });
    expect(nav).toHaveTextContent("4 min read");
    expect(nav).toHaveTextContent("2 topics");
    expect(nav).toHaveTextContent("Code you can run here");
    expect(nav).toHaveTextContent("2 practice sets");
  });

  it("links each content topic to its section anchor, skipping activities", () => {
    render(<LessonOverview sections={SECTIONS} />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      `#${sectionAnchor("a")}`,
      `#${sectionAnchor("b")}`,
    ]);
    expect(links[0]).toHaveTextContent("What Is a Computer?");
  });

  it("uses singular labels", () => {
    render(<LessonOverview sections={[SECTIONS[0], SECTIONS[2]]} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveTextContent("1 topic");
    expect(nav).toHaveTextContent("1 practice set");
    expect(nav).not.toHaveTextContent("Code you can run");
  });

  it("renders nothing without content sections", () => {
    const { container } = render(<LessonOverview sections={[SECTIONS[2]]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
