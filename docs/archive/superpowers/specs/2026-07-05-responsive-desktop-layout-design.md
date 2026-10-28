# Responsive Desktop Layout — Centered Editorial

**Date:** 2026-07-05
**Status:** Approved

## Problem

The app was designed phone-first. Content blocks are capped at `max-w-wide`
(88ch) but almost never centered with `mx-auto`, so on desktop/laptop screens
everything pins to the left edge and a large dead strip remains on the right.

Worst case is the lesson reader: `max-w-wide` sits directly on the navy
`<header>` element, so the dark background band itself is chopped at ~950px
mid-screen. Mobile is unaffected because phone viewports are narrower than
88ch.

## Decision

Adopt a **centered editorial layout** (chosen over a two-zone sidebar layout
and a full-width stretch):

- Background colors (navy bands, cream body) live on full-width outer
  elements.
- Content inside is wrapped in a `max-w-wide mx-auto` container so it centers
  on wide screens.
- Existing `px-6 md:px-16` padding stays on the outer element, so mobile
  renders exactly as it does today.

## Scope — pages/components to change

| Surface | Change |
|---|---|
| Lesson reader (`app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`) | Move `max-w-wide` off the navy header/article/CTA onto inner centered wrappers; back-link bar gets the same inner wrapper so all rows align in one column |
| Modules list (`.../modules/page.tsx`) | Center navy header content and the module list |
| Subjects list (`.../subjects/page.tsx`) | Center header + subject list |
| Year page (`app/(main)/year/page.tsx`) | Center content column |
| Home page (`app/(main)/page.tsx`) | Hero, ContinueReading, PopularModules, footer strip center into one column |
| Search (`app/(main)/search/page.tsx`) | Center `max-w-wide` container |
| Playground (`app/(main)/playground/page.tsx`) | Move `max-w-wide` off `<main>` onto an inner centered wrapper |
| `app/error.tsx`, `app/loading.tsx` | Center containers (`app/not-found.tsx` already centers — no change) |
| Root layout footer (`app/layout.tsx`) | Center inner footer content to align with the page column |
| Admin dashboard (`components/AdminDashboard.tsx`, `app/admin/page.tsx`) | Center `max-w-wide` blocks |
| Account page (`app/account/page.tsx`) | Keep its two-pane layout (sidebar + content); cap the right-pane module list at `max-w-wide` so rows don't stretch across huge screens |

## Non-goals

- No color, font, or spacing-scale changes.
- No mobile layout changes (must be pixel-identical at phone widths).
- No new breakpoints, sidebars, or Tailwind config changes — `max-w-wide`
  (88ch) remains the reading width.
- No component-internal changes (IDE playground, topology viewer, accordions
  simply live inside the centered column).

## Testing

Run the dev server and verify in the browser at ~390px (phone) and ~1440px
(laptop):

1. Lesson reader: navy bands run edge to edge; text column centered; mobile
   unchanged.
2. Home page and modules list: single centered column on desktop.
3. Spot-check search, playground, account, admin.
