# BSIT Survival Kit — Agent Instructions

Read by Claude Code as `CLAUDE.md` and by opencode as `AGENTS.md`, which is a
symlink to this file. One source of truth, so the two can never drift.

## Commits

- Never add `Co-Authored-By` trailers to commit messages
- lauurnce is the sole *maintainer*, and every commit you write on his behalf
  is authored by him alone. He is no longer the only *contributor*: the repo
  has accepted external contributions (@mikeascendx, PRs #1–#20).
- Preserve external contributors' authorship. Never run `--reset-author` on a
  commit you did not author. When integrating a contributed PR, cherry-pick or
  merge it so their name stays on their own work, and add any changes of your
  own as separate follow-up commits.
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
- **opencode running? The hook asks you.** opencode does not run this hook, can
  edit main at any time, and this session cannot tell which project it is in —
  only you can. A second Claude session stays a hard refusal; that conflict is
  certain, so it outranks the question.
- **Worktrees live at `~/projects/survivalKitApp-<track>`.** Never a scratchpad,
  `/tmp`, or other volatile path — those get wiped and leave orphaned branches
  that make `git worktree list` lie.
- **Bootstrap before running anything.** A fresh worktree has no `.env.local`
  and no `node_modules` — both gitignored — so `npm run dev`, `npm test`, and
  every `scripts/db/*` command fail until you link them in.
- **Claim your files** in `~/projects/.survivalkit-claims.md` before editing, and
  delete your row when the branch is merged or abandoned.

**If you are opencode, no hook is enforcing any of this.** The hook is Claude
Code machinery; opencode never runs it and can edit the main checkout freely.
That makes following this protocol by hand your responsibility: check
`~/projects/.survivalkit-claims.md` before editing, and work in a worktree
whenever anyone else is active. Claude Code sessions ask before editing main
while an opencode process is alive, so an unannounced opencode edit is the one
collision nothing here can catch.

Only `Write`/`Edit` are gated, and only for Claude Code. Bash is not, so
`git commit`, merges, and pushes still work in main — but `HEAD` moves under
you, so re-check it before each one.

Full procedure and the audit steps: [docs/WORKTREES.md](docs/WORKTREES.md).

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues on `lauurnce/survivalKitApp`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context domain documentation layout. See `docs/agents/domain.md`.

## Contributed pull requests

- Fork PRs show a red "Vercel" check because Vercel blocks deploys from
  unauthorized forks. **Red X means CI never ran — not that the code is
  broken.** Verify locally or from a same-repo branch; never read those checks
  as test results.

## Environment

- Node is installed but off the default PATH. Prefix commands with
  `export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"`.
- `vercel env pull` writes the literal `[SENSITIVE]` for protected values,
  producing an invalid `NEXT_PUBLIC_SUPABASE_URL` and a 500 on every page via
  middleware. Copy `.env.local` from the main checkout instead.
- Multiple sessions share this repo; the Worktrees section above is the full
  policy, and `git rev-parse --abbrev-ref HEAD` is worth re-checking before
  every commit.
