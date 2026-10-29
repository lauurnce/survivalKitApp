# Responsive Desktop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center all page content in a `max-w-wide` (88ch) column on desktop while background bands run edge to edge; mobile stays pixel-identical.

**Architecture:** Pure Tailwind class changes. Pattern everywhere: background color + horizontal padding stay on the full-width outer element; content moves into (or gains) an inner `max-w-wide mx-auto` wrapper. No component logic, config, or breakpoint changes.

**Tech Stack:** Next.js App Router, Tailwind CSS (custom `max-w-wide` = 88ch already in `tailwind.config.ts`).

## Global Constraints

- No color, font, or spacing-scale changes.
- Mobile (< 88ch viewports) must render exactly as today — only centering behavior on wide screens changes.
- No new breakpoints, no Tailwind config changes, no component-internal logic changes.
- Spec: `docs/superpowers/specs/2026-07-05-responsive-desktop-layout-design.md`.
- Commits: conventional style, no Co-Authored-By trailer (user is sole author).

---

### Task 1: Lesson reader page — full-bleed navy bands, centered column

**Files:**
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx:110-188`

**Interfaces:** none (JSX class changes only).

- [ ] **Step 1: Restructure the four page bands**

Top nav (line ~111): wrap the BackLink in a centered inner div:

```tsx
      {/* Top nav — dark navy */}
      <div className="bg-navy px-6 py-8 md:px-16 border-b border-paper/10">
        <div className="max-w-wide mx-auto">
          <BackLink
            href={`/year/${yearId}/subjects/${subjectId}/modules`}
            label={subject.title}
            className="text-taupe hover:text-paper"
          />
        </div>
      </div>
```

Module header (line ~120): remove `max-w-wide` from the `<header>` (this is what chops the navy band) and add an inner wrapper:

```tsx
      {/* Module header — dark navy */}
      <header className="bg-navy px-6 pt-10 pb-12 md:px-16 border-b border-paper/10">
        <div className="max-w-wide mx-auto">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            § 0{year?.sort_order ?? "?"} — {subject.title}
          </p>
          <h1 className="font-serif text-display-md text-paper">{mod.title}</h1>
        </div>
      </header>
```

Article (line ~128): move `max-w-wide space-y-16` onto an inner wrapper (keep all existing children — PaywallTeaser conditional and the `allSections.map` — unchanged inside it):

```tsx
      {/* Article content — cream */}
      <article className="px-6 py-12 md:px-16">
        <div className="max-w-wide mx-auto space-y-16">
          {/* ...existing PaywallTeaser conditional and SectionRenderer map, unchanged... */}
        </div>
      </article>
```

Next-module CTA (line ~158): same treatment (keep the existing nextModule ternary unchanged inside):

```tsx
      {/* Next-module CTA */}
      <div className="border-t border-ink-faint/20 px-6 py-12 md:px-16">
        <div className="max-w-wide mx-auto">
          {/* ...existing nextModule ? (...) : (...) block, unchanged... */}
        </div>
      </div>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — Expected: no new errors (pre-existing errors, if any, are unrelated).

- [ ] **Step 3: Commit**

```bash
git add "app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "fix(reader): center lesson column, run navy bands full width on desktop"
```

---

### Task 2: List pages — year, subjects, modules, search

**Files:**
- Modify: `app/(main)/year/page.tsx:39-63`
- Modify: `app/(main)/year/[yearId]/subjects/page.tsx:67-108`
- Modify: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx:44-102`
- Modify: `app/(main)/search/page.tsx:54-67`

**Interfaces:** none. Components rendered inside (`YearGrid`, `SubjectAccordion`, `SearchClient`) are NOT modified — pages wrap them instead.

- [ ] **Step 1: Year page** — wrap both the navy-header content and the cream body content:

```tsx
      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          {/* ...existing BackLink/Search row and .mt-10 block, unchanged... */}
        </div>
      </div>

      {/* Year cards — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <YearGrid cards={cards} />
        </div>
      </div>
```

- [ ] **Step 2: Subjects page** — same header wrapper; body already has a `max-w-wide` div, add `mx-auto`:

```tsx
      {/* Page header — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          {/* ...existing BackLink and .mt-10 block, unchanged... */}
        </div>
      </div>
```

and change line 79:

```tsx
        <div className="flex flex-col gap-12 max-w-wide mx-auto">
```

- [ ] **Step 3: Modules page** — same header wrapper around the BackLink + `.mt-10` block; then add `mx-auto` to both body containers (lines 60 and 71):

```tsx
        <div className="max-w-wide mx-auto">
```

```tsx
        <div className="flex flex-col divide-y divide-ink-faint/30 max-w-wide mx-auto">
```

- [ ] **Step 4: Search page** — same header wrapper; wrap the body:

```tsx
      {/* Search body — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <SearchClient items={items} />
        </div>
      </div>
```

(`SearchClient`'s own root `max-w-wide` becomes a harmless no-op inside the wrapper; leave it.)

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(main)/year/page.tsx" "app/(main)/year/[yearId]/subjects/page.tsx" "app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx" "app/(main)/search/page.tsx"
git commit -m "fix(nav-pages): center year/subject/module/search columns on desktop"
```

---

### Task 3: Home page, error page, loading skeleton, root footer

**Files:**
- Modify: `app/(main)/page.tsx:68-119`
- Modify: `app/error.tsx:18-63`
- Modify: `app/loading.tsx:3-35`
- Modify: `app/layout.tsx:48-57`

**Interfaces:** none.

- [ ] **Step 1: Home page** — `<main>` keeps bg + padding + flex; all children move into a centered wrapper that takes over the column layout (`flex-1` keeps the footer's `mt-auto` working):

```tsx
    <main className="min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col gap-16">
        {/* ...existing header label, hero, ContinueReading, PopularModules, footer divs — unchanged... */}
      </div>
    </main>
```

Note: `gap-16` moves from `<main>` to the wrapper. `PageTracker` renders nothing; it can stay outside the wrapper.

- [ ] **Step 2: Error page** — same pattern; `justify-between` moves to the wrapper:

```tsx
    <main className="min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col justify-between">
        {/* ...existing header, content (keep its max-w-wide class or drop it — no-op), footer divs — unchanged... */}
      </div>
    </main>
```

- [ ] **Step 3: Loading skeleton** — same pattern; keep the absolute spinner overlay as a direct child of `<main>` (it positions against the full screen):

```tsx
    <main className="relative min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col gap-16">
        {/* ...existing header, content, footer skeleton divs — unchanged... */}
      </div>
      {/* ...existing spinner overlay div, unchanged, outside the wrapper... */}
    </main>
```

- [ ] **Step 4: Root layout footer** — center the inner row:

```tsx
        <footer className="border-t border-ink-faint/20 px-6 py-4 md:px-16">
          <div className="max-w-wide mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* ...existing p + a, unchanged... */}
          </div>
        </footer>
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(main)/page.tsx" app/error.tsx app/loading.tsx app/layout.tsx
git commit -m "fix(shell): center home, error, loading, and footer columns on desktop"
```

---

### Task 4: Playground, admin dashboard, account page

**Files:**
- Modify: `app/(main)/playground/page.tsx:12-28`
- Modify: `components/AdminDashboard.tsx` (all `max-w-wide` occurrences: lines ~351, 393, 490, 560, 687, 796, 808, 816)
- Modify: `app/account/page.tsx:58-65`

**Interfaces:** none.

- [ ] **Step 1: Playground** — remove `max-w-wide` from `<main>`, add inner wrapper:

```tsx
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16">
      <div className="max-w-wide mx-auto">
        {/* ...existing h1, language buttons, <Playground /> — unchanged... */}
      </div>
    </main>
```

- [ ] **Step 2: Admin dashboard** — every `max-w-wide` block sits directly under the padded full-width `<main>` (line 746), so centering each block is safe. Replace ALL occurrences of the class string `max-w-wide` with `max-w-wide mx-auto` in `components/AdminDashboard.tsx` (Edit with replace_all).

- [ ] **Step 3: Account page** — cap the right-pane module list width (left-aligned next to the sidebar; per spec, no centering here):

```tsx
            <div className="space-y-10 max-w-wide">
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(main)/playground/page.tsx" components/AdminDashboard.tsx app/account/page.tsx
git commit -m "fix(tools): center playground and admin columns; cap account list width"
```

---

### Task 5: Visual verification (phone + laptop widths)

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background). Expected: ready on http://localhost:3000.

- [ ] **Step 2: Laptop-width checks (~1440px window)**

In the browser, verify:
1. A lesson reader page (e.g. the CP1 Arrays lesson from the screenshot): navy top bar and header band run edge to edge; label + title + article text share one centered column.
2. Home `/`: hero and footer strip centered.
3. `/year`, a subjects page, a modules list, `/search`: headers and lists centered, navy bands full width.
4. `/playground` and `/admin`: centered.
5. `/account`: two-pane layout intact; module rows no wider than 88ch.

- [ ] **Step 3: Phone-width checks (~390px)**

Same pages: layout must look exactly as before this change (padding `px-6`, no horizontal scrollbar, nothing newly centered/shifted).

- [ ] **Step 4: Fix anything off, amend the relevant commit or add a fixup commit**

Expected end state: all checks pass, working tree clean.
