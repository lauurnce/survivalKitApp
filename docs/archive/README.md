# Archive

Docs that are finished with: plans and specs for features that have shipped,
handoffs for sessions whose work has merged, and one-off execution logs. They
stay here for history and for `git log --follow`. Nothing here describes
current work, and none of it is a source of truth for how the app works now.

Files keep the folder layout they had under `docs/`, so
`docs/superpowers/plans/X.md` is now `docs/archive/superpowers/plans/X.md`.

## What is here

| Path | What it was |
|---|---|
| `HANDOFF_PER_MODULE_QUIZ.md` | Handoff for the per-module quiz, a feature that has since been removed |
| `HANDOFF-2026-08-05.md`, `-08-10.md`, `-08-20.md` | Session handoffs from the department-agent and conversion work in August |
| `test-results-feedback-system.md` | Verification log for the July feedback system |
| `mockups/` | HTML mockups for the August survey, paywall and flow walkthrough |
| `plans/2026-08-26-*.md` | Mobile viewport fit, roadmap redesign, roadmap v2, subject back nav |
| `superpowers/plans/2026-06-*`, `2026-07-*` | Implementation plans for June and July features that are live |
| `superpowers/specs/2026-06-*`, `2026-07-*` | Design specs that went with those plans |
| `superpowers/plans/2026-08-2[35]-*` | One-off rebase, consolidation, migration and dependency-bump plans from late August |
| `superpowers/plans/2026-09-06-paymongo-reconcile-checkout-sessions.md` | Reconcile plan for Checkout Sessions purchases (shipped in PR #79) |
| `superpowers/plans/SESSION_HANDOFF.md`, `superpowers/reports/task-*.md` | Session handoff and per-task reports from subagent runs |

## Reading archived docs

Paths written inside these files point to where things were when the doc was
written. Many of those paths have moved since: other docs are now in this
archive, and course content moved from `modules md files/` to
`content/modules/`. Branch names, worktree paths and commit hashes describe
state at the time and are mostly gone.

## Kept out of the archive on purpose

Some older docs are still referenced by code or agents, so they stay where
they are:

- `docs/superpowers/plans/2026-06-15-security-hardening.md`, read by the
  security baseline in `lib/reports/securityBaseline.ts`
- `docs/superpowers/plans/2026-08-25-ledger-gap-ruling.md`, cited by
  `lib/reports/ledgerIntegrity.ts` as the basis for a known ledger exception
- `docs/superpowers/specs/2026-07-14-university-landmark-dashboard-design.md`,
  cited by `lib/universities.ts`
- `docs/superpowers/specs/2026-08-04-department-agents-design.md`, cited by
  the FOREMAN agent definition
- `docs/superpowers/specs/2026-06-23-mvp-monetization-and-go-signal-design.md`
  and `2026-07-25-august-conversion-package-design.md`, still the reference
  for pricing and conversion decisions

## Adding to it

Use `git mv` so history follows the file, keep the path it had under `docs/`,
add a row above, and fix any live doc or agent definition that linked to it.
