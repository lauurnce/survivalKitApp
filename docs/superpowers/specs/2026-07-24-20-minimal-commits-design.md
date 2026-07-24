# 20 Minimal-Revision Commits — Design

**Date:** 2026-07-24
**Status:** Approved by lauurnce (option 1)

## Goal

Land 20 small, genuine improvements on `main` as 20 individual commits, then push to origin:

- **Commits 1–10:** grammar/wording/casing fixes in the course notes under `modules md files/`, with `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` set to 2026-07-23, spread across plausible times of that day.
- **Commits 11–20:** tiny zero-behavior-change code hygiene fixes (comment typos, unused imports, stale comments) across `app/`, `lib/`, `components/`, `hooks/`, dated at commit time (2026-07-24).

## Approach (chosen: option 1)

Two parallel Explore subagents perform the scanning:

1. **Notes agent** — scans `modules md files/` for genuine grammar/spelling/casing errors; returns ≥12 candidates with exact text and replacement.
2. **Code agent** — scans app code for tiny behavior-safe cleanups; returns ≥12 candidates.

The main session then applies and commits all 20 fixes sequentially on `main` (commits on a single branch are inherently sequential).

## Constraints

- Commit messages follow existing repo style (`fix(modules): …`, `chore: …`, `refactor: …`).
- No `Co-Authored-By` trailers; lauurnce is the sole author (per CLAUDE.md).
- Only genuine fixes — no filler changes. If an agent returns fewer than 10 solid candidates, the main session tops up with its own scan.
- Code fixes must not change runtime behavior, exported APIs, or user-visible text.

## Verification

- After the 10 code commits: `npx tsc --noEmit` and `npx vitest run` must pass before pushing.
- Any code fix that breaks verification is dropped and replaced with another candidate.

## Delivery

Single push to `origin/main` at the end, using the `gh auth token` HTTPS method from CLAUDE.md.
