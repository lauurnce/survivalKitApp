# Discovery & Re-engagement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Continue reading" (localStorage last-visited) and "Popular right now" (top 5 modules by read count) sections to the home page to reduce churn for returning users.

**Architecture:** `LastModuleTracker` (client, invisible) writes to localStorage on every module visit. `ContinueReading` (client) reads localStorage and renders a resume card. `PopularModules` (server component) receives pre-fetched data from an async home page server component. First-time visitors see neither section.

**Tech Stack:** Next.js 14 App Router, React `useState`/`useEffect`, localStorage, Supabase (Postgres), Tailwind CSS, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/LastModuleTracker.tsx` | Invisible client component — writes last-visited module to localStorage |
| Modify | `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` | Render `LastModuleTracker` with current module data |
| Create | `components/ContinueReading.tsx` | Client component — reads localStorage, renders resume card or null |
| Create | `components/PopularModules.tsx` | Server component — renders top modules list or null |
| Modify | `app/page.tsx` | Make async, add Supabase queries, wire both new components, fix layout |

---

## Task 1: LastModuleTracker — write last-visited to localStorage

**Files:**
- Create: `components/LastModuleTracker.tsx`
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`

- [ ] **Step 1: Create `components/LastModuleTracker.tsx`**

```tsx
"use client";

import { useEffect } from "react";

interface Props {
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}

export function LastModuleTracker({
  moduleId,
  subjectId,
  yearId,
  moduleTitle,
  subjectTitle,
}: Props) {
  useEffect(() => {
    try {
      localStorage.setItem(
        "bsit_last_module",
        JSON.stringify({ moduleId, subjectId, yearId, moduleTitle, subjectTitle })
      );
    } catch {
      // localStorage unavailable (private browsing, storage full) — silent fail
    }
  }, [moduleId, subjectId, yearId, moduleTitle, subjectTitle]);

  return null;
}
```

- [ ] **Step 2: Wire `LastModuleTracker` into the module reader page**

Open `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`.

Add the import after the existing imports:
```tsx
import { LastModuleTracker } from "@/components/LastModuleTracker";
```

Add the component inside `<main>`, right after `<PageTracker .../>`:
```tsx
      <LastModuleTracker
        moduleId={moduleId}
        subjectId={subjectId}
        yearId={yearId}
        moduleTitle={mod.title}
        subjectTitle={subject.title}
      />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add components/LastModuleTracker.tsx "app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(ui): add LastModuleTracker to module reader page"
```

---

## Task 2: ContinueReading — resume card on home page

**Files:**
- Create: `components/ContinueReading.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/ContinueReading.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LastModule {
  moduleId: string;
  subjectId: string;
  yearId: string;
  moduleTitle: string;
  subjectTitle: string;
}

export function ContinueReading() {
  const [last, setLast] = useState<LastModule | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bsit_last_module");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastModule;
      if (parsed.moduleId && parsed.subjectId && parsed.yearId) {
        setLast(parsed);
      }
    } catch {
      // corrupted localStorage — ignore
    }
  }, []);

  if (!last) return null;

  return (
    <div className="max-w-wide">
      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-4">
        Continue reading
      </p>
      <Link
        href={`/year/${last.yearId}/subjects/${last.subjectId}/modules/${last.moduleId}`}
        className="group flex items-center justify-between gap-6 border border-ink-faint hover:border-navy hover:bg-navy p-6 transition-colors duration-200"
      >
        <div>
          <h2 className="font-serif text-display-md text-ink group-hover:text-paper transition-colors duration-200 mb-1">
            {last.moduleTitle}
          </h2>
          <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint group-hover:text-taupe transition-colors duration-200">
            {last.subjectTitle}
          </p>
        </div>
        <span className="text-accent text-xl flex-shrink-0">→</span>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Add `ContinueReading` to the home page**

Open `app/page.tsx`. Add the import:
```tsx
import { ContinueReading } from "@/components/ContinueReading";
```

Insert `<ContinueReading />` between the hero `<div>` and the footer `<div>`:
```tsx
      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />
```

The full updated `app/page.tsx` should now be:
```tsx
import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";
import { ContinueReading } from "@/components/ContinueReading";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper flex flex-col justify-between px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />

      {/* Header label */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs,
          organized by year and subject. Start wherever you need to.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ContinueReading.tsx app/page.tsx
git commit -m "feat(ui): add ContinueReading component to home page"
```

---

## Task 3: PopularModules — server-side top modules on home page

**Files:**
- Create: `components/PopularModules.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/PopularModules.tsx`**

```tsx
import Link from "next/link";

export interface PopularModule {
  moduleId: string;
  moduleTitle: string;
  subjectId: string;
  subjectTitle: string;
  yearId: string;
  yearLabel: string;
}

interface Props {
  modules: PopularModule[];
}

export function PopularModules({ modules }: Props) {
  if (modules.length === 0) return null;

  return (
    <div className="max-w-wide">
      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
        Popular right now
      </p>
      <div className="flex flex-col divide-y divide-ink-faint/30">
        {modules.map((m) => (
          <Link
            key={m.moduleId}
            href={`/year/${m.yearId}/subjects/${m.subjectId}/modules/${m.moduleId}`}
            className="group flex items-start justify-between gap-6 py-5 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
          >
            <div>
              <h3 className="font-serif text-xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                {m.moduleTitle}
              </h3>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                {m.yearLabel} · {m.subjectTitle}
              </p>
            </div>
            <span className="font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1 flex-shrink-0">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Make `app/page.tsx` async and add Supabase queries**

Replace the entire `app/page.tsx` with:

```tsx
import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularModules, type PopularModule } from "@/components/PopularModules";
import { createServerClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createServerClient();

  // Fetch top 5 module IDs by read_count
  const { data: topCounters } = await supabase
    .from("counters")
    .select("resource_id, read_count")
    .eq("resource_type", "module")
    .gt("read_count", 0)
    .order("read_count", { ascending: false })
    .limit(5);

  const topModuleIds = (topCounters ?? []).map((c) => c.resource_id);
  let popularModules: PopularModule[] = [];

  if (topModuleIds.length > 0) {
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, subject_id")
      .in("id", topModuleIds);

    const subjectIds = [...new Set((modules ?? []).map((m) => m.subject_id))];
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, title, year_id")
      .in("id", subjectIds.length > 0 ? subjectIds : ["__none__"]);

    const yearIds = [...new Set((subjects ?? []).map((s) => s.year_id))];
    const { data: years } = await supabase
      .from("years")
      .select("id, label")
      .in("id", yearIds.length > 0 ? yearIds : ["__none__"]);

    const moduleMap = new Map((modules ?? []).map((m) => [m.id, m]));
    const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));
    const yearMap = new Map((years ?? []).map((y) => [y.id, y]));

    popularModules = topModuleIds
      .map((id) => {
        const mod = moduleMap.get(id);
        if (!mod) return null;
        const subject = subjectMap.get(mod.subject_id);
        if (!subject) return null;
        const year = yearMap.get(subject.year_id);
        if (!year) return null;
        return {
          moduleId: mod.id,
          moduleTitle: mod.title,
          subjectId: subject.id,
          subjectTitle: subject.title,
          yearId: year.id,
          yearLabel: year.label,
        };
      })
      .filter((m): m is PopularModule => m !== null);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col justify-between px-6 py-12 md:px-16 md:py-20">
      <PageTracker event="enter" />

      {/* Header label */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs,
          organized by year and subject. Start wherever you need to.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />

      {/* Popular modules — hidden when no reads */}
      <PopularModules modules={popularModules} />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: exit 0, no errors.

- [ ] **Step 4: Run tests**

```bash
cd /Users/jadekingabunada/survivalKitApp && npm test
```
Expected: 5 test files, 24 tests, all passing.

- [ ] **Step 5: Commit**

```bash
git add components/PopularModules.tsx app/page.tsx
git commit -m "feat(ui): add PopularModules section to home page"
```

---

## Task 4: Add revalidate and fix home page layout

**Files:**
- Modify: `app/page.tsx`

The current home page uses `flex flex-col justify-between` which distributes space evenly between all children. With 5 children (header, hero, ContinueReading, PopularModules, footer), the spacing is uneven. This task fixes the layout and adds ISR caching.

- [ ] **Step 1: Update `app/page.tsx` — add `revalidate` and fix layout**

Replace the entire file with:

```tsx
import Link from "next/link";
import { PageTracker } from "@/components/PageTracker";
import { ContinueReading } from "@/components/ContinueReading";
import { PopularModules, type PopularModule } from "@/components/PopularModules";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function LandingPage() {
  const supabase = createServerClient();

  const { data: topCounters } = await supabase
    .from("counters")
    .select("resource_id, read_count")
    .eq("resource_type", "module")
    .gt("read_count", 0)
    .order("read_count", { ascending: false })
    .limit(5);

  const topModuleIds = (topCounters ?? []).map((c) => c.resource_id);
  let popularModules: PopularModule[] = [];

  if (topModuleIds.length > 0) {
    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, subject_id")
      .in("id", topModuleIds);

    const subjectIds = [...new Set((modules ?? []).map((m) => m.subject_id))];
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id, title, year_id")
      .in("id", subjectIds.length > 0 ? subjectIds : ["__none__"]);

    const yearIds = [...new Set((subjects ?? []).map((s) => s.year_id))];
    const { data: years } = await supabase
      .from("years")
      .select("id, label")
      .in("id", yearIds.length > 0 ? yearIds : ["__none__"]);

    const moduleMap = new Map((modules ?? []).map((m) => [m.id, m]));
    const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s]));
    const yearMap = new Map((years ?? []).map((y) => [y.id, y]));

    popularModules = topModuleIds
      .map((id) => {
        const mod = moduleMap.get(id);
        if (!mod) return null;
        const subject = subjectMap.get(mod.subject_id);
        if (!subject) return null;
        const year = yearMap.get(subject.year_id);
        if (!year) return null;
        return {
          moduleId: mod.id,
          moduleTitle: mod.title,
          subjectId: subject.id,
          subjectTitle: subject.title,
          yearId: year.id,
          yearLabel: year.label,
        };
      })
      .filter((m): m is PopularModule => m !== null);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20 gap-16">
      <PageTracker event="enter" />

      {/* Header label */}
      <div>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-wide">
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
          § 00 — Welcome
        </p>
        <h1 className="font-serif text-display-xl text-ink mb-8 leading-none">
          Everything you need to pass BSIT.
        </h1>
        <p className="font-sans text-lg text-ink-muted leading-relaxed max-w-prose mb-12">
          Module notes, programming guides, and computation walkthroughs,
          organized by year and subject. Start wherever you need to.
        </p>
        <Link
          href="/year"
          className="inline-flex items-center gap-3 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-8 py-4 hover:bg-ink transition-colors duration-150"
        >
          Start here
          <span className="text-accent">→</span>
        </Link>
      </div>

      {/* Continue reading — client, null for first-time visitors */}
      <ContinueReading />

      {/* Popular modules — hidden when no reads */}
      <PopularModules modules={popularModules} />

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          For BSIT students
        </span>
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
          Free to read
        </span>
      </div>
    </main>
  );
}
```

Key changes from Task 3:
- Added `export const revalidate = 300;`
- Changed `flex flex-col justify-between` → `flex flex-col gap-16` (even spacing between all sections)
- Added `mt-auto` to footer div (pushes it to bottom even when ContinueReading/PopularModules are hidden)

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: exit 0, no errors.

- [ ] **Step 3: Run tests**

```bash
cd /Users/jadekingabunada/survivalKitApp && npm test
```
Expected: 5 test files, 24 tests, all passing.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): add revalidate cache and wire final home page layout"
```
