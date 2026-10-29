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

`git rebase origin/main` completed with **zero textual conflicts** (auto-merge).
Semantic verification replaced hand-resolution:

| surface | main-side change | track change | call |
|---|---|---|---|
| `components/AdminDashboard.tsx` | school-type segmentation `f0a2a7b`, chart-overlap fix `56c731a` | devices-not-users relabels `d68e90e` | Auto-merged disjoint hunks. Audited post-rebase: main's tiles/sections intact AND all four track relabels intact. No entanglement found. |
| `components/AdminDashboard.test.tsx` | same two commits (+88 lines) | guard test `d68e90e` | Same — both suites coexist, fixture gained `by_school_type`. |
| `app/admin/page.tsx`, `RepDashboard.tsx` | Next 16 react-hooks suppressions | *not touched by track* | No overlap possible; suppressions preserved as-is. |
| DAU tooltip L370, funnel drop marker L418, profiles empty state L839 | pre-dated merge-base (L353/401/818), carried through by main unchanged | constraint said "users banned in dashboard copy" but original commit missed these | **Follow-up `b89db74`**: device/devices for the two device-count surfaces (their own subtitles say "unique devices"), accounts for the profile-completer empty state. Guard extended: hover test forces the tooltip into the scan; zero-profiles render covers the empty state. Newer-main behavior untouched — only nouns changed. |

## Gate log

Node v24.18.0 · next 16.3.2 (lockfile synced via two `npm install` runs).

| run | state | tsc --noEmit | vitest run | npm run lint | npm run build |
|---|---|---|---|---|---|
| 1 | pure rebase, before follow-up | clean (exit 0) | **117 files, 1471/1471** | exit 0 | exit 0 |
| 2 | final (after `b89db74`) | clean (exit 0) | **117 files, 1473/1473** | exit 0 | exit 0 |

(+2 = the two new guard cases in `AdminDashboard.test.tsx`.)

## Verdict

**READY** for cross-review and merge. Tree clean, 4 commits ahead of
`origin/main` (`83f25f3`), no push performed per instructions.


## Cross-track dependency note

`feat/admin-dashboard-preview` (worktree `-preview`) touches only
`app/dashboard-preview/page.tsx` and the shared v2 plan doc — zero file
overlap with this track. Neither branch blocks the other; order-free merge,
modulo trivial plan-doc adjacency.
