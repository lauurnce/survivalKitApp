# Reader Flow — Churn Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a next-module CTA to the bottom of every module reader page, and an expandable module list toggle on the subjects page, to keep users moving through content.

**Architecture:** Task 1 is a pure server-side change to the module reader page — it fetches sibling modules and renders a "Up next" footer block. Tasks 2–4 extract the subject row on the subjects page into a new `SubjectAccordion` client component that manages expand/collapse state for an inline module list.

**Tech Stack:** Next.js 14 App Router, React `useState` / `useEffect`, Supabase (Postgres), Tailwind CSS, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` | Add sibling module fetch + next-module CTA footer |
| Create | `components/SubjectAccordion.tsx` | Client component: subject row + expandable module list |
| Modify | `app/year/[yearId]/subjects/page.tsx` | Extend module query, import SubjectAccordion, replace Link rows |

---

## Task 1: Next-module CTA on module reader page

**Files:**
- Modify: `app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx`

- [ ] **Step 1: Add `Link` import and sibling modules query**

Open the file. The current `Promise.all` fetches `mod` and `subject`. Add a third query for sibling modules and add the `Link` import:

Replace the top of the file (imports + Promise.all) with:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { SectionRenderer } from "@/components/SectionRenderer";
import { PageTracker } from "@/components/PageTracker";

export const revalidate = 300;

interface Props {
  params: Promise<{ yearId: string; subjectId: string; moduleId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { yearId, subjectId, moduleId } = await params;
  const supabase = createServerClient();

  const [{ data: mod }, { data: subject }, { data: siblingModules }] = await Promise.all([
    supabase.from("modules").select("*").eq("id", moduleId).single(),
    supabase.from("subjects").select("*, years(label, sort_order)").eq("id", subjectId).single(),
    supabase
      .from("modules")
      .select("id, title, sort_order")
      .eq("subject_id", subjectId)
      .order("sort_order"),
  ]);

  if (!mod || !subject) notFound();
```

- [ ] **Step 2: Compute `nextModule` after the `notFound()` guard**

After `if (!mod || !subject) notFound();` and before the sections fetches, add:

```tsx
  const siblings = siblingModules ?? [];
  const currentIndex = siblings.findIndex((m) => m.id === moduleId);
  const nextModule =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;
```

- [ ] **Step 3: Add the CTA footer block after `</article>`**

The current file ends with `</article>` then `</main>`. Insert the CTA block between them:

```tsx
      {/* Next-module CTA */}
      <div className="border-t border-ink-faint/20 px-6 py-12 md:px-16 max-w-wide">
        {nextModule ? (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              Up next
            </p>
            <Link
              href={`/year/${yearId}/subjects/${subjectId}/modules/${nextModule.id}`}
              className="group flex items-center justify-between gap-6 bg-navy px-8 py-6 hover:bg-ink transition-colors duration-150"
            >
              <span className="font-serif text-display-md text-paper">
                {nextModule.title}
              </span>
              <span className="text-accent text-xl flex-shrink-0">→</span>
            </Link>
          </>
        ) : (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-faint mb-4">
              You&apos;ve finished this subject
            </p>
            <Link
              href={`/year/${yearId}/subjects/${subjectId}/modules`}
              className="inline-flex items-center gap-3 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150"
            >
              <span className="text-accent">←</span>
              <span>Back to {subject.title}</span>
            </Link>
          </>
        )}
      </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: no errors (exit 0).

- [ ] **Step 5: Commit**

```bash
git add "app/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx"
git commit -m "feat(ui): add next-module CTA to bottom of module reader page"
```

---

## Task 2: Create SubjectAccordion component

**Files:**
- Create: `components/SubjectAccordion.tsx`

- [ ] **Step 1: Create `components/SubjectAccordion.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCount } from "@/lib/counters";
import { SubjectProgressBar } from "@/components/SubjectProgressBar";

export interface SubjectModule {
  id: string;
  title: string;
  sort_order: number;
}

interface Props {
  subject: {
    id: string;
    title: string;
    kind: "major" | "minor";
  };
  modules: SubjectModule[];
  yearId: string;
  index: number;
  reads: number;
}

export function SubjectAccordion({ subject, modules, yearId, index, reads }: Props) {
  const [open, setOpen] = useState(false);
  const modulesHref = `/year/${yearId}/subjects/${subject.id}/modules`;
  const moduleIds = modules.map((m) => m.id);

  return (
    <div className="flex items-start gap-6 py-8 -mx-4 px-4">
      <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={modulesHref} className="group block">
              <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                {subject.title}
              </h2>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                {subject.kind === "major" ? "Major" : "Minor"}
              </span>
              <span className="font-mono text-label-sm text-ink-faint/40">·</span>
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                <span className="text-ink-muted">{formatCount(reads)}</span> reads
              </span>
            </div>
            <SubjectProgressBar moduleIds={moduleIds} />
          </div>
          <Link
            href={modulesHref}
            className="font-sans text-sm text-ink-faint hover:text-ink transition-colors mt-1 flex-shrink-0"
          >
            →
          </Link>
        </div>

        {modules.length > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint hover:text-ink-muted transition-colors duration-150"
          >
            {open ? "Hide modules ▴" : "Show modules ▾"}
          </button>
        )}

        {open && (
          <div className="mt-4 flex flex-col divide-y divide-ink-faint/20">
            {modules.map((m, mi) => (
              <Link
                key={m.id}
                href={`/year/${yearId}/subjects/${subject.id}/modules/${m.id}`}
                className="group flex items-start gap-4 py-3 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-0.5 w-6 shrink-0 text-right">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-base text-ink group-hover:text-accent transition-colors duration-150">
                  {m.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/SubjectAccordion.tsx
git commit -m "feat(ui): add SubjectAccordion component with expandable module list"
```

---

## Task 3: Wire SubjectAccordion into subjects page

**Files:**
- Modify: `app/year/[yearId]/subjects/page.tsx`

- [ ] **Step 1: Update imports at top of subjects page**

Replace:
```tsx
import { SubjectProgressBar } from "@/components/SubjectProgressBar";
import { formatCount } from "@/lib/counters";
```
With:
```tsx
import { SubjectAccordion, type SubjectModule } from "@/components/SubjectAccordion";
import { formatCount } from "@/lib/counters";
```

(Note: `SubjectProgressBar` is now rendered inside `SubjectAccordion`, so the import moves there.)

- [ ] **Step 2: Extend the modules query to include `title` and `sort_order`**

Find the existing modules fetch (after the `Promise.all`):
```tsx
  const { data: subjectModules } = await supabase
    .from("modules")
    .select("id, subject_id")
    .in("subject_id", subjects.length > 0 ? subjects.map((s) => s.id) : ["__none__"]);

  const moduleIdsBySubject = new Map<string, string[]>();
  for (const m of subjectModules ?? []) {
    const list = moduleIdsBySubject.get(m.subject_id) ?? [];
    list.push(m.id);
    moduleIdsBySubject.set(m.subject_id, list);
  }
```

Replace it with:
```tsx
  const { data: subjectModules } = await supabase
    .from("modules")
    .select("id, title, sort_order, subject_id")
    .in("subject_id", subjects.length > 0 ? subjects.map((s) => s.id) : ["__none__"])
    .order("sort_order");

  const modulesBySubject = new Map<string, SubjectModule[]>();
  for (const m of subjectModules ?? []) {
    const list = modulesBySubject.get(m.subject_id) ?? [];
    list.push({ id: m.id, title: m.title, sort_order: m.sort_order });
    modulesBySubject.set(m.subject_id, list);
  }
```

- [ ] **Step 3: Replace `<Link>` subject rows with `<SubjectAccordion>`**

Find the `<div className="flex flex-col divide-y divide-ink-faint/30">` block. Replace its contents:

```tsx
                <div className="flex flex-col divide-y divide-ink-faint/30">
                  {items.map((subject, i) => (
                    <SubjectAccordion
                      key={subject.id}
                      subject={subject}
                      modules={modulesBySubject.get(subject.id) ?? []}
                      yearId={yearId}
                      index={i}
                      reads={readCount(subject.id)}
                    />
                  ))}
                </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Run tests**

```bash
cd /Users/jadekingabunada/survivalKitApp && npm test
```
Expected: 5 test files, 24 tests, all passing.

- [ ] **Step 6: Commit**

```bash
git add "app/year/[yearId]/subjects/page.tsx"
git commit -m "feat(ui): wire SubjectAccordion into subjects page"
```

---

## Task 4: Add aria-expanded and keyboard accessibility to SubjectAccordion

**Files:**
- Modify: `components/SubjectAccordion.tsx`

- [ ] **Step 1: Add `useEffect` to the existing import**

The file already imports `useState`. Update the import:
```tsx
import { useState, useEffect } from "react";
```

- [ ] **Step 2: Add `aria-expanded`, `aria-controls`, `id` and Escape-key handler**

Replace the entire `SubjectAccordion` function body with:

```tsx
export function SubjectAccordion({ subject, modules, yearId, index, reads }: Props) {
  const [open, setOpen] = useState(false);
  const modulesHref = `/year/${yearId}/subjects/${subject.id}/modules`;
  const moduleIds = modules.map((m) => m.id);
  const listId = `modules-${subject.id}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="flex items-start gap-6 py-8 -mx-4 px-4">
      <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={modulesHref} className="group block">
              <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                {subject.title}
              </h2>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                {subject.kind === "major" ? "Major" : "Minor"}
              </span>
              <span className="font-mono text-label-sm text-ink-faint/40">·</span>
              <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                <span className="text-ink-muted">{formatCount(reads)}</span> reads
              </span>
            </div>
            <SubjectProgressBar moduleIds={moduleIds} />
          </div>
          <Link
            href={modulesHref}
            className="font-sans text-sm text-ink-faint hover:text-ink transition-colors mt-1 flex-shrink-0"
          >
            →
          </Link>
        </div>

        {modules.length > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={listId}
            className="mt-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint hover:text-ink-muted transition-colors duration-150"
          >
            {open ? "Hide modules ▴" : "Show modules ▾"}
          </button>
        )}

        {open && (
          <div id={listId} className="mt-4 flex flex-col divide-y divide-ink-faint/20">
            {modules.map((m, mi) => (
              <Link
                key={m.id}
                href={`/year/${yearId}/subjects/${subject.id}/modules/${m.id}`}
                className="group flex items-start gap-4 py-3 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
              >
                <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-0.5 w-6 shrink-0 text-right">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-base text-ink group-hover:text-accent transition-colors duration-150">
                  {m.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jadekingabunada/survivalKitApp && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
cd /Users/jadekingabunada/survivalKitApp && npm test
```
Expected: 5 test files, 24 tests, all passing.

- [ ] **Step 5: Commit**

```bash
git add components/SubjectAccordion.tsx
git commit -m "feat(ui): add aria-expanded and keyboard accessibility to SubjectAccordion"
```
