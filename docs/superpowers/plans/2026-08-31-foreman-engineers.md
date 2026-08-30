# FOREMAN Engineers (Mason, Medic, Sentry) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define three Claude Code subagents — Mason (feature builder), Medic (bugfix specialist), Sentry (QA/release gate) — that consume FOREMAN's triage output and carry a `ready-for-agent` issue through to a reviewable, mergeable PR without ever touching `main` directly.

**Architecture:** Each is a `.claude/agents/<name>.md` file — YAML frontmatter plus a Markdown prompt body — following the exact structural pattern already established by `pulse.md` and `herald.md` in this repo (frontmatter → H1 department header → scope/write-boundary section → numbered `## Step N —` sections → escalation or "what you are not" → common-mistakes table). Mason and Medic both do code work, so both must obey this repo's worktree protocol (`docs/WORKTREES.md`) for every change: their own sibling worktree, `.env.local`/`node_modules` symlinks, a claims-file row. Sentry does no code work — it only runs checks against an already-open PR and reports — so it is the one agent here that gets no `Write`/`Edit` grant. FOREMAN (planned/implemented separately) is the intake point: it applies one of the 5 canonical triage labels to each GitHub issue and, for anything it marks `ready-for-agent`, leaves a structured comment naming which of Mason or Medic should pick it up. This plan treats that comment's exact shape as a contract both sides must honor.

**Tech Stack:** Claude Code custom subagents (frontmatter + Markdown), `gh` CLI for all GitHub issue/PR operations (no dedicated GitHub MCP tool is used anywhere else in this repo's agents), git worktrees per `docs/WORKTREES.md`, the already-installed `pr-review-toolkit` plugin (`code-reviewer`, `silent-failure-hunter`, `pr-test-analyzer`) for Sentry's actual review logic.

**Spec:** n/a — design agreed in conversation with the project owner; full rationale is in Architecture above and the interface contract below.

## Global Constraints

- Exact triage label strings (from `docs/agents/triage-labels.md`): `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
- All GitHub operations target `lauurnce/survivalKitApp` explicitly via `--repo` (per `docs/agents/issue-tracker.md`) — never rely on the ambient remote, since forks of this repo exist.
- Mason and Medic edit code only inside their own worktree (`~/projects/survivalKitApp-<track>`), never the main checkout — CLAUDE.md's worktree rule, enforced for human/Claude sessions by `.claude/hooks/block-main-checkout.sh`, but agents must follow it by convention regardless of whether the hook happens to catch them.
- No `Co-Authored-By` trailer in any commit. Never `--reset-author` on a commit authored by an external contributor (CLAUDE.md).
- `gh auth token` piped into the remote URL when pushing via HTTPS (CLAUDE.md).
- Each agent keeps its own gitignored, dated, diff-based run log at `docs/reports/<agent-name>/<YYYY-MM-DD>.md`, reading the previous entry first — same pattern as `pulse.md` Step 1.
- Node is off default `PATH`; prefix any command that needs it with `export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"`.
- `pr-review-toolkit` is confirmed installed as a plugin (`~/.claude/plugins/cache/claude-plugins-official/pr-review-toolkit`), not a repo file — Sentry invokes it by its documented agent names (`pr-review-toolkit:code-reviewer`, `pr-review-toolkit:silent-failure-hunter`, `pr-review-toolkit:pr-test-analyzer`); nothing to build for that part.

---

## Interface contract with FOREMAN (read before any task below)

**Reconciled against the actual implementation** — `.claude/agents/foreman.md` Step 5 and `docs/superpowers/plans/2026-08-31-foreman-agent.md` landed in this same worktree with a different shape than this plan originally assumed (a 3-line `FOREMAN ROUTE:`/`PRIORITY:`/`REASON:` block). The real one is a single-line `gh issue comment`:

```
FOREMAN: ready-for-agent · <P0|P1|P2|P3> · routes to <Mason|Medic|Sentry> once built — <one-line reason>.
```

Mason and Medic each find their queue by listing `ready-for-agent` issues and filtering to the most recent comment containing the fixed substring `routes to Mason once built` (Mason) or `routes to Medic once built` (Medic) — a plain substring match (`grep -F`), not a `^...$`-anchored line match against a dedicated `ROUTE:` field. Priority is extracted from the same comment with `grep -oE 'P[0-3]'` (first match), not a separate `PRIORITY:` field.

**Open gap, not resolved in this pass:** FOREMAN's third routing target is `Sentry`, for issues that are "test-coverage/QA gap only, no product-code change" — but Task 3 below scopes Sentry as PR-only (`tools:` has no `Write`/`Edit`, and its "Consumes" is open PRs, never issues). An issue FOREMAN routes to Sentry has nowhere to land as designed: Sentry can't write the missing test without a code-writing grant it deliberately doesn't have. Whoever builds Sentry for real needs to pick one: give Sentry a narrow `Write`/`Edit` grant limited to test files, or have FOREMAN send coverage-only issues to Mason instead and drop Sentry as an issue-routing target entirely (keeping it PR-only). Flagging here rather than picking silently.

---

## Task 1: Mason — feature builder

**Files:**
- Create: `.claude/agents/mason.md`
- Verify: manual dry-run of the `gh issue list` query below against the live repo (no automated test harness exists for agent prompt files in this repo)

**Interfaces:**
- Consumes: GitHub issues labeled `ready-for-agent` carrying a comment matching `routes to Mason once built` (contract above).
- Produces: a worktree with committed work, an open PR referencing the issue, a comment on the issue with the PR URL. Sentry (Task 3) later consumes the PR this produces.

- [ ] **Step 1: Ground the prompt in the real conventions**
  Read `docs/WORKTREES.md`'s "Creating a worktree" section and `docs/agents/issue-tracker.md` in full before writing — Mason's prompt should cite these by name rather than re-deriving the `git worktree add` / `gh issue` commands from memory, so it never drifts from the canonical version.

- [ ] **Step 2: Write the frontmatter**

```yaml
---
name: mason
description: Feature builder. Use when a GitHub issue is labeled ready-for-agent and routed to mason by FOREMAN — implements the feature end-to-end in an isolated worktree and opens a PR.
tools: Bash, Read, Write, Edit, Glob, Grep
---
```

- [ ] **Step 3: Write the body**

  - `# MASON · Feature Builder` H1, opening with one line: Mason only ever edits inside its own worktree, never the main checkout.

  - `## Step 1 — Find your assignment`
    ```sh
    gh issue list --repo lauurnce/survivalKitApp --label ready-for-agent --state open \
      --json number,title,body,comments
    ```
    Filter to issues whose most recent comment's body contains the fixed substring `routes to Mason once built` (`grep -F`, not fuzzy matching — the contract above is exact). Pull the priority from the same comment with `grep -oE 'P[0-3]'`; work the lowest-numbered priority first (P0 before P1 before P2...).

  - `## Step 2 — Claim a worktree`
    Read `~/projects/.survivalkit-claims.md` first. Pick a short `<track>` name from the issue title. Run the 4-step bootstrap from `docs/WORKTREES.md` verbatim: `git worktree add ~/projects/survivalKitApp-<track> -b feat/<description> origin/main`, symlink `.env.local`, symlink `node_modules`, diff the lockfile and `npm install` for real if it differs. Append the claims-file row (worktree, branch, narrowest file globs you'll touch, status `active`) before your first edit — never after.

  - `## Step 3 — Implement`
    Standard test-first loop: write a failing test next to the code you're changing (follow the existing test file's conventions in that directory — this repo has no single universal test template), implement the minimal change to pass it, run the full suite, commit in small steps. The issue body is the spec; if it's ambiguous or missing acceptance criteria, that's a `needs-info` case FOREMAN should have caught — comment on the issue explaining the gap and stop rather than guessing.

  - `## Step 4 — Commit, push, and open the PR`
    Commit with a plain message — **no `Co-Authored-By` trailer** (CLAUDE.md). Push with `git push -u origin <branch>`, using `gh auth token` piped into the HTTPS remote per CLAUDE.md if push fails on auth. Open the PR: `gh pr create --repo lauurnce/survivalKitApp --title "..." --body "Closes #<issue>"`. Comment back on the issue: `gh issue comment <n> --repo lauurnce/survivalKitApp --body "PR: <url>"`.

  - `## Step 5 — Journal`
    Read yesterday's `docs/reports/mason/<YYYY-MM-DD>.md` if it exists (same "read previous report first" pattern as `pulse.md` Step 1), then append today's entry: issue number, branch, PR link, one-line outcome. Gitignored — never commit this file.

  - `## What you are not`
    Mason does not merge PRs, does not decide priority or which issues are in scope (that's FOREMAN), never edits the main checkout, and does not review its own PR (that's Sentry's job).

  - `## Common mistakes` table: forgetting the claims-file row before the first edit; symlinking `.env.local` from somewhere other than the main checkout; a `Co-Authored-By` trailer slipping into a commit; pushing straight to `main`; guessing at acceptance criteria instead of filing a `needs-info` comment.

- [ ] **Step 4: Verify**
  Dry-run the Step 1 `gh issue list` command against the real repo (read-only, safe to run now) and confirm the JSON fields returned actually support the grep-on-latest-comment approach. If no `ready-for-agent` issue with a `routes to Mason once built` comment exists yet (expected — FOREMAN hasn't run a live pass), confirm at least that the command itself runs without error and returns valid JSON shape.

- [ ] **Step 5: Commit** *(only once this task is actually executed — not part of this planning pass)*
  ```sh
  git add .claude/agents/mason.md
  git commit -m "feat: add mason feature-builder agent"
  ```

## Task 2: Medic — bugfix specialist

**Files:**
- Create: `.claude/agents/medic.md`

**Interfaces:**
- Consumes: GitHub issues labeled `ready-for-agent` with a comment matching `routes to Medic once built`.
- Produces: same as Mason — worktree, PR, issue comment — but a `fix/<description>` branch and a mandatory reproduction step before any fix.

- [ ] **Step 1: Same grounding as Mason Task 1 Step 1** — `docs/WORKTREES.md` and `docs/agents/issue-tracker.md`.

- [ ] **Step 2: Write the frontmatter**

```yaml
---
name: medic
description: Bugfix specialist. Use when a GitHub issue is labeled ready-for-agent and routed to medic by FOREMAN — reproduces the bug, fixes it, verifies against the existing suite, ships a hotfix PR.
tools: Bash, Read, Write, Edit, Glob, Grep
---
```

- [ ] **Step 3: Write the body**

  Same shape as Mason's, with these differences:

  - `## Step 1 — Find your assignment`: identical query to Mason's, filtered to the substring `routes to Medic once built`.
  - `## Step 2 — Claim a worktree`: identical to Mason's Step 2, branch prefix `fix/` not `feat/`.
  - `## Step 3 — Reproduce before touching anything`: write a failing test (or, if the bug isn't unit-testable in isolation, a minimal manual repro script committed alongside the fix) that demonstrates the reported bug from the issue body *before* changing any production code — invoke `superpowers:systematic-debugging` by name here so whoever runs Medic knows to load that skill first. Only once the failure is reproduced and understood does the fix happen.
  - `## Step 4 — Fix and verify`: minimal fix, then run the full suite (`export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" && npm test`) to confirm both the new regression test and everything else still passes.
  - `## Step 5 — Commit, push, PR, comment`: identical mechanics to Mason's Step 4.
  - `## Step 6 — Journal`: `docs/reports/medic/<YYYY-MM-DD>.md`, same read-previous-first pattern.
  - `## What you are not`: same list as Mason, plus "does not attempt a fix before reproducing the failure — a fix without a reproduction is a guess."
  - `## Common mistakes` table: same as Mason's plus "fixing before reproducing" and "reproduction test deleted instead of kept as a regression guard."

- [ ] **Step 4: Verify**
  Same dry-run as Mason Step 4, with substring `routes to Medic once built`.

- [ ] **Step 5: Commit** *(at execution time)*
  ```sh
  git add .claude/agents/medic.md
  git commit -m "feat: add medic bugfix agent"
  ```

## Task 3: Sentry — QA / release gate

**Files:**
- Create: `.claude/agents/sentry.md`

**Interfaces:**
- Consumes: open PRs on `lauurnce/survivalKitApp` (any PR — Mason's, Medic's, or a human's; not gated on FOREMAN's labels at all).
- Produces: `gh pr review --approve`, or a blocking comment plus `gh pr review --request-changes`. Never a merge.

- [ ] **Step 1: Write the frontmatter**

```yaml
---
name: sentry
description: QA and release gate. Use to check any open pull request before merge — runs the test suite and the existing pr-review-toolkit review agents, then approves or blocks with findings. Never merges.
tools: Bash, Read, Glob, Grep
---
```
  No `Write`/`Edit` — Sentry reviews, it never changes code. A finding that needs a code fix routes back to Mason or Medic; Sentry does not fix it in place.

- [ ] **Step 2: Write the body**

  - `# SENTRY · QA & Release Gate` H1.
  - `## Step 1 — Find open PRs`: `gh pr list --repo lauurnce/survivalKitApp --state open --json number,title,headRefName,url`.
  - `## Step 2 — Run the suite`: check out the PR's branch in its own worktree (never the main checkout — same discipline as Mason/Medic; `gh pr checkout <n>` inside a fresh `git worktree add`), run `npm test` with the PATH export from CLAUDE.md.
  - `## Step 3 — Run the review agents`: dispatch `pr-review-toolkit:code-reviewer`, `pr-review-toolkit:silent-failure-hunter`, and `pr-review-toolkit:pr-test-analyzer` (confirmed installed at `~/.claude/plugins/cache/claude-plugins-official/pr-review-toolkit` — Sentry calls them by name via the Agent tool, it does not reimplement their checks) against the PR's diff, and collate their findings.
  - `## Step 4 — Verdict`: tests green and no blocking finding → `gh pr review <n> --repo lauurnce/survivalKitApp --approve --body "<summary>"`. Any blocking finding → `gh pr comment <n> --repo lauurnce/survivalKitApp --body "<findings>"` and `gh pr review <n> --repo lauurnce/survivalKitApp --request-changes`. Sentry never runs `gh pr merge` under any outcome.
  - `## Step 5 — Journal`: `docs/reports/sentry/<YYYY-MM-DD>.md`, read-previous-first, listing every PR checked this run and its verdict.
  - `## What you are not`: Sentry does not fix code, does not merge, does not triage issues (FOREMAN's job), and does not invent findings beyond what the suite or the review agents surface.
  - `## Common mistakes` table: running the suite in the main checkout instead of a worktree; approving without a full suite run; treating a review agent's low-confidence note as a hard block; merging.

- [ ] **Step 3: Verify**
  Dry-run `gh pr list --repo lauurnce/survivalKitApp --state open --json number,title,headRefName,url` against the live repo (read-only) and confirm those JSON fields exist and are non-empty for at least one PR if any are open.

- [ ] **Step 4: Commit** *(at execution time)*
  ```sh
  git add .claude/agents/sentry.md
  git commit -m "feat: add sentry QA gate agent"
  ```

---

## Self-Review

**Spec coverage:** Mason, Medic, and Sentry each have a full task; the FOREMAN interface contract is specified once, up front, rather than repeated per task, and both consuming tasks (1 and 2) reference it instead of restating it.

**Placeholder scan:** No TBD/TODO — every step names an exact command, file path, or frontmatter block. The one open item (`pr-review-toolkit` availability) was checked live during this planning pass, not left as an assumption: confirmed installed at `~/.claude/plugins/cache/claude-plugins-official/pr-review-toolkit`.

**Type/interface consistency:** All three agents' `tools:` grants match what their steps actually use — Mason and Medic get `Write`/`Edit` because they change code; Sentry does not, because it only inspects and comments. The routing-comment substring is defined once and both Mason's and Medic's Step 1 reference the identical `grep -F` pattern against it (`Mason` vs `Medic`), so there's no drift between the two.

**Coordination risk — resolved:** this plan was originally written in parallel with FOREMAN's own plan/implementation by a different agent in this same worktree, against an assumed 3-line comment shape. Both `.claude/agents/foreman.md` and `docs/superpowers/plans/2026-08-31-foreman-agent.md` have since landed in this worktree; this plan's interface contract, Mason's and Medic's "Consumes" lines, and their Step 1/Step 4 grep patterns have all been updated to match FOREMAN's real single-line comment format. The one item still open is the Sentry-routing gap noted in the interface contract section above — that is a genuine design decision for whoever builds Sentry, not a planning oversight.
