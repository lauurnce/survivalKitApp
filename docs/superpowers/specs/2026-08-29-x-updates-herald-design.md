# HERALD — public X-update generator

**Date:** 2026-08-29
**Status:** approved (in-chat design), spec written for record

## Problem

Lawrence wants to post project updates on X but has no Premium tier (280-char
limit per post) and no repeatable way to turn "what shipped" into post-ready
copy. He wants: an initial batch of 20 posts covering the project's story
since day 1 plus current progress, and going forward, exactly 5 posts per
update batch reflecting new development or customer-data changes.

## Approach

A new department agent, **HERALD** (public updates/comms), dispatched by a
new skill, **`/x-updates`** — following the existing pulse/vantage/ledger/warden
pattern (`.claude/agents/*.md` + a skill that dispatches it via the Agent tool).

Rejected alternatives:
- **Fold into VANTAGE (growth).** VANTAGE's charter is private, gitignored
  growth reports. Mixing in public copywriting risks either voice leaking the
  wrong direction — private numbers into public posts, or the private-report
  tone into public copy. Keeping them separate keeps both charters clean.
- **A deterministic collector script**, mirroring `scripts/reports/*.ts`.
  Unnecessary: those collectors exist because Supabase queries need
  service-role credentials and shouldn't be re-run by an LLM's judgment. Here
  the sources are `git log` and two local markdown files — already
  deterministic, no separate pre-pass needed.

## Components

### `.claude/agents/herald.md`

New department agent. Tools: `Bash, Read, Write, Edit, Glob, Grep` (matches
the existing department pattern).

Encodes:
- **X's 280-character free-tier limit per post.** A URL, if included, counts
  as a flat 23 characters toward that limit regardless of its real length
  (X's `t.co` auto-shortening).
- **Voice**: first-person builder tone matching `STORY.md` ("I built the
  resource I couldn't find...").
- **Source allowlist** (the only files HERALD may read for content):
  `README.md`, `STORY.md`, git commit subjects (`git log`), `docs/HANDOFF-*.md`.
- **Source denylist**, named explicitly rather than left to judgment:
  `docs/reports/**` (gitignored, private department reports) and
  `docs/POST-MORTEM.md` (revenue/shutdown figures Lawrence explicitly chose to
  keep out of public disclosure — see project memory `revenue-strategy-2026`).

### `.claude/skills/x-updates/SKILL.md`

Thin dispatch skill, shaped like `report`'s: run any deterministic gathering
(none needed here beyond `git log`, which HERALD runs itself), then dispatch
HERALD via the Agent tool (`subagent_type: "herald"`).

States explicitly, since it inverts the neighboring skill's rule: output
under `docs/social/` is **committed** (public content), unlike
`docs/reports/` which is gitignored (private). This is called out by name so
nobody carries the `report` skill's gitignore habit over by reflex.

### `docs/social/x-updates-<YYYY-MM-DD>.md`

One file per run. Front matter: `batch_type` (`initial` | `update`),
`covers_commit` (HEAD short hash at run time), `post_count`. Body: numbered
posts, each tagged with its live character count, e.g. `### Post 1 (247/280)`.

## Data flow

1. **Batch detection** —
   `find docs/social -maxdepth 1 -name 'x-updates-*.md' | sort | tail -1`.
   - None found → **INITIAL** batch, exactly 20 posts.
   - Found → **UPDATE** batch, exactly 5 posts. Read that file's
     `covers_commit` front matter.
2. **Context gather** (local, free — no collector script):
   - INITIAL: full `git log` history span, `STORY.md` (origin story →
     problem → validation → reach stats → what's next), `README.md`'s
     "Where things stand" + data snapshot table (current numbers).
   - UPDATE: `git log <covers_commit>..HEAD --oneline`, plus a diff of
     README's data-snapshot numbers against what the previous batch file
     reported (e.g. "accounts 216 → 344").
3. **Draft**:
   - INITIAL: 20 posts spanning the STORY.md arc, closing on the current
     data snapshot.
   - UPDATE: exactly 5 posts on what changed since `covers_commit` — shipped
     features (from git log / README diff) and/or data-snapshot deltas.
     Never a number that isn't already public in STORY.md/README.md.
4. **Validate**: every post ≤280 chars using the link-cost rule above.
5. **Write**: `docs/social/x-updates-<date>.md`, committed to the branch.

## Guardrails

- Denylist (`docs/reports/**`, `docs/POST-MORTEM.md`) is stated by name in
  the agent definition, not left to inference.
- No X API integration in this scope — output is draft text for manual
  copy-paste. Actual auto-posting (OAuth app credentials, API access) is
  explicitly out of scope per Lawrence's confirmation.

## Testing

Content generation, not application logic — no unit tests for the drafting
step itself. Verification is the char-count validation step (every post's
tag must show `≤280`), plus a manual spot-check of the first real INITIAL
run's 20 posts before they're treated as ready to post.

The validation step itself does have deterministic coverage:
`scripts/social/check-post-lengths.mjs` (wired up as `npm run social:check`)
implements X's real weighted character-count algorithm — most code points
cost 1, but code points outside a handful of low-value ranges (CJK,
emoji, and symbols like `₱`) cost 2 — plus the flat 23-character URL cost,
and cross-checks each post's claimed header count against that computed
value, the batch's declared `batch_type` against its actual post count, and
the front matter's `post_count` against reality. Its self-test,
`scripts/social/check-post-lengths.check.mjs`, asserts this arithmetic
directly (including the weighted-count edge cases) and runs standalone via
`node scripts/social/check-post-lengths.check.mjs`, independent of the
manual spot-check above.
