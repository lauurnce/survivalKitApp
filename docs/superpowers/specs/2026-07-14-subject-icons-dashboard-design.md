# Subject Icons on the Dashboard — Design

**Date:** 2026-07-14
**Status:** Approved (brainstorming)

## Goal

Give every subject a distinctive icon on the dashboard, matching the reference
mockup where each subject sits in a rounded peach tile with a thin-line,
accent-colored glyph. Bring the semester listing up to the reference's
2-column icon-tile grid, and reuse the same icon in the "This Week" panel and
the Subjects page.

The user generated a set of icon reference images (grey thin-line monochrome
glyphs) under `assets/subject icons/`. A guide file
(`batch list of subjects.txt`, note the trailing space in the filename) maps
each glyph to a subject and describes its motif. These raster images are the
**visual reference only** — we redraw each as a single-color inline SVG so the
icons are crisp at any size, tint with the theme's `accent` color, and add no
bundle weight.

## Non-goals

- Shipping the raster PNGs to the client. `assets/` is not bundled; the PNGs
  stay as design reference.
- Icons in the subject detail (modules) page header. Deferred.
- Any change to subscription/unlock logic, data model, or DB schema.

## Source of truth: title → slug mapping

Subject titles were pulled from the live DB (project `mpdymglipgzuybtxuvhy`,
`subjects` table). All 36 subjects map cleanly to a slug in the guide — zero
orphans. The canonical DB titles and slugs:

| DB title | slug |
| --- | --- |
| Computer Programming 1 | comp-prog-1 |
| Introduction to Computing | intro-computing |
| Mathematics in the Modern World | math-modern-world |
| Accounting Principles | accounting |
| Purposive Communication | purposive-comm |
| Filipinolohiya | filipinolohiya |
| Understanding the Self | understanding-self |
| Computer Programming 2 | comp-prog-2 |
| Discrete Structures 1 | discrete-structures |
| Reading in Philippine History | ph-history |
| Science, Technology and Society | sts |
| The Contemporary World | contemporary-world |
| Data Communications and Networking | data-comm-network |
| Data Structures and Algorithms | dsa |
| Structured Programming (COBOL) | cobol |
| Operating Systems | operating-systems |
| World Literature | world-lit |
| Object-Oriented Programming with Java | oop-java |
| Network Administration | network-admin |
| Information Management | info-management |
| Human Computer Interaction | hci |
| Integrative Programming and Technologies 1 | ipt-1 |
| Ethics | ethics |
| The Life and Works of Rizal | rizal |
| Multimedia | multimedia |
| Systems Integration and Architecture | sys-integration |
| Fundamentals of Research | research |
| Web Development | web-dev |
| Database Administration | database-admin |
| Applications Development and Emerging Technologies | app-dev-emerging |
| Technopreneurship | technopreneurship |
| Systems Analysis and Design | sad |
| Information Assurance and Security 1 | ias-1 |
| Systems Administration and Maintenance | sys-admin |
| Information Assurance and Security 2 | ias-2 |
| Social and Professional Issues in IT | social-prof-issues |

Note: the batch guide also lists `The Contemporary World` under a "globe with
connecting lines" motif and `Contemporary World` is present in the DB, so it is
included. Titles are matched **case-insensitively with trimmed whitespace** to
be resilient to minor drift, but the map keys are the exact DB titles.

## Components

### `lib/subjectIcons.tsx`

- `SUBJECT_SLUGS: Record<string, string>` — exact DB title → slug (table above).
- `resolveSubjectSlug(title: string): string | null` — normalizes
  (`trim().toLowerCase()`) and looks up; returns `null` if unmatched.
- `SUBJECT_ICONS: Record<string, ReactNode>` — slug → inline SVG glyph. Each
  glyph is a `<g>`/`<path>` set drawn in a `0 0 24 24` viewBox,
  `fill="none" stroke="currentColor"` `strokeWidth≈1.6`,
  `strokeLinecap/Linejoin="round"`, redrawn to match the reference artwork:
  - comp-prog-1 `</>`, comp-prog-2 `{ }`, intro-computing monitor,
    math-modern-world π + shapes, accounting ledger+coins, purposive-comm two
    speech bubbles, filipinolohiya sun-with-rays, understanding-self head+heart,
    discrete-structures 3 linked nodes, ph-history rolled scroll, sts atom+gear,
    contemporary-world globe+lines, data-comm-network linked nodes, dsa node
    tree, cobol punch card, operating-systems stacked layers+cog, world-lit
    open book+globe, oop-java coffee cup+blocks, network-admin server+gear,
    info-management database cylinder, hci hand-on-screen, ipt-1 two puzzle
    pieces, ethics balanced scale, rizal book+quill, multimedia play/image/wave
    layers, sys-integration modular blocks, research magnifier over doc, web-dev
    browser with `</>`, database-admin cylinder+key, app-dev-emerging phone
    tile+spark, technopreneurship bulb+rising graph, sad flowchart boxes, ias-1
    shield, sys-admin server+wrench, ias-2 layered shield+check,
    social-prof-issues connected people.
- `BOOK_FALLBACK` — a generic open-book glyph for unmatched titles.

### `components/dashboard/SubjectIcon.tsx`

```
<SubjectIcon title={string} className?={string} />
```

- Resolves `title` → slug → glyph; falls back to `BOOK_FALLBACK`.
- In dev (`process.env.NODE_ENV !== "production"`), `console.warn` once per
  unmatched title so drift is visible.
- Renders the glyph inside the rounded peach tile:
  `inline-flex items-center justify-center rounded-lg bg-accent/10 text-accent`,
  default size `w-10 h-10` with a `w-5 h-5` svg, overridable via `className`.
- `aria-hidden` (decorative — the title text is always adjacent).

## Redesign: `SemesterSections.tsx`

Replace the single-column `<ul>` list with the reference's responsive
**2-column grid** (`grid gap-3 sm:grid-cols-2`). Each subject is a card:

- **Unlocked:** `<Link>` card → subject modules. Layout: `SubjectIcon` tile
  (left) · column with `title`, then a row of `{done}/{total} modules`,
  progress bar, and `%` · right side `StatusChip` + chevron. Reuses existing
  `subjectStatus`, `pct`, `StatusChip`, `ChevronRight`.
  - **In-progress highlight:** when `subjectStatus(s) === "in-progress"`, the
    whole card gets an accent-tinted background + border
    (`bg-accent/5 border-accent/30`) to match the reference, instead of the
    default transparent/hover treatment. Ready/Done cards stay neutral
    (`border-taupe/30` with hover tint).
- **Locked:** same card shape, muted; `SubjectIcon` tile still shown (muted via
  wrapper opacity), `LockIcon` + title, and an "Unlock" button that opens the
  existing `SubjectSubscribeModal`.

Term header (chevron, "Nth Year · Nth Semester", module count, "Locked" +
"Unlock year") and the `<details>`/`open` behavior are preserved. Modal state
handling is unchanged.

## Wire: `ThisWeekPanel.tsx`

Add a `SubjectIcon` tile (size `w-9 h-9`) left of each recommendation's text
block, using `rec.subjectTitle`. Keeps the existing `StatusChip` on the right.

## Wire: Subjects page

`app/(main)/year/[yearId]/subjects/page.tsx` — add a `SubjectIcon` tile per
subject row for consistency with the dashboard. Match the page's existing row
layout; no behavioral change.

## Testing

`components/dashboard/SubjectIcon.test.tsx`:

- Every canonical DB title (all 36, hard-coded list mirroring the DB) resolves
  via `resolveSubjectSlug` to a non-null slug, and that slug exists in
  `SUBJECT_ICONS`.
- An unknown title (`"Totally Made Up Subject"`) resolves to `null` and the
  component renders the book fallback (no crash).
- Case/whitespace resilience: `"  computer programming 1 "` resolves to
  `comp-prog-1`.

## Risks / notes

- **Title drift:** if a DB title is later renamed, the icon silently falls back
  to the book glyph and the dev warning fires. The test guards the current 36.
- **Grid on narrow screens:** single column below the `sm` breakpoint, matching
  the existing mobile-first layout.
- **Filename gotcha:** the guide file has a trailing space in its name; it is
  reference-only and not read at runtime.
