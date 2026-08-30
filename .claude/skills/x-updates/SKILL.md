---
name: x-updates
description: Generate X (Twitter) post drafts about project progress — the initial 20-post history/progress batch, or an ongoing 5-post update batch. Use when asked to "post project updates to X", "generate X posts", "/x-updates", or "what should I post about progress".
---

# X updates

Drafts X-ready post text from **public sources only** — `README.md`,
`STORY.md`, git commit subjects. Never reads `docs/reports/**` or
`docs/POST-MORTEM.md`.

## Running it

Dispatch HERALD with the Agent tool: `subagent_type: "herald"`. No
collector step first — HERALD reads `git log` and the two markdown files
itself; nothing here needs Supabase credentials or a deterministic
pre-pass.

**If you have just edited `.claude/agents/herald.md`, restart the session
before dispatching it.** Agent definitions load at session start, same as
every other department agent in this repo — a subagent dispatched after a
mid-session edit runs the old instructions.

All batches ever generated live in one append-only file,
`docs/social/x-updates.md` — HERALD only ever appends a new section to it,
never rewrites or reorders an earlier one. It decides its own batch size:
20 posts if that file doesn't exist yet, otherwise exactly 5, diffed
against the most recently appended section. See `.claude/agents/herald.md`
for the full procedure.

## Validating output

Before treating a batch as ready to post, run:
```sh
node scripts/social/check-post-lengths.mjs
```
(no argument needed — it always reads `docs/social/x-updates.md` and
validates only the most recently appended section). This is a deterministic
re-check independent of HERALD's own char counts.

## Output — the opposite disclosure rule from `report`

`docs/social/` is **committed** — it holds public content, meant to be
posted. This is the reverse of `docs/reports/`, which is gitignored because
it holds private data. Don't carry the `report` skill's "never commit this"
habit over here by reflex — committing `docs/social/x-updates.md` is the
correct, intended behavior.

## Relaying the result

Report the batch type (initial/update), post count, and the output file
path. If HERALD reported a shortfall (fewer than the required count because
too little changed), relay that honestly rather than treating it as an
error.
