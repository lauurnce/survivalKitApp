# Semester Roadmap Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the logged-in dashboard (`/account`) into the "Semester Roadmap" concept — real left nav rail, hero current-semester card with a dynamic per-school landmark illustration, This Week panel, academic roadmap timeline, semester-grouped collapsible subjects, and overall progress ring — without touching the reader routes, payments, or the in-flight share-card branch.

**Architecture:** All data continues to flow through the existing server-component path (`getAccountOverview` + `getProfile`); we extend `lib/account.ts` to carry `semester`/`kind` and add a pure-function layer (`lib/dashboard.ts`) that derives the current term, recommendations, and roadmap nodes — fully unit-testable without Supabase. The landmark system is one config file (`lib/landmarks.ts`) mapping school slugs to art in `/public/landmarks/`, with a committed SVG fallback so no school ever renders a broken image. New UI lives in `components/dashboard/*`; the old duplicated-subject-list sidebar is retired and its subscribe modals are extracted intact.

**Tech Stack:** Next.js 15.5 App Router, React 19 server components, Tailwind 3.4 with the existing bespoke tokens (paper/ink/accent/navy/taupe, Fraunces serif, JetBrains Mono labels), Supabase via existing client factories, vitest + testing-library.

## Global Constraints

- Work on a NEW branch `feature/dashboard-redesign` cut from `main`, in a separate worktree — the current worktree holds uncommitted `feature/progress-share-card` work that must not be touched.
- Never add `Co-Authored-By` trailers to commits (CLAUDE.md; lauurnce is sole contributor).
- Do NOT modify: reader routes (`app/(main)/year/**`), landing page (`app/(main)/page.tsx`), payment/subscribe API routes, admin, share-card files (`app/api/card/**`, `components/share/**`, `components/ModuleDoneToggle*`).
- No DB schema changes. School source of truth is `public.profiles.university` (free text, ≤120 chars).
- No new dependencies. No shadcn. Icons are inline SVG, matching repo idiom.
- Landmark art: PNGs are uploaded later by the user; convention is `/public/landmarks/<slug>.png`. Until then everything renders the committed `fallback.svg`. Never a broken `<img>`.
- Reuse existing tokens: `bg-paper`, `text-ink`, `text-ink-muted`, `text-ink-faint`, `accent`, `accent-dark`, `navy`, `taupe`, `font-serif` (Fraunces), `font-mono` labels, `.label`/`.label-sm` utility classes. Dark mode must keep working (`darkMode: "class"` re-maps the same tokens).
- Test: `npm test` (vitest). Lint: `npm run lint`. Build gate: `npm run build`.
- Accessibility: nav rail is a `<nav aria-label="Primary">` with `aria-current="page"`; collapsibles are native `<details>/<summary>` or buttons with `aria-expanded`; decorative landmark art gets `alt=""`; timeline is an `<ol>` with visually-hidden status text.

---

### Task 0: Worktree + branch setup

**Files:** none (git only)

- [ ] **Step 1: Create isolated worktree off main**

Use the `superpowers:using-git-worktrees` skill. Equivalent commands:

```bash
git -C /Users/jadekingabunada/survivalKitApp worktree add \
  ../survivalKitApp-dashboard -b feature/dashboard-redesign main
cd /Users/jadekingabunada/survivalKitApp-dashboard && npm install
```

- [ ] **Step 2: Verify clean baseline**

Run: `npm test && npm run lint`
Expected: existing suite passes (share-card tests live only on the other branch's working tree; anything committed to main must pass).

---

### Task 1: Landmark config + lookup (`lib/landmarks.ts`)

The single obvious file to extend per school. Keyed by slug; free-text `profiles.university` values are resolved via canonical name, aliases, then longest-canonical-first containment (so "Polytechnic University of the Philippines" can never fall through to UP's "University of the Philippines" substring).

**Files:**
- Create: `lib/landmarks.ts`
- Test: `lib/landmarks.test.ts`

**Interfaces:**
- Produces: `interface Landmark { slug: string; school: string; landmark: string; aliases: string[]; image?: string }`, `LANDMARKS: Landmark[]`, `findLandmark(university: string | null | undefined): Landmark | null`, `landmarkArt(l: Landmark | null): { src: string; label: string }`, `FALLBACK_LANDMARK_IMAGE = "/landmarks/fallback.svg"`.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/landmarks.test.ts
import { describe, expect, it } from "vitest";
import { findLandmark, landmarkArt, FALLBACK_LANDMARK_IMAGE } from "./landmarks";

describe("findLandmark", () => {
  it("matches the canonical school name exactly", () => {
    expect(findLandmark("Polytechnic University of the Philippines")?.slug).toBe("pup");
  });
  it("is case/whitespace/punctuation insensitive", () => {
    expect(findLandmark("  polytechnic university of the philippines. ")?.slug).toBe("pup");
  });
  it("matches common abbreviations via aliases", () => {
    expect(findLandmark("PUP")?.slug).toBe("pup");
    expect(findLandmark("UP Diliman")?.slug).toBe("up");
    expect(findLandmark("UST")?.slug).toBe("ust");
  });
  it("never resolves PUP's full name to UP despite the substring overlap", () => {
    // "Polytechnic University of the Philippines" CONTAINS "University of the Philippines"
    expect(findLandmark("Polytechnic University of the Philippines - Sta. Mesa")?.slug).toBe("pup");
  });
  it("matches campus-suffixed variants by containment", () => {
    expect(findLandmark("University of Santo Tomas Manila")?.slug).toBe("ust");
  });
  it("returns null for unknown, empty, and null input", () => {
    expect(findLandmark("Westmead International School")).toBeNull(); // in map? see step 3 — remove from this test if seeded
    expect(findLandmark("Some Unknown College")).toBeNull();
    expect(findLandmark("")).toBeNull();
    expect(findLandmark(null)).toBeNull();
    expect(findLandmark(undefined)).toBeNull();
  });
});

describe("landmarkArt", () => {
  it("falls back to the generic campus art when no school matched", () => {
    expect(landmarkArt(null)).toEqual({ src: FALLBACK_LANDMARK_IMAGE, label: "Campus building" });
  });
  it("falls back when the school has no uploaded art yet", () => {
    const l = findLandmark("Catanduanes State University");
    expect(landmarkArt(l).src).toBe(FALLBACK_LANDMARK_IMAGE);
  });
  it("uses the school's image once set", () => {
    expect(
      landmarkArt({ slug: "x", school: "X U", landmark: "X Tower", aliases: [], image: "/landmarks/x.png" }),
    ).toEqual({ src: "/landmarks/x.png", label: "X Tower" });
  });
});
```

Note: seed Westmead in the map (it exists in live profiles), so change that first `toBeNull` line to `?.slug).toBe("westmead")`.

- [ ] **Step 2: Run to verify failure** — `npm test -- landmarks` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// lib/landmarks.ts
/**
 * School landmark registry for the dashboard hero illustration.
 *
 * TO ADD A SCHOOL:
 *   1. Drop the PNG at public/landmarks/<slug>.png (see public/landmarks/README.md)
 *   2. Add/extend the entry below and set `image: "/landmarks/<slug>.png"`.
 * Until `image` is set, the hero renders the generic fallback — never a broken image.
 */
export interface Landmark {
  slug: string;
  school: string;    // canonical display name (what the profile form suggests)
  landmark: string;  // name of the illustrated landmark, used as accessible label
  aliases: string[]; // abbreviations / alternate names, matched case-insensitively
  image?: string;    // set ONLY once the art file exists in public/landmarks/
}

export const FALLBACK_LANDMARK_IMAGE = "/landmarks/fallback.svg";

export const LANDMARKS: Landmark[] = [
  { slug: "pup", school: "Polytechnic University of the Philippines", landmark: "PUP Obelisk", aliases: ["pup", "pup sta mesa", "pup main"] },
  { slug: "up", school: "University of the Philippines", landmark: "The Oblation", aliases: ["up", "up diliman", "upd", "up los banos", "uplb", "up manila"] },
  { slug: "ust", school: "University of Santo Tomas", landmark: "UST Main Building", aliases: ["ust"] },
  { slug: "dlsu", school: "De La Salle University", landmark: "St. La Salle Hall", aliases: ["dlsu", "la salle"] },
  { slug: "admu", school: "Ateneo de Manila University", landmark: "Gate 2.5 / Church of the Gesu", aliases: ["admu", "ateneo"] },
  { slug: "ustp", school: "University of Science and Technology of Southern Philippines", landmark: "USTP Gymnasium Arch", aliases: ["ustp"] },
  { slug: "plv", school: "Pamantasan ng Lungsod ng Valenzuela", landmark: "PLV Main Building", aliases: ["plv"] },
  { slug: "catsu", school: "Catanduanes State University", landmark: "CatSU Main Gate", aliases: ["catsu", "csu catanduanes"] },
  { slug: "uep", school: "University of Eastern Pangasinan", landmark: "UEP Main Building", aliases: ["uep"] },
  { slug: "westmead", school: "Westmead International School", landmark: "Westmead Campus", aliases: ["westmead", "wis"] },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function findLandmark(university: string | null | undefined): Landmark | null {
  if (!university) return null;
  const q = normalize(university);
  if (!q) return null;

  for (const l of LANDMARKS) {
    if (normalize(l.school) === q) return l;
    if (l.aliases.some((a) => normalize(a) === q)) return l;
  }
  // Containment pass for campus-suffixed variants ("UST Manila"). Longest
  // canonical name first so PUP wins over UP's substring.
  const byLength = [...LANDMARKS].sort(
    (a, b) => normalize(b.school).length - normalize(a.school).length,
  );
  for (const l of byLength) {
    const c = normalize(l.school);
    if (q.includes(c)) return l;
    if (l.aliases.some((a) => q.startsWith(normalize(a) + " "))) return l;
  }
  return null;
}

export function landmarkArt(l: Landmark | null): { src: string; label: string } {
  if (l?.image) return { src: l.image, label: l.landmark };
  return { src: FALLBACK_LANDMARK_IMAGE, label: "Campus building" };
}
```

- [ ] **Step 4: Run** — `npm test -- landmarks` → all PASS.
- [ ] **Step 5: Commit** — `git add lib/landmarks.ts lib/landmarks.test.ts && git commit -m "feat(dashboard): school landmark registry with fuzzy university lookup"`

---

### Task 2: Landmark assets folder + fallback art + `LandmarkArt` component

**Files:**
- Create: `public/landmarks/README.md`
- Create: `public/landmarks/fallback.svg`
- Create: `components/dashboard/LandmarkArt.tsx`

**Interfaces:**
- Consumes: `findLandmark`, `landmarkArt` from Task 1.
- Produces: `<LandmarkArt university={string | null} className?: string />` (server component; renders `next/image` for PNGs, plain `<img>` for the SVG fallback; `alt=""` — decorative, label carried via `title`/sr-only text in the hero).

- [ ] **Step 1: Write README (this is the "drop files here" documentation)**

```markdown
# /public/landmarks — school landmark illustrations

Hero-card art shown to a student based on `profiles.university`.

## Naming convention
One PNG per school, named by slug: `pup.png`, `up.png`, `ust.png`, `dlsu.png`, …
Slugs are defined in `lib/landmarks.ts` (`LANDMARKS`). Transparent background,
~1200×900px, warm line-art style matching the terracotta/cream palette.

## To add or activate a school
1. Drop `<slug>.png` in this folder.
2. In `lib/landmarks.ts`, set `image: "/landmarks/<slug>.png"` on that entry
   (add the entry first if the school is new).
3. Commit both. Anything without `image` set renders `fallback.svg`.

`fallback.svg` is the generic campus building — do not delete it.
```

- [ ] **Step 2: Create `fallback.svg`** — hand-drawn generic campus line-art in `#E0492B` strokes on transparent, viewBox `0 0 480 360`: a symmetric 3-storey facade with pediment, columns, steps, two flanking trees and small clouds (mirror the mockup's style). Full SVG source is written at implementation time; keep strokes `stroke="#E0492B" stroke-width="2.5" fill="none"` with a few `fill="#E0492B" opacity="0.08"` wash shapes so it reads in both light and dark themes.

- [ ] **Step 3: Implement `LandmarkArt.tsx`**

```tsx
// components/dashboard/LandmarkArt.tsx
import Image from "next/image";
import { findLandmark, landmarkArt } from "@/lib/landmarks";

interface Props {
  university: string | null;
  className?: string;
}

export function LandmarkArt({ university, className = "" }: Props) {
  const { src, label } = landmarkArt(findLandmark(university));
  const isSvg = src.endsWith(".svg");
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {isSvg ? (
        // The committed fallback — plain <img>, no optimizer round-trip needed.
        <img src={src} alt="" className="h-full w-full object-contain" />
      ) : (
        <Image src={src} alt="" width={480} height={360} title={label}
          className="h-full w-full object-contain" priority />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `npm run lint` passes; `fallback.svg` renders in the browser at `http://localhost:3000/landmarks/fallback.svg`.
- [ ] **Step 5: Commit** — `feat(dashboard): landmark assets folder, fallback art, LandmarkArt component`

---

### Task 3: Data layer — semester/kind through `lib/account.ts`, fix `lib/supabase/types.ts` drift

**Files:**
- Modify: `lib/account.ts:41-51` (SubjectSummary), `:74-78` (select), `:103-129` (loop)
- Modify: `lib/supabase/types.ts` (subjects Row: add `semester: number; kind: "major" | "minor"`; add `user_id: string | null` to module_progress/subscriptions/payments/unlocks Rows — matches live schema)

**Interfaces:**
- Produces: `SubjectSummary` gains `semester: number` and `kind: "major" | "minor"`; nothing else changes shape, so `AccountSidebar`, `ProgressOverview`, `ResumeCard` keep compiling untouched.

- [ ] **Step 1: Failing test** (pure grouping logic is exercised in Task 4's tests; here assert the type plumb-through with a compile-level test)

```ts
// lib/account.semester.test.ts
import { describe, expect, it } from "vitest";
import type { SubjectSummary } from "./account";

describe("SubjectSummary", () => {
  it("carries semester and kind", () => {
    const s: SubjectSummary = {
      id: "a", title: "T", yearId: "y", unlocked: true,
      doneCount: 0, totalCount: 1, modules: [], semester: 1, kind: "major",
    };
    expect(s.semester).toBe(1);
  });
});
```

- [ ] **Step 2:** `npm test -- account.semester` → FAIL (ts error: unknown properties).
- [ ] **Step 3: Implement** — in `lib/account.ts`: add `semester: number; kind: "major" | "minor";` to `SubjectSummary`; change the select to `"id, title, year_id, semester, kind, years(id, label, sort_order)"`; in the loop set `semester: (s as { semester?: number }).semester ?? 1, kind: ((s as { kind?: string }).kind === "minor" ? "minor" : "major")` (or type the row properly once types.ts is fixed — preferred). Update `lib/supabase/types.ts` subjects Row/Insert with `semester: number; kind: string;` and add the four `user_id: string | null` columns.
- [ ] **Step 4:** `npm test && npm run lint && npx tsc --noEmit` → PASS.
- [ ] **Step 5: Commit** — `feat(account): plumb subject semester/kind through overview; sync hand-written DB types with live schema`

---

### Task 4: Pure dashboard derivations (`lib/dashboard.ts`)

All Semester-Roadmap intelligence as pure functions over `YearGroup[]` — current term, hero stats, This Week picks, roadmap nodes, status reframing.

**Files:**
- Create: `lib/dashboard.ts`
- Test: `lib/dashboard.test.ts`

**Interfaces:**
- Consumes: `SubjectSummary`, `YearGroup` from `lib/account`.
- Produces:

```ts
export type SubjectStatus = "done" | "in-progress" | "ready";
export function subjectStatus(s: { doneCount: number; totalCount: number }): SubjectStatus;
export interface TermGroup { yearId: string; yearLabel: string; yearSort: number; semester: number; subjects: SubjectSummary[]; }
export function groupByTerm(years: YearGroup[]): TermGroup[];            // year asc, then semester asc
export interface CurrentTerm extends TermGroup {
  modulesDone: number; modulesTotal: number; inProgress: number; ready: number;
}
export function deriveCurrentTerm(terms: TermGroup[]): CurrentTerm | null; // first term (unlocked subjects) with unfinished work; else last unlocked term; else null
export interface Recommendation { moduleId: string; moduleTitle: string; subjectId: string; subjectTitle: string; yearId: string; status: SubjectStatus; }
export function pickRecommended(term: TermGroup | null, limit?: number): Recommendation[]; // in-progress subjects' next module first, then ready subjects' first module, cap 3
export interface RoadmapNode { key: string; short: string; state: "past" | "current" | "future"; }
export function roadmapNodes(terms: TermGroup[], current: CurrentTerm | null): RoadmapNode[]; // "1-1"…"4-2" + { key: "grad", short: "Graduation" }
export function continueHref(rec: Recommendation | undefined): string;   // module reader URL or /year fallback
```

- [ ] **Step 1: Write failing tests** — cover: `subjectStatus` boundaries (0 done → ready; some → in-progress; all → done; 0 total → ready); `deriveCurrentTerm` picks the earliest term with unfinished unlocked work, skips fully-locked terms, falls back to last unlocked term when all done, null when nothing unlocked; `pickRecommended` ordering (in-progress before ready, respects module order, cap 3, empty for null term); `roadmapNodes` marks past/current/future correctly and appends graduation; PUP-style fixture uses realistic `YearGroup` literals (build a small `mkSubject(overrides)` helper in the test file).
- [ ] **Step 2:** `npm test -- dashboard` → FAIL.
- [ ] **Step 3: Implement** the functions exactly per the signatures above. `deriveCurrentTerm` counts: `modulesDone/modulesTotal` summed over UNLOCKED subjects in the term; `inProgress`/`ready` count unlocked subjects by `subjectStatus`. `continueHref(rec)` returns `/year/${rec.yearId}/subjects/${rec.subjectId}/modules/${rec.moduleId}` or `"/year"` when undefined.
- [ ] **Step 4:** `npm test -- dashboard` → PASS.
- [ ] **Step 5: Commit** — `feat(dashboard): pure term/recommendation/roadmap derivations`

---

### Task 5: Nav rail + dashboard shell

**Files:**
- Create: `components/dashboard/NavRail.tsx` (client — needs `usePathname`)

**Interfaces:**
- Produces: `<NavRail overallDone={number} overallTotal={number} />`. Items: Dashboard `/account`, Subjects `/year`, Roadmap `/account#roadmap`, Resources `/resources`, Profile `/account/profile`. Desktop (`lg+`): fixed-width left rail with the BSIT wordmark (serif, letterspaced mono subtitle), nav list with inline-SVG icons, and a compact overall-progress ring block at the bottom ("Small steps today, big wins later."). Mobile: rail hidden; render a horizontal scrollable tab strip under the page top bar (`<nav>` is emitted once, restyled via responsive classes).

- [ ] **Step 1: Implement** — single `<nav aria-label="Primary">`; each item `aria-current={active ? "page" : undefined}`; active style `bg-accent/10 text-accent`, inactive `text-ink-muted hover:text-ink`. Mini ring reuses the SVG-donut pattern from `components/account/ProgressOverview.tsx` (RADIUS/stroke-dasharray approach) at 72px.
- [ ] **Step 2: Verify** — render on dev server, keyboard-tab through items, check `aria-current` in devtools, check `<lg` breakpoint strip scrolls.
- [ ] **Step 3: Commit** — `feat(dashboard): primary nav rail with progress ring`

---

### Task 6: Hero card with dynamic landmark

**Files:**
- Create: `components/dashboard/HeroCard.tsx` (server component)

**Interfaces:**
- Consumes: `CurrentTerm | null`, `Recommendation | undefined` (first pick), `Profile | null` (for `first_name`, `university`), `<LandmarkArt>`, `continueHref`.
- Produces: `<HeroCard term={CurrentTerm | null} topPick={Recommendation | undefined} profile={Profile | null} />`.

- [ ] **Step 1: Implement** — card layout per mockup: `label-sm` kicker "CURRENT SEMESTER"; `font-serif text-display-md` heading `${yearLabel} · ${semester === 1 ? "1st" : "2nd"} Semester` (fallback heading "Start your roadmap" when `term === null`); one-line subcopy; three compact stats (`{modulesDone} / {modulesTotal}` Modules Done · `{inProgress}` In Progress · `{ready}` Ready to Start); primary button `Continue this week →` linking `continueHref(topPick)`; secondary link "View semester details" → `/year/${term.yearId}/subjects`. Right side: `<LandmarkArt university={profile?.university ?? null} className="hidden sm:block w-56 lg:w-72" />` plus an sr-only `<span>` naming the landmark for screen readers. Greeting row above the card: time-of-day greeting + `profile?.first_name`.
- [ ] **Step 2: Verify** — as the owner account (university = "Polytechnic University of the Philippines") the lookup resolves the `pup` slug; with no PNG uploaded yet it renders `fallback.svg`. Confirm with a temporary `image:` line + any test PNG that swapping art requires only the config line + file.
- [ ] **Step 3: Commit** — `feat(dashboard): current-semester hero with dynamic school landmark`

---

### Task 7: This Week panel + Roadmap timeline

**Files:**
- Create: `components/dashboard/ThisWeekPanel.tsx` (server)
- Create: `components/dashboard/RoadmapTimeline.tsx` (server)

**Interfaces:**
- `<ThisWeekPanel recs={Recommendation[]} />` — kicker "THIS WEEK · Recommended for you"; up to 3 rows: module title, subject title, status chip (`In Progress` accent-tinted / `Ready to Start` neutral), each row links to the module reader; empty state links to `/year`.
- `<RoadmapTimeline nodes={RoadmapNode[]} />` — `<ol id="roadmap">` horizontal on desktop (`overflow-x-auto` on mobile); node = dot + short label; `current` = filled accent dot + "Current" caption; `past` = accent-outline; `future` = taupe; final node flag icon "Graduation". Each `<li>` carries `<span className="sr-only">` state text.

- [ ] **Step 1: Implement both.** Status chips reuse the exact reframing rule: `subjectStatus` = "ready" renders **"Ready to Start"** — the phrase "0%" never appears for untouched subjects anywhere on the dashboard.
- [ ] **Step 2: Verify** in dev; keyboard focus order; horizontal scroll on a 375px viewport.
- [ ] **Step 3: Commit** — `feat(dashboard): this-week recommendations and academic roadmap timeline`

---

### Task 8: Extract subscribe modals; semester-grouped collapsible subjects

**Files:**
- Create: `components/account/SubscribeModals.tsx` — literal cut-paste of `YearSubscribeModal`, `SubjectSubscribeModal` (and their helpers) out of `components/account/AccountSidebar.tsx`, now exported; `AccountSidebar.tsx` imports them back so it keeps compiling until Task 9 removes it.
- Create: `components/dashboard/SemesterSections.tsx` (client — collapsibles + modals)

**Interfaces:**
- `<SemesterSections terms={TermGroup[]} currentKey={string | null} />` where `currentKey = \`${yearId}-${semester}\``. One `<details>` per term, `open` only for the current term. Header: `font-serif` term title + module-count pill + (for fully-locked terms) an "Unlock" affordance opening the extracted subscribe modal. Rows: subject title, thin progress bar (accent fill on `taupe/20` track), `doneCount/totalCount`, status chip (Done ✓ / In Progress / Ready to Start), chevron link to `/year/${yearId}/subjects/${subjectId}/modules`; locked subjects show a lock glyph + per-subject subscribe trigger.

- [ ] **Step 1: Extraction first, as its own commit** — move modal components verbatim, update imports, `npm run lint && npx tsc --noEmit && npm test` green, commit `refactor(account): extract subscribe modals from AccountSidebar`.
- [ ] **Step 2: Implement `SemesterSections`** per interface above.
- [ ] **Step 3: Verify** — expand/collapse via keyboard; subscribe modal still opens and produces a PayMongo link for a locked subject (stop at the external checkout — do not pay).
- [ ] **Step 4: Commit** — `feat(dashboard): semester-grouped collapsible subject sections`

---

### Task 9: Assemble the new `/account` page; retire the duplicated sidebar

**Files:**
- Modify: `app/account/page.tsx` (rewrite the composition; keep: auth redirect, `Promise.all` data fetch, payment-success banner, `signOutAction`, `ThemeToggleInline`, `ReviewQuiz` REMOVED to Task 10's Resources page)
- Delete usage of: `components/account/AccountSidebar.tsx`, `components/account/ResumeCard.tsx` (hero's Continue supersedes it), `components/account/ProgressOverview.tsx` (ring lives in NavRail; per-subject bars live in SemesterSections). Delete the files once nothing imports them (`ProfileCard` moves to Task 10).

- [ ] **Step 1: Rewrite page** — structure:

```tsx
const [overview, profile] = await Promise.all([getAccountOverview(userId), getProfile(userId)]);
const terms = groupByTerm(overview.years);
const current = deriveCurrentTerm(terms);
const recs = pickRecommended(current, 3);
// layout: <div className="lg:flex">
//   <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
//   <main id="main" className="flex-1 px-4 sm:px-8 py-6 max-w-wide mx-auto">
//     top row: greeting …spacer… ThemeToggleInline + logout form (existing markup)
//     {paymentSuccess && existing banner}
//     <HeroCard term={current} topPick={recs[0]} profile={profile} />
//     grid lg:grid-cols-[1fr_20rem]: left = <RoadmapTimeline …/> + <SemesterSections …/>, right = <ThisWeekPanel recs={recs} />
//   </main>
// </div>
```

- [ ] **Step 2: Full verification** — `npm test && npm run lint && npx tsc --noEmit && npm run build` all green; manual pass logged-in on dev: hero stats match the semester sections' counts; Continue button lands on the correct module; dark mode; 375px/768px/1280px widths.
- [ ] **Step 3: Delete dead components** (`AccountSidebar.tsx`, `ResumeCard.tsx`, `ProgressOverview.tsx`) only after `grep -r` shows zero imports; build again.
- [ ] **Step 4: Commit** — `feat(dashboard): assemble semester-roadmap dashboard, retire duplicated sidebar`

---

### Task 10: Profile page + Resources page (nav destinations)

**Files:**
- Create: `app/account/profile/page.tsx` — auth-guarded like `/account`; renders `NavRail` + existing `<ProfileCard profile={profile} />` (unchanged component — the edit modal and `saveProfileAction` keep working) + the sign-out form. Metadata title "Profile".
- Create: `app/(main)/resources/page.tsx` — editorial cards linking Playground (`/playground`), Search (`/search`), and hosting `<ReviewQuiz />` (moved from the dashboard; it is a client component with no page-specific props). Metadata title "Resources".

- [ ] **Step 1: Implement both pages.**
- [ ] **Step 2: Verify** — profile edit still saves `university` (change it, watch the hero landmark change on `/account`, change it back to "Polytechnic University of the Philippines"); ReviewQuiz functions on `/resources`.
- [ ] **Step 3: Commit** — `feat(dashboard): profile and resources pages for nav rail destinations`

---

### Task 11: Final verification + integration

- [ ] **Step 1:** Run the repo `verify` flow (drive the real app): login → dashboard → Continue this week → mark a module done → back to dashboard (counts update) → roadmap current node correct → subscribe modal opens on a locked term → profile edit → resources.
- [ ] **Step 2:** `npm run build` green; Lighthouse a11y quick pass on `/account` (no contrast/landmark errors).
- [ ] **Step 3:** superpowers:requesting-code-review, then superpowers:finishing-a-development-branch (PR to main; solo-github rules — no Claude attribution).

---

## Self-Review Notes

- Spec coverage: nav rail (T5), hero + stats + Continue (T6), dynamic landmark + folder + config + fallback + PUP default (T1/T2/T6 — owner's live profile row already reads "Polytechnic University of the Philippines" so no data change needed), This Week (T7), roadmap timeline (T7), semester-grouped collapsibles (T8), progress ring (T5), 0%-reframing (T7/T8 chips), remove duplicated sidebar (T9), accessible + responsive (global constraint + per-task verify), don't break running site (worktree, untouched reader/payment routes, extraction-first refactor).
- Placeholder scan: the fallback.svg source is deferred to implementation by design (art asset, not logic); all code interfaces are fully specified.
- Type consistency: `SubjectSummary.semester/kind` (T3) feed `groupByTerm` (T4); `TermGroup`/`CurrentTerm`/`Recommendation`/`RoadmapNode` names match across T4–T9.
