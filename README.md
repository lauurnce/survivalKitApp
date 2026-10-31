# BSIT Survival Kit

Study companion web app for BSIT (Bachelor of Science in Information Technology) students in the Philippines. Lessons are free to read; a one-time unlock adds practice drills, quizzes, in-app code labs, exam solutions, and progress tracking.

**Live:** https://tryi2i.com

**The story:** why this exists, the data behind it, and where it's going → [STORY.md](STORY.md)

## Where things stand (as of 2026-10-31)

Shipped for the run-up to finals:

- **Fast public pages** — subject lists and module pages are prerendered and
  served static; the session and reviewer unlocks resolve client-side, and the
  CSP was split so public pages can prerender.
- **Print view** — a print stylesheet for module pages and a *Print / Save as
  PDF* button in the reader.
- **CP1 path** — first-years land straight on CP1 Lesson 1, and every reviewer
  in a subject's first lesson is free to try.
- **Price on the teaser** — the paywall teaser quotes the starting price, with
  a social-proof line on the teaser and `/unlock`.
- **UTM tagging** — shared and emailed links carry `utm_*` tags, and a visit's
  attribution is recorded on whichever page it lands.
- **Finals reactivation** — a finals reminder email with signed one-click
  unsubscribe, and the term calendar for the August wave so reports read the
  exam season correctly.

### Content (live production, 2026-10-31)

| | Count |
|---|---|
| Years covered | 4 |
| Subjects | 36 |
| Modules | 274 |
| Content sections | 1,602 |

See [STORY.md](STORY.md) for the project's fuller narrative.

## Stack

- **Next.js** (App Router) + **React** + **Tailwind CSS**
- **Supabase** — Postgres, auth, RLS
- **PayMongo** — one-time payment links (GCash-friendly)
- **Vitest** — unit tests · **Pyodide / CodeMirror** — in-app code labs

## Getting started

Requires Node 24 (see `.nvmrc` / `engines`).

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run ingest` | Ingest 1st-year content into Supabase |
| `npm run ingest:md` | Ingest 2nd-year markdown modules into Supabase |
| `npm run story:svg` | Regenerate the STORY.md charts from `assets/story/story-data.json` |
| `npm run story:check` | Assertion suite for the chart generator |
| `npm run social:check` | Validate an X-post batch's character counts against the 280-char limit |

## Repository layout

| Path | Contents |
|---|---|
| `app/` | Routes, pages, and API routes (App Router) |
| `assets/` | Source art and data — fonts, landmarks, STORY.md charts |
| `components/` | React components |
| `lib/` | Shared logic (payments, plans, quiz generation, share cards, …) |
| `hooks/` | React hooks |
| `content/modules/` | Markdown source content for course modules |
| `supabase/` | Migrations, seeds, and database docs |
| `scripts/` | Ingest and utility scripts |
| `docs/` | Specs, plans, GTM research, and handoff notes |

Deploys automatically to Vercel on push to `main`.
