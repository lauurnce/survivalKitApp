# BSIT Survival Kit — Claude Instructions

## Commits

- Never add `Co-Authored-By` trailers to commit messages
- The user (lauurnce) is the sole contributor on all commits
- Use `gh auth token` piped into the remote URL when pushing via HTTPS

## Worktrees — mandatory for every session

Several sessions run against this repo at the same time. When two of them work
in the same checkout they fight over `HEAD`, the index, and each other's edits,
and neither one can see what the other is doing. The fix is one worktree per
session, plus a claims file they all read.

- **Never edit in `/Users/lauurnce/projects/survivalKitApp`.** The main checkout
  stays on `main` and stays clean. Read it, merge reviewed branches into it,
  push from it — nothing else. No feature work, ever.
- **First action of every session:** create or enter a worktree at
  `~/projects/survivalKitApp-<track>`. Never a scratchpad, `/tmp`, or other
  volatile path — those get wiped and leave orphaned branches that make
  `git worktree list` lie.
- **Bootstrap before running anything.** A fresh worktree has no `.env.local`
  and no `node_modules` — both are gitignored — so `npm run dev`, `npm test`,
  and every `scripts/db/*` command fail until you link them in.
- **Claim your files before the first edit** in `~/projects/.survivalkit-claims.md`,
  and delete your row when the branch is merged or abandoned.
- **Read the claims file before touching a shared file.** If a live track already
  owns it, coordinate — do not edit in parallel and hope the merge works out.

Full procedure, bootstrap commands, and the audit steps:
[docs/WORKTREES.md](docs/WORKTREES.md).
