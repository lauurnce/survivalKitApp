# Preview Track Rebase onto Next 16 Main — Plan

**Date:** 2026-08-25
**Worktree:** `~/projects/survivalKitApp-preview`
**Branch:** `feat/admin-dashboard-preview`
**Session:** opencode-D2 (claimed in `~/projects/.survivalkit-claims.md`)
**Fork point:** `9e169f1`
**Rebase target:** `origin/main` = `83f25f3` (Next 16.3.2)

## What this branch carries

Two commits, disjoint files:

1. `0caa87b` — `docs(plans): implementation plan for admin dashboard v2`
   adds `docs/superpowers/plans/2026-08-20-admin-dashboard-v2.md` (original draft).
2. `5edd7c7` — `mockup: admin dashboard v2 preview route`
   adds `app/dashboard-preview/page.tsx` (324 lines, hardcoded numbers,
   deliberately outside the `/admin` guard).

## Expected conflicts and resolutions

### 1. `docs/superpowers/plans/2026-08-20-admin-dashboard-v2.md` — ADD/ADD

Main landed the same plan independently (`ee7ad93`) and then revised it
(`39ba9db`: owner's 2026-08-21 no-migration-first sequencing ruling, revised
execution-order table, Tasks 13–14 feedback amendments).

Diffed both blobs before rebasing: main's blob `41a68bd` vs this branch's copy
differs by exactly ONE line unique to the branch — the superseded
"three layers bottom-up" Architecture paragraph that main's revision replaced.
Main's version is a strict superset.

**Resolution: take main's version wholesale (`--ours` during rebase — note the
role inversion: in a rebase, ours = the new base). Nothing is lost; the branch
copy predates the owner ruling.**

Rationale recorded here per the newer-main-behavior rule.

### 2. `app/dashboard-preview/page.tsx` — clean

Path absent from main's tree. Expect a clean add. If Next 16 type/lint rules
reject anything in it, fix forward in a follow-up commit rather than editing
the historical commit's intent.

## Procedure

1. Commit this plan document.
2. `npm install` against the current lockfile (worktree has a real
   `node_modules`, ~500MB, not a symlink).
3. `git fetch origin && git rebase origin/main`.
4. Resolve the single expected conflict per above; verify with
   `git diff 41a68bd HEAD -- <doc>` empty afterwards.
5. Re-run `npm install` post-rebase so `node_modules` matches main's
   next@16.3.2 lockfile.
6. Full gates: `npx tsc --noEmit` · `npx vitest run` · `npm run lint` ·
   `npm run build`. Record exact numbers.
7. Stop. No push, no merge.

## Dependency question: preview vs dash ordering

Method: compare true touched-file sets (each branch vs ITS OWN merge-base with
origin/main, not the two-dot tree diff, which is polluted by main-side drift).

- preview (this branch): `docs/superpowers/plans/2026-08-20-admin-dashboard-v2.md`,
  `app/dashboard-preview/page.tsx`
- dash (`feat/admin-dashboard-phase2`, base `8f7380f`):
  `components/AdminDashboard.tsx`, `components/AdminDashboard.test.tsx`,
  `supabase/migrations/20260821000001_dash_exit_agg.sql`,
  `supabase/migrations/20260821000001_dash_exit_agg.test.md`

Intersection: **empty**. Neither track touches `app/admin/page.tsx` or
`components/dashboard/*` (today's PR #24 polish surface), so three-way overlap
with main-today is empty too.

Soft coupling, not a blocker: the mockup COPIES chart primitives from
`AdminDashboard.tsx` instead of importing them (deliberate, so the proposed
BarChart sits beside the current one). Dash edits the real `AdminDashboard`;
after both land, the mockup's copies drift from their source. Cosmetic only —
nothing at build, type, or test time links them.

**Recommendation: independent — either merge order compiles and passes gates.
If a tiebreak is wanted: land dash (phase2) first, preview second**, so the
mockup merges after the real dashboard it mirrors and any primitive refresh
happens once, on top of final code.

## Risks / flags for the owner

1. The mockup commit message says "This branch must not be merged or deployed."
   That was true when written (throwaway visual probe). Merging supersedes it;
   the message should be amended or accepted knowingly at merge time — not
   silently rewritten during this rebase.
2. `/dashboard-preview` is intentionally outside the `/admin` auth guard. With
   invented data that was acceptable as a local probe; merged and deployed it
   becomes a public route showing plausible-but-fake product numbers. Consider
   guarding it (or robots/noindex) before the deploy that follows the merge.
3. The plan doc on main already contains the owner ruling that NOTHING may
   render invented data on the real dashboard. The mockup is all invented data.
   Keeping the two apart in review matters: the mockup must never be mistaken
   for phase-1 output.
