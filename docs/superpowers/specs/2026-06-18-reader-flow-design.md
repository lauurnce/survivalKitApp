# Reader Flow — Churn Reduction (Spec A)

**Date:** 2026-06-18
**Status:** Approved

## Problem

Users open the first module of the first subject and leave. The app has no forward momentum after a module ends, and the subjects page gives no preview of what's inside a subject before a user commits to clicking in.

## Goal

Two targeted interventions that keep users moving through content:
1. A "Up next" footer at the bottom of every module page that links to the next module.
2. An expandable module list on the subjects page so users can see what's inside a subject before clicking in.

---

## Feature 1: Next-Module CTA

### Where
`app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`

### Data
The server component fetches all modules for the subject (already knows `subjectId`) sorted by `sort_order`. It finds the module immediately after the current `moduleId` by array index.

### Rendering
- **Next module exists** → render a full-width footer card below the article:
  - Label: `"Up next"`
  - Title: next module's title
  - Arrow: `"→"`
  - Links to: `/year/${yearId}/subjects/${subjectId}/modules/${nextModule.id}`
- **Last module in subject** → render a "You've finished this subject" card:
  - Links back to: `/year/${yearId}/subjects/${subjectId}/modules`
  - Label: `"← Back to [subject title]"`

### Implementation notes
- Pure server component — no `useState`, no client JS.
- The additional module query is a single `.select("id, title, sort_order").eq("subject_id", subjectId).order("sort_order")` added to the existing `Promise.all`.
- Styled using existing Tailwind tokens (navy background, paper text, accent arrow) to match the page's design language.

---

## Feature 2: Expandable Module List on Subjects Page

### Where
`app/year/[yearId]/subjects/page.tsx` + new `components/SubjectAccordion.tsx`

### Data
The subjects page server component extends its existing `Promise.all` with one additional query: all modules for the year, selected by `subject_id IN (subject ids)` and ordered by `sort_order`. Modules are grouped by `subject_id` in a `Map<string, { id: string; title: string; sort_order: number }[]>` server-side.

### Component split
- `app/year/[yearId]/subjects/page.tsx` — stays a server component. Builds a `modulesBySubject` map and passes it alongside the existing subject data to `SubjectAccordion`.
- `components/SubjectAccordion.tsx` — new client component (`"use client"`). Receives one subject row's data plus its modules array. Renders:
  - The existing subject row (title, kind badge, read count, progress bar, `→` arrow) — unchanged visually.
  - A `"Show modules ▾"` / `"Hide modules ▴"` toggle button below the subject title.
  - An inline expanded list: numbered module titles, each a `<Link>` to the module reader page. Styled to match the modules page list (font-mono index, font-serif title, hover accent).
  - Toggle uses `useState<boolean>(false)` — no routing, no URL changes.

### What stays the same
Semester grouping, `SubjectProgressBar`, read counts, and the `BackLink` nav are all unchanged. Only the subject row itself is extracted into `SubjectAccordion`.

---

## Commit Plan

| # | Commit | Files |
|---|--------|-------|
| 1 | `feat(ui): add next-module CTA to bottom of module reader page` | `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` |
| 2 | `feat(ui): add SubjectAccordion component with expandable module list` | `components/SubjectAccordion.tsx` (new) |
| 3 | `feat(ui): wire SubjectAccordion into subjects page` | `app/year/[yearId]/subjects/page.tsx` |
| 4 | `feat(ui): add aria-expanded and keyboard accessibility to SubjectAccordion` | `components/SubjectAccordion.tsx` |

---

## Out of Scope

- Spec B (continue where you left off, popular/most-read) is a separate spec.
- No animation on the accordion expand/collapse (can be added later).
- No persistence of accordion open/closed state across page loads.
- No changes to the module page header or existing navigation.
