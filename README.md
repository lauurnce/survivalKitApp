# BSIT Survival Kit

Study companion web app for BSIT (Bachelor of Science in Information Technology) students in the Philippines. Lessons are free to read; a one-time unlock adds practice drills, quizzes, in-app code labs, exam solutions, and progress tracking.

**Live:** https://survival-kit-app.vercel.app

**The story:** why this exists, the data behind it, and where it's going → [STORY.md](STORY.md)

## Where things stand (as of 2026-08-29)

- **Per-subject quiz system** shipped — quizzes now generate from an entire subject's content, not just one module, with device + account (`user_id`) progress tracking.
- **Per-module quiz system** shipped — dedicated quiz pages and cards per completed module, generated straight from that module's sections.
- **Navigation overhaul** — dashboard shell with a persistent nav rail now wraps subjects, resources, and roadmap; prefetching, revalidation, and middleware-skip work cut route transition time.
- **Roadmap redesign** — academic timeline with progress markers, an activity graph, and subscription timeline on its own page.
- **Profile dashboard** — context-rich profile page (school, year, sector) with a monochrome palette matching the subjects design.
- **In-app SQL labs** — self-hosted `sql.js` WASM with an executed-script + data-grid output view.
- Ongoing security/finance/ops/growth department reports (`npm run report:*`) audit RLS posture, route guards, revenue reconciliation, and funnel metrics on a recurring cadence.

### Data snapshot (live production, 2026-08-29)

| Metric | Count |
|---|---|
| Subjects | 36 |
| Years covered | 4 |
| Modules | 274 |
| Content sections | 1,602 |
| Tracked events | 186,114 |
| Registered accounts | 344 |
| Completed module progress records | 924 |
| Completed payments | 10 |
| Active subscriptions | 15 |
| Feedback submissions | 99 |
| Waitlist signups | 3 |

See [STORY.md](STORY.md) for the fuller narrative (device/university breakdowns, top subjects) as of its own last refresh.

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
| `assets/` | Source art and data — fonts, subject icons, landmarks, STORY.md charts |
| `components/` | React components |
| `lib/` | Shared logic (payments, plans, quiz generation, share cards, …) |
| `hooks/` | React hooks |
| `modules md files/` | Markdown source content for course modules |
| `supabase/` | Migrations, seeds, and database docs |
| `scripts/` | Ingest and utility scripts |
| `docs/` | Specs, plans, GTM research, and handoff notes |

Deploys automatically to Vercel on push to `main`.
