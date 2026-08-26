# Plan — rebase `chore/university-sector-audit` onto main (83f25f3)

Date: 2026-08-25 · Worktree: `~/projects/survivalKitApp-sectors` · Track owner: opencode-D4

## Track contents

Five commits, 2026-08-23, all authored by lauurnce, all appending to a single
new file `docs/sector-audit-findings.md` (57 lines final):

| commit | adds |
|---|---|
| `13a28be` | entries 1–10 (17 lines incl. header + rule preamble) |
| `5d66cb5` | entries 11–20 |
| `dc6d587` | entries 21–30 |
| `c033e26` | entries 31–40 |
| `afbd64b` | entries 41–50 |

The doc audits the sector classification of all 50 institutions in
`lib/universities.ts` against public sources (Wikipedia, lawphil), with a
current-vs-verified column pair, source links, and confidence.

Branch base: `fe5b0ba` (merge of the school/sector feature track). Main has
moved 159 commits ahead to `83f25f3`.

## Rebase plan

1. `npm install` first — package-lock changed on main (Next 16.3.2 bump,
   `chore/next-16-bump` merged as `3b833f9`), so gates must run against
   today's tree.
2. `git fetch origin && git rebase origin/main`. Expected clean: the branch
   touches exactly one file that does not exist on main.
3. Post-rebase content check (below), fix inline if needed.
4. Full gates: `npx tsc --noEmit`, `npx vitest run`, `npm run lint`,
   `npm run build`.

## Content check vs today's merges

Cross-checked every doc row against `lib/universities.ts` at `origin/main`
(name + sector, positional join, 50/50 rows):

- **Stale — row 15**: doc says "Universidad de Negros Oriental (UNO-R)";
  main's `91f8306` renamed the display name to "University of Negros
  Occidental – Recoletos" and demoted the old Spanish name to an alias. The
  doc's source URL already pointed at the correct article; only the name
  column lags. → fixed in a follow-up commit after rebase.
- **Reviewed, accepted — rows 9 & 37**: doc uses shorthand ("MSU – Iligan…",
  "USJ–R – Talavera Campus") where code spells out full names. Consistent
  with the doc's own style elsewhere (row 50 "MSU – Gen. Santos"); not stale,
  no fix.
- **Sectors**: all 50 verified sectors match current code. No drift from the
  class-code normalization (`5d9bad6`) or any other merge — those touched
  class codes, not university sectors.
- **Next 16 / growth migrations / waitlist banner removal**: the audit doc
  makes no claims about framework versions, DB state, or UI banners. Nothing
  to go stale.

## Result

Rebased cleanly onto `83f25f3` (no conflicts — single new file, absent from
main). One follow-up fix commit (`9392425`) aligns audit row 15 with main's
UNO-R display-name rename.

## Gates (post-rebase, node v24.18.0, Next 16.3.2 tree)

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean, 0 errors |
| `npx vitest run` | 117 files / **1470 passed** / 0 failed (9.87s) |
| `npm run lint` | eslint app components lib — 0 findings |
| `npm run build` | success; static + dynamic routes emitted, middleware compiled |

Note: first `npm install` pass left the tree incomplete (`resend` missing,
tsc/lint failing on TS2307); a second install added 32 packages and cleared
it. Worth remembering when bootstrapping this worktree after the lockfile
jump.

No push, no merge — ready for integration review.
