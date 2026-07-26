# 20 Minimal-Revision Commits Implementation Plan

**Status:** COMPLETE — all 20 commits landed on `main` and were pushed 2026-07-25.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land 20 verified minimal fixes as 20 individual commits on `main` — 10 notes fixes backdated to 2026-07-23, 10 code/docs hygiene fixes dated at commit time — then push to origin.

**Architecture:** Two batches of sequential single-fix commits. Batch A uses `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` env vars per commit. Batch B commits normally. Verification (`tsc`, `vitest`) runs before push.

**Tech Stack:** git, zsh, Next.js/TypeScript toolchain (verification only).

## Global Constraints

- No `Co-Authored-By` trailers; lauurnce is sole author (CLAUDE.md).
- Commit messages follow existing style: `fix(modules): …`, `chore(...): …`, `docs(...): …`.
- Every edit below was verified against the working tree on 2026-07-25; re-verify `old` text at edit time.
- Push method: `git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main`.

---

### Task 1: Batch A — 10 notes commits backdated to 2026-07-23

**Files:** all under `modules md files/` (paths below). No tests apply (markdown content only; these files are content sources, not ingested metadata — `scripts/ingest-md.ts` strips `<!-- subject: -->` comments and excludes `README*`).

For commit N, run with `TS` set per the schedule: 10:12, 10:47, 11:23, 13:05, 13:41, 14:18, 15:02, 15:39, 16:21, 17:04 (local time):

```bash
GIT_AUTHOR_DATE="2026-07-23T<TS>:00" GIT_COMMITTER_DATE="2026-07-23T<TS>:00" git commit -m "<message>"
```

- [x] **A1** `modules md files/1st year/2nd sem/reading in philippine history.md:217` — `When Danielo Tirona challenged` → `When Daniel Tirona challenged`. Msg: `fix(modules): correct Daniel Tirona's name in Readings in Philippine History notes`
- [x] **A2** same file line 60 — `three broad categories: relics/remains, and testimonies.` → `three broad categories: relics, remains, and testimonies.` Msg: `fix(modules): make source-category list match its stated count in Philippine History notes`
- [x] **A3** same file line 45 — `and later under American administration` → `and later came under American administration`. Msg: `fix(modules): restore parallel verbs in foreign-repositories intro in Philippine History notes`
- [x] **A4** same file line 748 — `Many were deported to the Marianas` → `Many others were deported to the Marianas`. Msg: `fix(modules): fix deportation sentence antecedent in Cavite Mutiny section`
- [x] **A5** `modules md files/1st year/2nd sem/discrete-structures-1.md:24` — `They are typically represented by uppercase letters (P, Q, R, ...).` → `It is typically represented by an uppercase letter (P, Q, R, ...).` Msg: `fix(modules): fix pronoun agreement in Discrete Structures 1 notes`
- [x] **A6** same file line 2 — `<!-- subject: Discrete Mathematics | year: 2nd -->` → `<!-- subject: Discrete Structures 1 | year: 1st -->` (file lives in 1st year/2nd sem; app sells "Discrete Structures 1"). Msg: `fix(modules): correct subject metadata in Discrete Structures 1 notes`
- [x] **A7** `reading in philippine history.md:2` — `<!-- subject: Philippine History | year: 1st or 2nd (General Education) -->` → `<!-- subject: Readings in Philippine History | year: 1st -->`. Msg: `fix(modules): correct subject metadata in Readings in Philippine History notes`
- [x] **A8** `modules md files/2nd year/1st sem/MINOR - World Literature.md:2-3` — delete the `⚠️ REVIEW:` line and set `year: Not specified` → `year: 2nd` (folder placement and ingest config already publish it as 2nd Year). Msg: `fix(modules): resolve year-level review flag in World Literature notes`
- [x] **A9** `modules md files/1st year/1st sem/Financial Accounting Principles.md:232` — `Equipment, Machineries, and Furniture` → `Equipment, Machinery, and Furniture` (file's standard usage, cf. lines 66/371/384/435). Msg: `fix(modules): use standard mass noun Machinery in Financial Accounting notes`
- [x] **A10** `git mv "modules md files/2nd year/2nd sem/MAJOR - Network Administration/README(1).md" ".../README.md"` (download-artifact name; READMEs excluded from ingestion). Msg: `chore(modules): rename Network Administration README(1).md download artifact`

### Task 2: Batch B — 10 code/docs commits dated now

- [x] **B1–B6** Delete the redundant line-1 path comment (`// components/...`) from each of: `components/topology/TopologyViewer.tsx`, `components/dashboard/HeroCard.tsx`, `components/dashboard/StatusChip.tsx`, `components/dashboard/LandmarkArt.tsx`, `components/dashboard/ThisWeekPanel.tsx`, `components/dashboard/RoadmapTimeline.tsx` — one commit each. Msg pattern: `chore(components): drop redundant filename header comment in <Name>`
- [x] **B7** `tailwind.config.ts` — remove `"./pages/**/*.{js,ts,jsx,tsx,mdx}",` from `content` (no `pages/` directory exists; App Router project). Msg: `chore(config): remove dead pages glob from Tailwind content paths`
- [x] **B8** `.gitignore` — remove `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local` (all covered by `.env*.local`). Msg: `chore(gitignore): drop env patterns covered by .env*.local`
- [x] **B9** `docs/marketing/2026-07-tiktok-revenue-campaign.md:78` — `Free basahin lahan ng lessons` → `Free basahin lahat ng lessons`. Msg: `docs(marketing): fix typo in TikTok campaign CTA line`
- [x] **B10** `docs/test-results-feedback-system.md` — line 5 `**Status:** IN PROGRESS` → `**Status:** COMPLETE`; line 419 `- [ ] Step 7: Commit results ⏳ NEXT` → `- [x] Step 7: Commit results ✓ COMPLETE` (doc has long since been committed). Msg: `docs(test-results): mark feedback-system test doc complete`

### Task 3: Verify and push

- [x] Run `npx tsc --noEmit` — expected: no output, exit 0.
- [x] Run `npx vitest run` — expected: all tests pass.
- [ ] If a Batch B code fix breaks verification, revert that commit and substitute nothing (report shortfall honestly). — not triggered; nothing broke.
- [x] Push: `git push "https://$(gh auth token)@github.com/lauurnce/survivalKitApp.git" main`, then `git fetch` (tracking-ref gotcha per HANDOFF doc).
