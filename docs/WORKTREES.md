# Worktrees — parallel sessions without collisions

**Rule: one editor in the main checkout at a time. Everyone else gets a worktree.**

A solo session edits the main checkout normally — spinning up a worktree for a
one-line fix is overhead nobody wants. The rule engages the moment a second
editor shows up, because that is where collisions actually come from.

## Why this exists

More than two sessions running against this repo at once used to break in three
specific ways:

1. **Git index and HEAD fights.** Two sessions in the same checkout — one
   commits or switches branches, and the other's `HEAD` moves underneath it
   mid-edit. `index.lock` errors, work committed onto the wrong branch, changes
   that vanish on the next checkout.
2. **Missing `.env.local` and `node_modules`.** Both are gitignored, so a
   worktree created with a bare `git worktree add` has neither. Every
   `npm run dev`, `npm test`, and `scripts/db/*` invocation fails there until
   they're linked in — which reads as a broken repo rather than a missing step.
3. **Branch and merge collisions.** Two tracks editing the same file with no
   way to see each other, discovered only at PR time. PR #20 and PR #23 both
   rewrote `app/api/subscribe/route.ts` from separate sessions; one had to be
   thrown away.

Worktrees fix (1). The bootstrap step fixes (2). The claims file fixes (3).

## Who has to use a worktree

`.claude/hooks/block-main-checkout.sh` runs before every `Write`/`Edit` and
decides. It records a heartbeat per session in `~/.claude/survivalkit-sessions/`
and reads it back:

| Situation | Main checkout |
|---|---|
| You are the only session editing | **Allowed** — edit freely, no worktree |
| Another Claude session claimed it in the last 60 min | **Blocked** — use a worktree |
| An `opencode` process is running | **Blocked** — use a worktree |
| The path is under `.claude/` | Always allowed (see below) |
| The path is in a sibling worktree | Always allowed |

**The incumbent keeps main.** Whoever edits first holds it; latecomers are the
ones who move. Evicting a session mid-edit would be worse than letting it finish.
A claim goes stale after 60 minutes, so a crashed session does not hold main
forever — and a denied session never claims it.

**Only sessions that edit register.** A session that is merely reading never
claims main, which is correct: reads do not collide.

Two gaps this does not close, by design:

- **opencode is ungovernable.** It does not run Claude Code hooks, so it can edit
  main whenever it likes. Claude Code sessions yield to it rather than race it —
  a blunt rule, since the hook cannot tell which project opencode is in.
- **Merges still move `HEAD`.** Only `Write`/`Edit` are gated; Bash is not. A
  merge into main from any worktree still shifts `HEAD` under everyone. Re-check
  it before each commit.

**Escape hatch:** edits under `.claude/` are always allowed. A broken hook must
never lock every session out of the file needed to repair it.

## Layout

| Path | Role |
|---|---|
| `~/projects/survivalKitApp` | **Main checkout.** Always on `main`, always clean. Read + merge + push only. Never edit here. |
| `~/projects/survivalKitApp-<track>` | **Worktrees.** One per session. All feature work happens here. |
| `~/projects/.survivalkit-claims.md` | **Claims file.** Live registry of who owns what. Outside the repo, never committed. |

`<track>` is a short noun for the work: `emails`, `dash`, `schema`, `trunk`.
Not a session id, not a date.

**Never put a worktree in `/tmp`, a session scratchpad, or any other volatile
path.** Those directories get wiped while the branch survives, so
`git worktree list` keeps reporting a worktree that is no longer there.

## Creating a worktree

From the main checkout. Four steps — the last two are not optional.

```sh
cd ~/projects/survivalKitApp
git fetch origin

# 1. Create the worktree and its branch off current main
git worktree add ~/projects/survivalKitApp-<track> -b <type>/<description> origin/main

cd ~/projects/survivalKitApp-<track>

# 2. Link the environment (gitignored — the worktree has none)
ln -s ~/projects/survivalKitApp/.env.local .env.local

# 3. Link dependencies (gitignored — instant, zero disk cost)
ln -s ~/projects/survivalKitApp/node_modules node_modules

# 4. Verify the lockfile matches; if it differs, install for real
if ! diff -q package-lock.json ~/projects/survivalKitApp/package-lock.json >/dev/null; then
  rm node_modules && npm install
fi
```

Then register your claim (see below) before the first edit.

A symlinked `node_modules` is correct only while the branch leaves
`package.json` alone. Step 4 catches the case where it doesn't. If you *add or
bump a dependency mid-branch*, drop the symlink and run a real `npm install` in
the worktree at that moment — otherwise you silently install into the main
checkout's tree and every other worktree inherits it.

If `node` is missing from `PATH` in a fresh shell:

```sh
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
```

## Entering an existing worktree

```sh
git worktree list                      # what exists, and on which branch
cd ~/projects/survivalKitApp-<track>
git status                             # confirm the branch and a clean tree
ls -l .env.local node_modules          # confirm both symlinks resolve
```

If either symlink is missing or dangling, re-run steps 2–4 above. If the
worktree is on an unexpected branch or has uncommitted work you don't
recognise, **stop** — another session may own it. Check the claims file.

## The claims file

`~/projects/.survivalkit-claims.md` lives outside the repo on purpose: it is
never committed, so it can never cause a merge conflict, and every worktree on
this machine reads the same copy.

**Protocol:**

1. **Read it** at session start, and again before touching any file outside
   your own claimed globs.
2. **Append your row** before your first edit.
3. **Update `status`** as the work moves — `active`, `review`, `merging`.
4. **Delete your row** when the branch is merged or abandoned. A stale row is
   worse than no row; it makes other sessions route around work that's done.

Claim the narrowest globs that cover your work. `app/api/subscribe/route.ts`
tells another session something useful. `**/*` does not.

## When two tracks need the same file

Whoever claimed it first owns it. The second session picks one of:

- **Wait** — if the first track is close to merging, take a different task.
- **Narrow** — split the file so each track owns a distinct piece, and claim
  the pieces separately.
- **Sequence** — let the first branch merge to `main`, then rebase onto it and
  claim the file.

What you must *not* do is edit it anyway. That is exactly how PR #20 and PR #23
became mutually exclusive rewrites of the same route.

## Merging back

Integration happens in the **main checkout**, and only for branches that are
already reviewed:

```sh
cd ~/projects/survivalKitApp
git fetch origin && git status          # confirm clean, on main, up to date
gh pr checks <n>                        # or: run the suite in the worktree first
gh pr merge <n> --merge
git pull
```

Then, in your worktree, delete your claims row and remove the worktree if the
track is finished.

Because other sessions merge into `main` too, **re-check `HEAD` immediately
before any merge or push.** Main moves underneath you.

## Auditing

`git worktree list` reports what git *believes* exists. Check that against the
filesystem:

```sh
git worktree list --porcelain | awk '/^worktree /{print $2}' | while read -r p; do
  [ -d "$p" ] && echo "ALIVE  $p" || echo "GONE   $p"
done
```

- `GONE` entries are orphans — the directory was deleted without git being
  told. Clear them with `git worktree prune`. This removes only git's
  bookkeeping; **no branch and no commit is touched.**
- `ALIVE` entries in a volatile path (`/tmp`, `/private/var/folders`, a session
  scratchpad) are orphans-in-waiting. Migrate them to
  `~/projects/survivalKitApp-<track>` or remove them.

## Removing a worktree

`prune` only cleans up already-deleted directories. To retire a live one:

```sh
cd ~/projects/survivalKitApp
git worktree remove ~/projects/survivalKitApp-<track>   # refuses if work is uncommitted
git branch -d <type>/<description>                      # only once merged
```

Check for unmerged work first — `git -C <path> status` and
`git log origin/main..<branch>` — and never remove a worktree that another
session's claims row still points at.

### Cleanup log

**2026-08-23** — audited 11 worktrees down to 7.

Removed (fully merged, clean, nothing lost): `wt-pr20`
(`fix/rate-limit-payment-safe`, merged as `e42fd54`), `wt-ci`
(`chore/ci-postgres-harness`), `integrate` (`integrate/mike-fixes`), and
`survivalKitApp-schema` (`chore/schema-safety`). Their branches were left in
place and can be deleted with `git branch -d` once you're satisfied.

Rescued: `feat/dual-secret-transition` (2 commits) and
`chore/university-sector-audit` (5 commits) were sitting in auto-wiped `/tmp`
paths with no remote copy. Both pushed to `origin`. **Their worktrees are still
on volatile paths and still need migrating** to
`~/projects/survivalKitApp-secrets` and `-sectors`.

Still outstanding:

- `wt-ratelimit` (`fix/rate-limit-payment-exempt`) — its one commit is the
  obsolete third rate-limit approach superseded by PR #23, but it holds two
  unreviewed uncommitted edits to `lib/serverRateLimit.ts` and its test. Review
  before removing.
- `survivalKitApp-emails` — branch is merged, but `docs/HANDOFF-2026-08-23-emails.md`
  is untracked and would be lost, and `supabase/.temp/` holds database
  credentials that must be deleted, never committed.
- `survivalKitApp-dash`, `-preview`, `-trunk` — 5 unmerged commits between
  them. Live work; leave alone.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `fatal: '<branch>' is already checked out at ...` | Two worktrees, one branch. | Use the existing worktree, or branch off it. |
| `Cannot lock ref` / `index.lock exists` | Two processes in one checkout. | Confirm no other session is in that directory; remove the lock only if none is. |
| `Missing Supabase env` / undefined env at runtime | `.env.local` symlink missing. | Re-run bootstrap step 2. |
| `Cannot find module 'next'` | `node_modules` symlink missing. | Re-run bootstrap step 3. |
| Tests pass in one worktree, fail in another | Lockfiles diverged. | Re-run bootstrap step 4. |
| `HEAD` moved during your work | Another session merged to `main`. | Expected. `git fetch` and rebase; never edit in the main checkout. |
