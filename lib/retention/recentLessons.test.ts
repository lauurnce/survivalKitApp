import { afterEach, describe, expect, it } from "vitest";
import {
  LEGACY_LAST_MODULE_KEY,
  MAX_RECENT_LESSONS,
  RECENT_LESSONS_KEY,
  addRecentLesson,
  lessonHref,
  parseLessonPath,
  parseRecentLessons,
  readRecentLessons,
  recordRecentLesson,
  titlesFromDocumentTitle,
  visitedAgo,
  type RecentLesson,
} from "./recentLessons";

const lesson = (moduleId: string, visitedAt = 1): RecentLesson => ({
  yearId: "y1",
  subjectId: "s1",
  moduleId,
  moduleTitle: `Lesson ${moduleId}`,
  subjectTitle: "Computer Programming 1",
  visitedAt,
});

afterEach(() => localStorage.clear());

describe("parseLessonPath", () => {
  it("reads the ids from a lesson URL", () => {
    expect(parseLessonPath("/year/y1/subjects/s1/modules/m1")).toEqual({ yearId: "y1", subjectId: "s1", moduleId: "m1" });
    expect(parseLessonPath("/year/y1/subjects/s1/modules/m1/")).not.toBeNull();
  });

  it("ignores every other page", () => {
    for (const p of ["/", "/year", "/year/y1/subjects", "/year/y1/subjects/s1/modules", "/search"]) {
      expect(parseLessonPath(p)).toBeNull();
    }
  });

  it("round-trips through lessonHref", () => {
    const route = parseLessonPath("/year/a/subjects/b/modules/c")!;
    expect(lessonHref(route)).toBe("/year/a/subjects/b/modules/c");
  });
});

describe("titlesFromDocumentTitle", () => {
  it("splits the reader's title into module and subject", () => {
    expect(titlesFromDocumentTitle("Lesson 1: Programming Concepts · Computer Programming 1 — BSIT Survival Kit")).toEqual({
      moduleTitle: "Lesson 1: Programming Concepts",
      subjectTitle: "Computer Programming 1",
    });
  });

  it("keeps a middle dot inside the module title", () => {
    expect(titlesFromDocumentTitle("A · B · Subject — BSIT Survival Kit")).toEqual({ moduleTitle: "A · B", subjectTitle: "Subject" });
  });

  it("returns no subject for a title without one, and null for the bare site title", () => {
    expect(titlesFromDocumentTitle("Search — BSIT Survival Kit")).toEqual({ moduleTitle: "Search", subjectTitle: "" });
    expect(titlesFromDocumentTitle("BSIT Survival Kit")).toBeNull();
  });
});

describe("addRecentLesson", () => {
  it("puts the newest first and keeps one entry per module", () => {
    const list = addRecentLesson([lesson("a"), lesson("b")], lesson("b", 9));
    expect(list.map((l) => l.moduleId)).toEqual(["b", "a"]);
    expect(list[0].visitedAt).toBe(9);
  });

  it("caps the list", () => {
    let list: RecentLesson[] = [];
    for (let i = 0; i < MAX_RECENT_LESSONS + 3; i++) list = addRecentLesson(list, lesson(String(i)));
    expect(list).toHaveLength(MAX_RECENT_LESSONS);
    expect(list[0].moduleId).toBe(String(MAX_RECENT_LESSONS + 2));
  });
});

describe("parseRecentLessons", () => {
  it("drops malformed entries and never throws", () => {
    expect(parseRecentLessons("not json")).toEqual([]);
    expect(parseRecentLessons('{"a":1}')).toEqual([]);
    expect(parseRecentLessons(JSON.stringify([lesson("a"), { moduleId: 3 }, null]))).toEqual([lesson("a")]);
  });
});

describe("storage", () => {
  it("records and reads back", () => {
    recordRecentLesson(lesson("a", 5));
    recordRecentLesson(lesson("b", 6));
    expect(readRecentLessons().map((l) => l.moduleId)).toEqual(["b", "a"]);
    expect(JSON.parse(localStorage.getItem(RECENT_LESSONS_KEY)!)).toHaveLength(2);
  });

  it("falls back to the reader's older single-lesson key", () => {
    localStorage.setItem(
      LEGACY_LAST_MODULE_KEY,
      JSON.stringify({ moduleId: "m", subjectId: "s", yearId: "y", moduleTitle: "Arrays", subjectTitle: "CP1" }),
    );
    expect(readRecentLessons()).toEqual([
      { moduleId: "m", subjectId: "s", yearId: "y", moduleTitle: "Arrays", subjectTitle: "CP1", visitedAt: 0 },
    ]);
  });
});

describe("visitedAgo", () => {
  const now = new Date(2026, 9, 31, 15, 0).getTime();
  it("speaks in days and weeks", () => {
    expect(visitedAgo(new Date(2026, 9, 31, 8, 0).getTime(), now)).toBe("today");
    expect(visitedAgo(new Date(2026, 9, 30, 23, 0).getTime(), now)).toBe("yesterday");
    expect(visitedAgo(new Date(2026, 9, 27).getTime(), now)).toBe("4 days ago");
    expect(visitedAgo(new Date(2026, 9, 1).getTime(), now)).toBe("4 weeks ago");
    expect(visitedAgo(0, now)).toBe("");
  });
});
