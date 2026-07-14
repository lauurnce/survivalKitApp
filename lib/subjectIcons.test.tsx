import { describe, it, expect } from "vitest";
import { SUBJECT_SLUGS, SUBJECT_ICONS, resolveSubjectSlug, iconForTitle, BOOK_FALLBACK } from "./subjectIcons";

// Mirror of the live-DB subject titles (project mpdymglipgzuybtxuvhy).
const DB_TITLES = [
  "Computer Programming 1", "Introduction to Computing", "Mathematics in the Modern World",
  "Accounting Principles", "Purposive Communication", "Filipinolohiya", "Understanding the Self",
  "Computer Programming 2", "Discrete Structures 1", "Reading in Philippine History",
  "Science, Technology and Society", "The Contemporary World", "Data Communications and Networking",
  "Data Structures and Algorithms", "Structured Programming (COBOL)", "Operating Systems",
  "World Literature", "Object-Oriented Programming with Java", "Network Administration",
  "Information Management", "Human Computer Interaction", "Integrative Programming and Technologies 1",
  "Ethics", "The Life and Works of Rizal", "Multimedia", "Systems Integration and Architecture",
  "Fundamentals of Research", "Web Development", "Database Administration",
  "Applications Development and Emerging Technologies", "Technopreneurship",
  "Systems Analysis and Design", "Information Assurance and Security 1",
  "Systems Administration and Maintenance", "Information Assurance and Security 2",
  "Social and Professional Issues in IT",
];

describe("subjectIcons", () => {
  it("every DB title resolves to a slug that has a glyph", () => {
    for (const title of DB_TITLES) {
      const slug = resolveSubjectSlug(title);
      expect(slug, `no slug for "${title}"`).not.toBeNull();
      expect(SUBJECT_ICONS[slug as string], `no glyph for slug "${slug}" (title "${title}")`).toBeDefined();
    }
  });

  it("has exactly 36 title mappings", () => {
    expect(Object.keys(SUBJECT_SLUGS)).toHaveLength(36);
  });

  it("resolves case- and whitespace-insensitively", () => {
    expect(resolveSubjectSlug("  computer programming 1 ")).toBe("comp-prog-1");
  });

  it("returns null for an unknown title", () => {
    expect(resolveSubjectSlug("Totally Made Up Subject")).toBeNull();
  });

  it("iconForTitle falls back to the book glyph for unknown titles", () => {
    expect(iconForTitle("Totally Made Up Subject")).toBe(BOOK_FALLBACK);
  });

  it("every glyph in the registry is used by some slug", () => {
    const usedSlugs = new Set(Object.values(SUBJECT_SLUGS));
    for (const slug of Object.keys(SUBJECT_ICONS)) {
      expect(usedSlugs.has(slug), `glyph "${slug}" is unused`).toBe(true);
    }
  });
});
