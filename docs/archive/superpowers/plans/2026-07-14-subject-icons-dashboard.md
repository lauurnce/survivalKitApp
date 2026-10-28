# Subject Icons on the Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every subject a distinctive thin-line inline-SVG icon in a peach tile across the dashboard semester grid (2-column redesign), the "This Week" panel, and the Subjects page.

**Architecture:** A single icon library (`lib/subjectIcons.tsx`) holds a title→slug map and a slug→inline-SVG registry, redrawn from the user's reference PNGs. A presentational `<SubjectIcon title>` component resolves and renders the glyph in a peach tile with a book fallback. Consumers (`SemesterSections`, `ThisWeekPanel`, Subjects page) import that component. The semester list is rebuilt into a responsive 2-column card grid with an in-progress card highlight.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Vitest + React Testing Library.

## Global Constraints

- Icons are **inline SVG only**, redrawn to match the reference artwork. No raster PNGs ship to the client; `assets/subject icons/*.png` stay as design reference.
- SVG glyphs: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.6}`, `strokeLinecap="round"`, `strokeLinejoin="round"`. Color comes from the parent's `text-*` class.
- Peach tile styling: `inline-flex items-center justify-center rounded-lg bg-accent/10 text-accent`. Default tile `w-10 h-10`, inner svg `w-5 h-5`; overridable via `className`.
- Title matching is case-insensitive and whitespace-trimmed. Map keys are the exact live-DB titles.
- Status values come from `lib/dashboard.ts`: `SubjectStatus = "done" | "in-progress" | "ready"` (note the hyphen). In-progress card highlight uses `bg-accent/5 border-accent/30`.
- Tailwind tokens available: `accent`, `accent-dark`, `paper`, `ink`, `ink-muted`, `ink-faint`, `taupe`, `navy`. Use these, not raw hex.
- Test runner: `npx vitest run <path>`. Do not add `Co-Authored-By` trailers to commits (user is sole contributor).
- The 36 canonical DB titles and their slugs are in the spec: `docs/superpowers/specs/2026-07-14-subject-icons-dashboard-design.md`.

---

### Task 1: Icon library — title→slug map + resolver + slug registry + fallback

**Files:**
- Create: `lib/subjectIcons.tsx`
- Test: `lib/subjectIcons.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `SUBJECT_SLUGS: Record<string, string>` — exact DB title → slug.
  - `resolveSubjectSlug(title: string): string | null`
  - `SUBJECT_ICONS: Record<string, ReactNode>` — slug → inline `<g>`/`<path>` fragment (SVG children only, no wrapping `<svg>`).
  - `BOOK_FALLBACK: ReactNode` — generic book glyph fragment.
  - `iconForTitle(title: string): ReactNode` — returns the matched glyph fragment, or `BOOK_FALLBACK` if unmatched.

- [ ] **Step 1: Write the failing test**

Create `lib/subjectIcons.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/subjectIcons.test.tsx`
Expected: FAIL — cannot resolve module `./subjectIcons`.

- [ ] **Step 3: Write the implementation**

Create `lib/subjectIcons.tsx`. Start with the map, resolver, and fallback, then the full glyph registry. Each glyph is a fragment of SVG children (paths/circles/etc.) — the wrapping `<svg>` lives in the component (Task 2).

```tsx
import type { ReactNode } from "react";

// Exact live-DB subject title → icon slug. Keys must match the `subjects.title`
// column verbatim (project mpdymglipgzuybtxuvhy). Matching at runtime is
// case-insensitive + trimmed via resolveSubjectSlug.
export const SUBJECT_SLUGS: Record<string, string> = {
  "Computer Programming 1": "comp-prog-1",
  "Introduction to Computing": "intro-computing",
  "Mathematics in the Modern World": "math-modern-world",
  "Accounting Principles": "accounting",
  "Purposive Communication": "purposive-comm",
  "Filipinolohiya": "filipinolohiya",
  "Understanding the Self": "understanding-self",
  "Computer Programming 2": "comp-prog-2",
  "Discrete Structures 1": "discrete-structures",
  "Reading in Philippine History": "ph-history",
  "Science, Technology and Society": "sts",
  "The Contemporary World": "contemporary-world",
  "Data Communications and Networking": "data-comm-network",
  "Data Structures and Algorithms": "dsa",
  "Structured Programming (COBOL)": "cobol",
  "Operating Systems": "operating-systems",
  "World Literature": "world-lit",
  "Object-Oriented Programming with Java": "oop-java",
  "Network Administration": "network-admin",
  "Information Management": "info-management",
  "Human Computer Interaction": "hci",
  "Integrative Programming and Technologies 1": "ipt-1",
  "Ethics": "ethics",
  "The Life and Works of Rizal": "rizal",
  "Multimedia": "multimedia",
  "Systems Integration and Architecture": "sys-integration",
  "Fundamentals of Research": "research",
  "Web Development": "web-dev",
  "Database Administration": "database-admin",
  "Applications Development and Emerging Technologies": "app-dev-emerging",
  "Technopreneurship": "technopreneurship",
  "Systems Analysis and Design": "sad",
  "Information Assurance and Security 1": "ias-1",
  "Systems Administration and Maintenance": "sys-admin",
  "Information Assurance and Security 2": "ias-2",
  "Social and Professional Issues in IT": "social-prof-issues",
};

// Lowercase+trimmed lookup table, built once.
const NORMALIZED_SLUGS: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_SLUGS).map(([title, slug]) => [title.trim().toLowerCase(), slug]),
);

export function resolveSubjectSlug(title: string): string | null {
  return NORMALIZED_SLUGS[title.trim().toLowerCase()] ?? null;
}

// Generic fallback for any subject whose title isn't mapped (open book).
export const BOOK_FALLBACK: ReactNode = (
  <>
    <path d="M12 6.5C10.5 5.3 8.4 4.8 6 4.8V17c2.4 0 4.5.5 6 1.7 1.5-1.2 3.6-1.7 6-1.7V4.8c-2.4 0-4.5.5-6 1.7Z" />
    <path d="M12 6.5v12.2" />
  </>
);

export const SUBJECT_ICONS: Record<string, ReactNode> = {
  // </>  — code brackets
  "comp-prog-1": (
    <>
      <path d="M8.5 8 5 12l3.5 4" />
      <path d="M15.5 8 19 12l-3.5 4" />
      <path d="M13.5 6.5 10.5 17.5" />
    </>
  ),
  // desktop monitor
  "intro-computing": (
    <>
      <rect x="3.5" y="5" width="17" height="11" rx="1.5" />
      <path d="M9.5 20h5M12 16v4" />
    </>
  ),
  // pi symbol + small shapes
  "math-modern-world": (
    <>
      <path d="M5 9h9" />
      <path d="M8 9v8" />
      <path d="M12.5 9v6.5c0 1 .6 1.5 1.5 1.5" />
      <circle cx="18" cy="7" r="1.2" />
      <path d="M16.4 11.5h2.6l-1.3 2.2Z" />
    </>
  ),
  // ledger + coins
  "accounting": (
    <>
      <rect x="4" y="5" width="9" height="11" rx="1" />
      <path d="M6.5 8.5h4M6.5 11h4M6.5 13.5h2.5" />
      <circle cx="16.5" cy="14" r="3.2" />
      <path d="M16.5 12.2v3.6" />
    </>
  ),
  // two overlapping speech bubbles
  "purposive-comm": (
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h6A1.5 1.5 0 0 1 13 7.5v3A1.5 1.5 0 0 1 11.5 12H8l-2.5 2v-2H5.5A1.5 1.5 0 0 1 4 10.5Z" />
      <path d="M11 13.5v.5A1.5 1.5 0 0 0 12.5 15.5H16l2.5 2v-2h.5A1.5 1.5 0 0 0 20.5 14v-3A1.5 1.5 0 0 0 19 9.5h-3" />
    </>
  ),
  // three-stars-and-a-sun / sun with rays
  "filipinolohiya": (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7 7l1.4 1.4M16.6 16.6 18 18M17 7l-1.4 1.4M8.4 15.6 7 17" />
    </>
  ),
  // head profile + heart
  "understanding-self": (
    <>
      <path d="M17 18c0-2.5-1-5.2-2.4-6.8C13.4 9.8 12 9 10.2 9 7.3 9 5.5 11 5.5 13.6c0 1.4.7 2.6 1.8 3.3V19" />
      <path d="M11 12.2c.5-.7 1.6-.6 1.9.2.3-.8 1.4-.9 1.9-.2.4.6.1 1.4-.9 2.1l-1 .7-1-.7c-1-.7-1.3-1.5-.9-2.1Z" />
    </>
  ),
  // { } braces
  "comp-prog-2": (
    <>
      <path d="M10 6c-1.5 0-2 .8-2 2v2c0 1-.6 1.6-1.5 2 .9.4 1.5 1 1.5 2v2c0 1.2.5 2 2 2" />
      <path d="M14 6c1.5 0 2 .8 2 2v2c0 1 .6 1.6 1.5 2-.9.4-1.5 1-1.5 2v2c0 1.2-.5 2-2 2" />
    </>
  ),
  // connected graph nodes (triangle)
  "discrete-structures": (
    <>
      <circle cx="7" cy="9" r="1.8" />
      <circle cx="17" cy="9" r="1.8" />
      <circle cx="12" cy="17" r="1.8" />
      <path d="M8.5 9.6 15.5 9.6M8 10.5 11 15.3M16 10.5 13 15.3" />
    </>
  ),
  // rolled scroll
  "ph-history": (
    <>
      <path d="M7 6h8a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2Z" />
      <path d="M7 6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2" />
      <path d="M10 10h4M10 13h4" />
    </>
  ),
  // atom + gear
  "sts": (
    <>
      <circle cx="10" cy="10" r="2" />
      <ellipse cx="10" cy="10" rx="6" ry="2.6" transform="rotate(45 10 10)" />
      <ellipse cx="10" cy="10" rx="6" ry="2.6" transform="rotate(-45 10 10)" />
      <circle cx="17.5" cy="16.5" r="2.4" />
      <path d="M17.5 13.4v-.9M17.5 20.5v-.9M14.4 16.5h-.9M21.5 16.5h-.9" />
    </>
  ),
  // globe + connecting lines
  "contemporary-world": (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M5 12h14M12 5c2 2.3 2 11.7 0 14M12 5c-2 2.3-2 11.7 0 14" />
    </>
  ),
  // linked network nodes
  "data-comm-network": (
    <>
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="18" cy="7" r="1.8" />
      <circle cx="18" cy="17" r="1.8" />
      <path d="M7.6 11.1 16.4 7.8M7.6 12.9 16.4 16.2" />
    </>
  ),
  // branching node tree
  "dsa": (
    <>
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="7" cy="13" r="1.6" />
      <circle cx="17" cy="13" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
      <path d="M11 7.2 8 11.6M13 7.2 16 11.6M17 14.6v2.3" />
    </>
  ),
  // retro punch card
  "cobol": (
    <>
      <path d="M5 6h11l3 3v9H5Z" />
      <path d="M16 6v3h3" />
      <path d="M7.5 12h2M11 12h2M7.5 14.5h6" />
    </>
  ),
  // stacked layers + central cog
  "operating-systems": (
    <>
      <path d="M4 8l8-3 8 3-8 3Z" />
      <path d="M4 12l8 3 8-3" />
      <circle cx="12" cy="15.5" r="2" />
      <path d="M12 12.8v-.6M12 18.8v-.6M9.2 15.5h.6M14.2 15.5h.6" />
    </>
  ),
  // open book + globe
  "world-lit": (
    <>
      <path d="M12 8.5C10.7 7.6 9 7.2 7 7.2V17c2 0 3.7.4 5 1.3 1.3-.9 3-1.3 5-1.3V7.2c-2 0-3.7.4-5 1.3Z" />
      <path d="M12 8.5v9.8" />
      <circle cx="16.5" cy="6" r="2" />
    </>
  ),
  // coffee cup (Java) + blocks
  "oop-java": (
    <>
      <path d="M6 9h9v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" />
      <path d="M15 10h1.5a1.5 1.5 0 0 1 0 3H15" />
      <path d="M9 4.5c-.6.7-.6 1.3 0 2M12 4.5c-.6.7-.6 1.3 0 2" />
    </>
  ),
  // server rack + gear
  "network-admin": (
    <>
      <rect x="4" y="5" width="12" height="4" rx="1" />
      <rect x="4" y="11" width="12" height="4" rx="1" />
      <path d="M6.5 7h.01M6.5 13h.01" />
      <circle cx="17.5" cy="16.5" r="2.2" />
      <path d="M17.5 13.6v-.8M17.5 20.2v-.8M14.6 16.5h-.8M21.2 16.5h-.8" />
    </>
  ),
  // database cylinder / stacked records
  "info-management": (
    <>
      <ellipse cx="12" cy="6.5" rx="6" ry="2.2" />
      <path d="M6 6.5v11c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-11" />
      <path d="M6 12c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2" />
    </>
  ),
  // hand/cursor touching a screen
  "hci": (
    <>
      <rect x="4" y="5" width="14" height="9" rx="1.5" />
      <path d="M11 11.5a2 2 0 1 1 3 0" />
      <path d="M12.5 12v4.2l-1.2-.9-1 2-1.5-.7 1-2-1.4-.2Z" />
    </>
  ),
  // two puzzle pieces / plug (API)
  "ipt-1": (
    <>
      <path d="M5 8h3.5a1.3 1.3 0 0 0 2.5 0H14v3.5a1.3 1.3 0 0 1 0 2.5V17H5Z" />
      <path d="M14 9.5h3a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-3" />
    </>
  ),
  // balanced scale
  "ethics": (
    <>
      <path d="M12 5v13M7 18h10" />
      <path d="M5 8h14M5 8 3 13h4ZM19 8l-2 5h4Z" />
      <path d="M3 13a2 2 0 0 0 4 0M17 13a2 2 0 0 0 4 0" />
    </>
  ),
  // open book + quill
  "rizal": (
    <>
      <path d="M11 9C9.8 8.2 8 7.8 6 7.8V17c2 0 3.8.4 5 1.2V9Z" />
      <path d="M11 9v9.2" />
      <path d="M18.5 6.5c-3 1-5 3.5-5.5 6.5l1.2-.3 3.8-5.5Z" />
      <path d="M13.8 12.4 12.8 15" />
    </>
  ),
  // play + image + sound-wave layers
  "multimedia": (
    <>
      <rect x="4" y="6" width="10" height="8" rx="1.5" />
      <path d="M7.5 8.8v3.4l3-1.7Z" />
      <path d="M17 9v6M19.5 7.5v9M14.5 11v2" />
    </>
  ),
  // connected modular blocks
  "sys-integration": (
    <>
      <rect x="4" y="6" width="5" height="5" rx="1" />
      <rect x="15" y="6" width="5" height="5" rx="1" />
      <rect x="9.5" y="14" width="5" height="5" rx="1" />
      <path d="M9 8.5h6M6.5 11v1.5a2 2 0 0 0 2 2h1M17.5 11v1.5a2 2 0 0 1-2 2h-1" />
    </>
  ),
  // magnifying glass over document
  "research": (
    <>
      <path d="M6 5h7l3 3v4" />
      <path d="M13 5v3h3" />
      <circle cx="13" cy="15" r="3" />
      <path d="M15.2 17.2 18 20" />
    </>
  ),
  // browser window with </>
  "web-dev": (
    <>
      <rect x="4" y="5" width="16" height="13" rx="1.5" />
      <path d="M4 9h16" />
      <path d="M6.5 6.8h.01M8.5 6.8h.01" />
      <path d="M10.5 12 9 13.8l1.5 1.8M13.5 12 15 13.8l-1.5 1.8" />
    </>
  ),
  // database cylinder + key
  "database-admin": (
    <>
      <ellipse cx="10" cy="7" rx="5" ry="2" />
      <path d="M5 7v9c0 1.1 2.2 2 5 2 .5 0 1 0 1.5-.1" />
      <path d="M5 11.5c0 1.1 2.2 2 5 2" />
      <circle cx="16.5" cy="15.5" r="2" />
      <path d="M18 16.8 20 19M19 18l-1 1" />
    </>
  ),
  // phone app tile + spark
  "app-dev-emerging": (
    <>
      <rect x="6" y="4" width="10" height="16" rx="2" />
      <path d="M9 17h4" />
      <path d="M18 5.5v3M16.5 7h3M17.5 10.5v1.5M16.8 11.2h1.4" />
    </>
  ),
  // lightbulb + rising graph
  "technopreneurship": (
    <>
      <path d="M9 15a5 5 0 1 1 6 0c-.6.5-.9 1-.9 1.7H9.9c0-.7-.3-1.2-.9-1.7Z" />
      <path d="M10 19h4M10.5 20.5h3" />
      <path d="M10 12.5 12 10.5l1.5 1.5 1.8-2.2" />
      <path d="M15.3 9.8h-1.3M15.3 9.8v1.3" />
    </>
  ),
  // flowchart boxes
  "sad": (
    <>
      <rect x="8.5" y="4" width="7" height="4" rx="1" />
      <rect x="4" y="15" width="6" height="4" rx="1" />
      <rect x="14" y="15" width="6" height="4" rx="1" />
      <path d="M12 8v4M12 12H7v3M12 12h5v3" />
    </>
  ),
  // shield
  "ias-1": (
    <>
      <path d="M12 4l6 2.2v5.3c0 3.6-2.5 6.4-6 7.7-3.5-1.3-6-4.1-6-7.7V6.2Z" />
    </>
  ),
  // server + wrench
  "sys-admin": (
    <>
      <rect x="4" y="5" width="12" height="4" rx="1" />
      <rect x="4" y="11" width="12" height="4" rx="1" />
      <path d="M6.5 7h.01M6.5 13h.01" />
      <path d="M18.5 12.5a2 2 0 0 0-2.6 2.6l-2.4 2.4 1.4 1.4 2.4-2.4a2 2 0 0 0 2.6-2.6l-1 1-1-1Z" />
    </>
  ),
  // layered shield + check
  "ias-2": (
    <>
      <path d="M12 4l6 2.2v5.3c0 3.6-2.5 6.4-6 7.7-3.5-1.3-6-4.1-6-7.7V6.2Z" />
      <path d="M9.2 12l1.9 1.9 3.7-3.7" />
    </>
  ),
  // connected people + document
  "social-prof-issues": (
    <>
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="2" />
      <path d="M4.5 17c0-2.2 1.6-3.8 3.5-3.8s3.5 1.6 3.5 3.8" />
      <path d="M12.5 17c0-2.2 1.6-3.8 3.5-3.8s3.5 1.6 3.5 3.8" />
    </>
  ),
};

export function iconForTitle(title: string): ReactNode {
  const slug = resolveSubjectSlug(title);
  return (slug && SUBJECT_ICONS[slug]) || BOOK_FALLBACK;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/subjectIcons.test.tsx`
Expected: PASS (all 6 tests). If "every glyph is used" fails, a slug in `SUBJECT_ICONS` is misspelled vs `SUBJECT_SLUGS` — fix the typo.

- [ ] **Step 5: Commit**

```bash
git add lib/subjectIcons.tsx lib/subjectIcons.test.tsx
git commit -m "feat: add subject icon library (title->slug map + inline SVG registry)"
```

---

### Task 2: `SubjectIcon` component

**Files:**
- Create: `components/dashboard/SubjectIcon.tsx`
- Test: `components/dashboard/SubjectIcon.test.tsx`

**Interfaces:**
- Consumes: `iconForTitle`, `resolveSubjectSlug` from `@/lib/subjectIcons`.
- Produces: `SubjectIcon` — `function SubjectIcon({ title, className }: { title: string; className?: string }): JSX.Element`. Renders the peach tile wrapping an `<svg>` whose children are the resolved glyph fragment.

- [ ] **Step 1: Write the failing test**

Create `components/dashboard/SubjectIcon.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SubjectIcon } from "./SubjectIcon";

describe("SubjectIcon", () => {
  it("renders an svg for a known subject", () => {
    const { container } = render(<SubjectIcon title="Computer Programming 1" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders (fallback svg) for an unknown subject without crashing", () => {
    const { container } = render(<SubjectIcon title="Totally Made Up Subject" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("applies a custom className to the tile", () => {
    const { container } = render(<SubjectIcon title="Ethics" className="w-9 h-9" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile.className).toContain("w-9");
  });

  it("is decorative (aria-hidden)", () => {
    const { container } = render(<SubjectIcon title="Ethics" />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile.getAttribute("aria-hidden")).toBe("true");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/dashboard/SubjectIcon.test.tsx`
Expected: FAIL — cannot resolve `./SubjectIcon`.

- [ ] **Step 3: Write the implementation**

Create `components/dashboard/SubjectIcon.tsx`:

```tsx
import { iconForTitle, resolveSubjectSlug } from "@/lib/subjectIcons";

const warned = new Set<string>();

export function SubjectIcon({ title, className }: { title: string; className?: string }) {
  if (process.env.NODE_ENV !== "production" && resolveSubjectSlug(title) === null && !warned.has(title)) {
    warned.add(title);
    // eslint-disable-next-line no-console
    console.warn(`[SubjectIcon] no icon mapped for subject title: "${title}" (using book fallback)`);
  }

  return (
    <span
      aria-hidden="true"
      className={
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent " +
        (className ?? "w-10 h-10")
      }
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconForTitle(title)}
      </svg>
    </span>
  );
}
```

Note: when a custom `className` sets the tile size (e.g. `w-9 h-9`), the inner svg stays `w-5 h-5`; that is intentional and fine for the sizes used here.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/dashboard/SubjectIcon.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/SubjectIcon.tsx components/dashboard/SubjectIcon.test.tsx
git commit -m "feat: add SubjectIcon peach-tile component with book fallback"
```

---

### Task 3: Redesign `SemesterSections` into the 2-column icon grid

**Files:**
- Modify: `components/dashboard/SemesterSections.tsx`

**Interfaces:**
- Consumes: `SubjectIcon` from `./SubjectIcon`; existing `subjectStatus`, `pct`, `StatusChip`, `ChevronRight`, `LockIcon`, modal state.
- Produces: no new exports (same `SemesterSections` signature).

- [ ] **Step 1: Replace the subject `<ul>` list with a 2-column card grid**

In `components/dashboard/SemesterSections.tsx`, add the import at the top with the other component imports:

```tsx
import { SubjectIcon } from "./SubjectIcon";
```

Replace the entire `<ul className="mt-2 divide-y ...">…</ul>` block inside `TermSection` (the block that maps `term.subjects`) with this grid:

```tsx
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {term.subjects.map((s) => {
          const progress = pct(s.doneCount, s.totalCount);

          if (s.unlocked) {
            const status = subjectStatus(s);
            const inProgress = status === "in-progress";
            return (
              <li key={s.id}>
                <Link
                  href={`/year/${term.yearId}/subjects/${s.id}/modules`}
                  className={
                    "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent " +
                    (inProgress
                      ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                      : "border-taupe/30 bg-paper hover:bg-taupe/5")
                  }
                >
                  <SubjectIcon title={s.title} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{s.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[7rem] overflow-hidden rounded-full bg-taupe/20">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="shrink-0 text-xs text-ink-muted">
                        {s.doneCount}/{s.totalCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusChip status={status} />
                    <ChevronRight />
                  </div>
                </Link>
              </li>
            );
          }

          return (
            <li key={s.id}>
              <div className="flex items-center gap-3 rounded-xl border border-taupe/30 bg-paper px-3 py-3">
                <SubjectIcon title={s.title} className="w-10 h-10 opacity-50" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <LockIcon />
                    <p className="truncate text-sm font-medium text-ink-muted">
                      {s.title}
                      <span className="sr-only">Locked</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenModal({ kind: "subject", subject: s })}
                  className="shrink-0 text-xs underline text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Unlock
                </button>
              </div>
            </li>
          );
        })}
      </ul>
```

Leave the `TermSection` `<summary>` header, the `SemesterSections` wrapper, and both modals untouched.

- [ ] **Step 2: Typecheck + full test run**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all tests pass (including Tasks 1–2).

- [ ] **Step 3: Visual check in the running app**

Run the dev server (`npm run dev`) and open the dashboard. Verify: each subject shows its icon tile in a 2-column grid; in-progress subjects (e.g. Computer Programming 1, Introduction to Computing for the seeded user) have the accent-tinted card; locked subjects show a muted icon + Unlock. Confirm light and dark mode both read correctly (toggle in the header).

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/SemesterSections.tsx
git commit -m "feat: redesign semester sections into 2-column subject icon grid"
```

---

### Task 4: Icons in the "This Week" panel

**Files:**
- Modify: `components/dashboard/ThisWeekPanel.tsx`

**Interfaces:**
- Consumes: `SubjectIcon`; existing `Recommendation.subjectTitle`.
- Produces: no new exports.

- [ ] **Step 1: Add the icon tile to each recommendation row**

In `components/dashboard/ThisWeekPanel.tsx`, add the import:

```tsx
import { SubjectIcon } from "./SubjectIcon";
```

Replace the `<Link>` body inside the recommendations `.map(...)` (the block containing the `min-w-0` div and `StatusChip`) with:

```tsx
              <Link
                href={continueHref(rec)}
                className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-taupe/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <SubjectIcon title={rec.subjectTitle} className="w-9 h-9" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{rec.moduleTitle}</p>
                    <p className="text-xs text-ink-muted truncate">{rec.subjectTitle}</p>
                  </div>
                </div>
                <StatusChip status={rec.status} />
              </Link>
```

- [ ] **Step 2: Typecheck + test**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all tests pass.

- [ ] **Step 3: Visual check**

On the dashboard, confirm each "Recommended for you" row now has the subject's icon tile to the left of the module title.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/ThisWeekPanel.tsx
git commit -m "feat: add subject icons to This Week recommendations"
```

---

### Task 5: Icons on the Subjects page

**Files:**
- Modify: `components/SubjectAccordion.tsx`

**Interfaces:**
- Consumes: `SubjectIcon`; existing `subject.title`.
- Produces: no new exports.

Context: the Subjects page (`app/(main)/year/[yearId]/subjects/page.tsx`) renders one `<SubjectAccordion>` per subject. Its header currently shows a two-digit index number in a `w-8` column, then the serif title. We keep the index and add the icon tile between the number and the title so it fits the editorial layout without clashing.

- [ ] **Step 1: Add the icon tile to the accordion header**

In `components/SubjectAccordion.tsx`, add the import near the other imports:

```tsx
import { SubjectIcon } from "@/components/dashboard/SubjectIcon";
```

The component's root is:

```tsx
<div className="flex items-start gap-6 py-8 -mx-4 px-4">
  <span className="font-mono text-label-sm ... w-8 shrink-0 text-right">
    {String(index + 1).padStart(2, "0")}
  </span>
  <div className="flex-1">
```

Insert the icon tile immediately after the numbered `<span>` and before `<div className="flex-1">`:

```tsx
        <SubjectIcon title={subject.title} className="w-9 h-9 mt-0.5" />
```

Result: number · icon tile · title column.

- [ ] **Step 2: Typecheck + test**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all tests pass.

- [ ] **Step 3: Visual check**

Open `/year/<yearId>/subjects` for a non-coming-soon year (e.g. 1st Year). Confirm each subject row shows its icon tile beside the number and serif title, and unknown/edge titles fall back to the book glyph without layout breakage.

- [ ] **Step 4: Commit**

```bash
git add components/SubjectAccordion.tsx
git commit -m "feat: add subject icons to the Subjects page rows"
```

---

### Task 6: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite + typecheck + lint**

Run: `npx tsc --noEmit && npx vitest run && npm run lint`
Expected: all green. If lint flags the `console.warn`, confirm the inline `eslint-disable-next-line no-console` is present in `SubjectIcon.tsx`.

- [ ] **Step 2: Cross-check unmatched titles**

With the dev server running, load the dashboard and the Subjects page for all four years while watching the browser console. Expected: **no** `[SubjectIcon] no icon mapped` warnings (all 36 DB titles are mapped). If any appear, add the missing exact title → slug to `SUBJECT_SLUGS` and, if needed, a glyph to `SUBJECT_ICONS`, then re-run Task 1's test.

- [ ] **Step 3: Confirm the plan is complete**

Verify against the spec: icon library ✓, SubjectIcon component ✓, 2-column grid with in-progress highlight ✓, This Week icons ✓, Subjects page icons ✓, tests ✓. No raster assets shipped.
