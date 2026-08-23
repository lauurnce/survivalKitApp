# BSIT Survival Kit — Claude Instructions

## Commits

- Never add `Co-Authored-By` trailers to commit messages
- The user (lauurnce) is the sole contributor on all commits
- Use `gh auth token` piped into the remote URL when pushing via HTTPS

## Worktrees — required once a second session appears

Several sessions run against this repo at the same time. When two of them edit
the same checkout they fight over `HEAD`, the index, and each other's changes,
and neither can see what the other is doing.

One editor at a time is the rule, not one worktree per session:

- **Alone? Edit the main checkout normally.** A worktree for a one-line fix is
  overhead nobody wants. A `PreToolUse` hook
  (`.claude/hooks/block-main-checkout.sh`) tracks who is editing and gets out of
  your way when you are the only one.
- **Second session? You go to a worktree.** The hook refuses edits in the main
  checkout while another session holds it, and prints the recipe. Whoever got
  there first keeps main — a session mid-edit is never evicted. A claim goes
  stale after 60 minutes, so a crashed session does not hold main forever.
- **opencode running? Claude yields.** opencode does not run this hook and can
  edit main at any time, and this session cannot tell which project it is in.
- **Worktrees live at `~/projects/survivalKitApp-<track>`.** Never a scratchpad,
  `/tmp`, or other volatile path — those get wiped and leave orphaned branches
  that make `git worktree list` lie.
- **Bootstrap before running anything.** A fresh worktree has no `.env.local`
  and no `node_modules` — both gitignored — so `npm run dev`, `npm test`, and
  every `scripts/db/*` command fail until you link them in.
- **Claim your files** in `~/projects/.survivalkit-claims.md` before editing, and
  delete your row when the branch is merged or abandoned.

Only `Write`/`Edit` are gated. Bash is not, so `git commit`, merges, and pushes
still work in main — but `HEAD` moves under you, so re-check it before each one.

Full procedure and the audit steps: [docs/WORKTREES.md](docs/WORKTREES.md).
