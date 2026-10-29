# Account Page Engagement Features — Design

**Date:** 2026-07-06
**Status:** Approved for implementation

## Goal

The account page ("My Progress") is functional but flat — a header count and
module lists. Add three engagement features:

1. **Progress visualization** — show at a glance how much the student has
   accomplished.
2. **Resume button** — jump back to the last module they were reading, like
   the main page's "Continue reading" card.
3. **Review quiz** — an interactive quiz generated from lessons they have
   already completed (fill-in-the-blank, term identification, code questions).

## Constraints & context

- Content lives in Supabase: `subjects → modules → sections`, with
  `sections.body_md` holding markdown rich in `**bold terms**`, definitional
  sentences ("A flowchart is …"), and fenced code blocks (` ```c `).
- Progress = `module_progress` rows keyed by `user_id` + `module_id`.
- The main page's Continue card (`components/ContinueReading.tsx`) reads a
  `bsit_last_module` localStorage entry written by `LastModuleTracker` on
  every module visit.
- `getAccountOverview()` (lib/account.ts) already returns per-subject done
  counts and module lists in 4 parallel queries — the visualization needs
  **no new queries**.
- No LLM integration exists in the app; quiz generation must be free and
  deterministic.

## Approach chosen

**Deterministic quiz generation** from section markdown (rejected: LLM
generation — adds API cost/latency/keys; pre-authored question banks — heavy
seeding work across 10+ subjects). The content's structure supports three
extractors:

- **Fill-in-the-blank:** sentence containing a `**bold term**` → blank the
  term, student types it (case-insensitive, trimmed match).
- **Term identification (multiple choice):** definitional sentence → "Which
  term does this describe?" with 3 distractor terms drawn from the same pool.
- **Code fill-in:** fenced code block with a language → blank one meaningful
  token (keyword/identifier), student types it. Rendered in monospace.

## Components

### 1. `lib/quiz/types.ts` — shared contract

```ts
type QuizQuestion =
  | { kind: "fill-blank";  prompt: string; answer: string; context: SourceRef }
  | { kind: "multi-choice"; prompt: string; options: string[]; answerIndex: number; context: SourceRef }
  | { kind: "code-blank";  promptCode: string; language: string; answer: string; context: SourceRef };
// SourceRef = { subjectTitle, moduleTitle } so feedback can say where it came from
```

### 2. `lib/quiz/generate.ts` (+ `generate.test.ts`, TDD)

Pure functions, no I/O:
- `extractFacts(markdown)` → bold-term/sentence pairs + code blocks.
  Strips tables, headings; skips terms that are too generic/short.
- `buildQuiz(sections, { count, seed })` → `QuizQuestion[]` — mixes the three
  kinds, seeded shuffle so "New quiz" reshuffles, dedupes answers.

### 3. `app/api/quiz/route.ts`

`GET /api/quiz` — auth via `getCurrentUserId()` (401 otherwise). Fetches the
user's done module ids (`module_progress`), joins to sections of those
modules **within unlocked subjects only**, generates ~10 questions
server-side, returns small JSON (never ships full body_md to the client).
Returns `{ questions: [], reason: "no-progress" }` when nothing is done yet.

### 4. `components/account/ProgressOverview.tsx` (server component)

Rendered at the top of the right column from existing `overview` data:
- SVG donut ring — overall done/total with % in the center.
- Stat tiles: modules done, subjects in progress, subjects completed.
- Slim per-subject progress bars (reuses the visual language of
  `SubjectProgressBar`, but server-rendered — no client fetch).
Follows the app's palette (paper/ink/accent/taupe) and dataviz guidance.

### 5. `components/account/ResumeCard.tsx` (client component)

Reads `bsit_last_module` from localStorage (same schema as
`ContinueReading`). Falls back to a server-computed `fallback` prop (first
unfinished module across unlocked subjects) when localStorage is empty.
Hidden only when there is nothing to resume at all.

### 6. `components/account/ReviewQuiz.tsx` (client component)

- Lazy: fetches `/api/quiz` on mount of the panel.
- One question at a time; submit → immediate right/wrong feedback showing the
  correct answer + which module it came from; score tally; progress dots;
  final score screen with "Try another quiz" (refetch with new seed).
- Empty state when the user has no completed modules yet.

### 7. Integration — `app/account/page.tsx`

Right column becomes: `ResumeCard` + `ProgressOverview` (hero row) →
`ReviewQuiz` → existing per-subject module lists. Empty state unchanged.

## Error handling

- Quiz API: 401 unauthenticated; empty-pool → friendly empty state, never a
  crash; malformed markdown just yields fewer facts (extractors are
  defensive).
- ResumeCard: corrupted localStorage ignored (same try/catch pattern as
  `ContinueReading`).

## Testing

- `lib/quiz/generate.test.ts` — extraction from representative markdown
  (bold terms, definitions, code fences, tables to be skipped), question
  building, seeded determinism, distractor uniqueness.
- Existing suite must stay green; `next build` must pass.
