# Dash track rebase onto main @ 83f25f3 — living plan

Worktree: `~/projects/survivalKitApp-dash` · branch `feat/admin-dashboard-phase2`
Session: opencode-D1 · date: 2026-08-26

## State at start

- Branch ahead 2 / behind 142 of `origin/main`. Merge-base `8f7380f`.
- Track commits (both authored `lauurnce`, no trailers):
  1. `99f3658` fix(admin): say devices, not users, everywhere on the dashboard
     — `components/AdminDashboard.tsx` (+4 relabels incl. volume note),
     `components/AdminDashboard.test.tsx` (guard test).
  2. `9ebce41` feat(admin): add the content-exit aggregate
     — `supabase/migrations/20260821000001_dash_exit_agg.sql` +
     `.test.md` checklist. No identity function (reuses growth_identity_agg
     conventions); revoke/grant pairs inline; uncapped total_groups.
- Intent source: `docs/superpowers/plans/2026-08-20-admin-dashboard-v2.md`
  (Task 8 copy half + Task 5 exit-aggregate half, the no-migration-first ruling).
- Main moved under us: Next 16.3.2 era, admin surfaces got school-type
  segmentation (`f0a2a7b`) and chart-overlap fix (`56c731a`) touching the same
  two component files; `app/admin/page.tsx` + `RepDashboard.tsx` carry Next 16
  react-hooks suppressions (not touched by this track).

## Steps

1. Recon (done): track files vs main-side admin files identified above.
2. This doc committed before any mutation.
3. `npm install` to sync the stale pre-Next-16 `node_modules` to today's lockfile.
4. `git fetch origin && git rebase origin/main`; resolve conflicts preserving
   BOTH intents — newer-main behaviour wins where semantically entangled,
   this track layers on top. Each call logged below.
5. Full gates after rebase and after every fix until green:
   `npx tsc --noEmit` · `npx vitest run` · `npm run lint` · `npm run build`.
6. Stop at clean tree, ready for cross-review. NO push, NO merge.

## Conflict log

| file | main-side commits | resolution |
|---|---|---|

(to be appended during step 4)

## Gate log

| run | tsc | vitest | lint | build |
|---|---|---|---|---|

(to be filled with exact numbers)

## Cross-track dependency note

`feat/admin-dashboard-preview` (worktree `-preview`) touches only
`app/dashboard-preview/page.tsx` and the shared v2 plan doc — zero file
overlap with this track. Neither branch blocks the other; order-free merge,
modulo trivial plan-doc adjacency.
