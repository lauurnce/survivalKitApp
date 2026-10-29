# Domain docs

This repository uses a single-context domain documentation layout: one app,
one domain, no per-package contexts.

There is no `CONTEXT.md` glossary and no `docs/adr/` directory. Don't go
looking for them, and don't create them unless the owner asks. Domain
knowledge and recorded decisions live in the files below.

## Before exploring

Read whichever of these touch the area you're changing:

- `README.md` for what the product is, the stack, and the repo layout.
- `STORY.md` for who it's for and why it exists.
- `docs/gtm/` for the audience (`user-personas-icp.md`), the academic calendars
  that drive semester access (`academic-calendars-ay2026-27.md`), and the
  go-to-market plan.
- `docs/superpowers/specs/` for design decisions on features that are still
  being built on. These are the closest thing to ADRs here.
  `2026-06-23-mvp-monetization-and-go-signal-design.md` and
  `2026-07-25-august-conversion-package-design.md` set pricing and
  conversion; `2026-08-04-department-agents-design.md` sets up the
  department agents.
- `docs/plans/` for work that is planned or open.

`docs/archive/` holds shipped plans and old handoffs. It's history, not current
truth, so read it only to learn why something was done.

## Use the codebase's vocabulary

Use the terms the code and the specs above already use when naming domain
concepts in issues, proposals, hypotheses, and tests: subject, module,
section, unlock, subscription, semester access, sector, and so on. Check
`lib/` and the specs for an existing term before you invent one.

## Flag decision conflicts

If a change contradicts a decision recorded in a spec under
`docs/superpowers/specs/`, say so explicitly. Don't silently override it.
