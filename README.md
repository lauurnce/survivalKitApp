# BSIT Survival Kit

Study companion web app for BSIT (Bachelor of Science in Information Technology) students in the Philippines. Lessons are free to read; a one-time unlock adds practice drills, quizzes, in-app code labs, exam solutions, and progress tracking.

**Live:** https://survival-kit-app.vercel.app

**The story:** why this exists, the data behind it, and where it's going → [STORY.md](STORY.md)

## Stack

- **Next.js** (App Router) + **React** + **Tailwind CSS**
- **Supabase** — Postgres, auth, RLS
- **PayMongo** — one-time payment links (GCash-friendly)
- **Vitest** — unit tests · **Pyodide / CodeMirror / Vercel Sandbox** — in-app code labs

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

## Repository layout

| Path | Contents |
|---|---|
| `app/` | Routes, pages, and API routes (App Router) |
| `components/` | React components |
| `lib/` | Shared logic (payments, plans, quiz generation, share cards, …) |
| `hooks/` | React hooks |
| `modules md files/` | Markdown source content for course modules |
| `supabase/` | Migrations, seeds, and database docs |
| `scripts/` | Ingest and utility scripts |
| `docs/` | Specs, plans, GTM research, and handoff notes |

Deploys automatically to Vercel on push to `main`.
