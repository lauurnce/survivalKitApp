# BSIT Survival Kit — Claude Instructions

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
- Multiple Claude sessions share this repo and have collided before. Work in
  your own git worktree, and re-check `git rev-parse --abbrev-ref HEAD` before
  every commit.
