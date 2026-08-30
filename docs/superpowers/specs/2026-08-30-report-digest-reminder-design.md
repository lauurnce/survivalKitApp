# Report digest & weekly reminder — design

**Date:** 2026-08-30
**Status:** approved (in-chat design), spec written for record

## Problem

A cloud routine (`trig_01QnHDXK8pZsSR9VoMrZoVBa`, "Weekly ops report reminder")
fires every Friday and emails Lawrence a nudge to run `/report ops`. It was
created 2026-08-04 with a fully static, hardcoded body — including a
"Standing items" list frozen at that date. The routine is `persist_session:
false` and has no access to Lawrence's Mac; `docs/reports/` is gitignored and
exists only locally, so the routine has never been able to see what PULSE (or
any department) actually found. Every Friday it repeats the same 08-04 text,
including items PULSE has since closed.

Lawrence wants: the reminder to cover all four departments (not just ops), to
reflect real current findings (not a frozen snapshot), while keeping actual
figures (revenue, traffic, security specifics) out of the email per the
`report` skill's disclosure policy — the repo is public and `docs/reports/`
stays gitignored for exactly that reason.

## Approach

**A small tracked digest file, read by the routine at fire time.**

`docs/status/digest.md` — one entry per department, **verdict + one-sentence
headline only, no figures**. Committed (not gitignored), unlike
`docs/reports/`. This is a deliberate, narrow carve-out from "reports stay
local": one sentence of non-sensitive text per department, not the reports
themselves.

The `report` skill gains a step: after a department's report is finalized,
update that department's block in `docs/status/digest.md` and commit it. This
lives in the skill's own instructions (the orchestrating session's job), not
in each department agent's charter — centralizing the redaction boundary in
one place is more robust than trusting four separate agents to self-censor
consistently.

The cloud routine's prompt changes from a static body to: clone the repo
(already does, via its `git_repository` source), read `docs/status/digest.md`,
apply cadence rules to decide which departments are due this Friday, and
compose the email from what's actually in the file — falling back to "no
report on file yet, run `/report all`" for any department with no entry.

Rejected alternatives:
- **Pure nudge, no content** (strip standing-items entirely, list only which
  departments are due). Simpler, but doesn't satisfy the actual ask — Lawrence
  wants last week's real verdict in the email, not just a bare reminder.
- **Give the cloud routine repo write access to read `docs/reports/`
  directly.** Not possible without either committing the gitignored reports
  (defeats the whole point of keeping them local/private) or wiring a
  separate credentialed sync path — disproportionate to "one headline per
  department."
- **Local `CronCreate` instead of the cloud routine.** Session-scoped only;
  does not survive past this session's lifetime, so it cannot deliver a
  standing Friday reminder. The existing cloud routine is the right
  mechanism; only its content source needed fixing.

## Components

### `docs/status/digest.md`

Current-state file, one block per department, overwritten (not appended) each
time that department reports — git history preserves the trail if ever
needed. Format:

```md
## PULSE (ops)
- Last run: 2026-08-29
- Verdict: nothing on fire
- Headline: ISR still off app-wide, root cause traced to a root-layout headers() call; scoped as planned work, not urgent.

## VANTAGE (growth)
- Last run: 2026-08-25
- Verdict: ...
- Headline: ...

## LEDGER (finance)
- Last run: 2026-08-24
- Verdict: ...
- Headline: ...

## WARDEN (security)
- Last run: 2026-08-24
- Verdict: ...
- Headline: ...
```

No dollar figures, counts, percentages, or specific metrics — verdict word
plus one plain-English sentence. If a headline can't be written without a
number (e.g. "4 high-severity advisories"), reword to omit the count ("some
high-severity advisories open") rather than including it.

### `.claude/skills/report/SKILL.md` — new step

Added to "Running one department," after relaying the agent's summary:

> 4. Update this department's block in `docs/status/digest.md` with today's
>    date, the verdict, and a one-sentence, figure-free headline. Commit it —
>    this file is tracked, unlike `docs/reports/`.

### Cloud routine update (`trig_01QnHDXK8pZsSR9VoMrZoVBa`)

Prompt rewritten to:
1. Clone repo (existing `git_repository` source, unchanged).
2. Compute today's date; determine which departments are due:
   - ops, growth, security: every Friday.
   - finance: only on the month's first Friday.
3. Read `docs/status/digest.md`. For each due department, pull its block; if
   absent, use "no report on file yet."
4. Compose one email, subject "Weekly report reminder", body listing each due
   department's verdict/headline (or the fallback) and the `/report <dept>`
   command to run it.
5. Append one static line: a soft, non-data-driven HERALD nudge — e.g. "Also:
   if there's been a good chunk of shipped work this week, consider a HERALD
   `/x-updates` batch." HERALD has no fixed cadence and no digest entry yet
   (still mid-build in another worktree), so this stays generic, not
   data-driven.
6. Send via the attached Gmail connector to `paneslawrence8@gmail.com`, from
   `lawrencepanes8@gmail.com` (unchanged — already the connected account).
7. Confirm in one line that the email went out.

No new MCP connections or tools needed: `Bash, Read, Glob, Grep` (current
`allowed_tools`) already cover cloning, date computation, and reading the
digest file; Gmail is already attached.

## Data flow

```
department report run (local, gitignored docs/reports/<dept>/<date>.md)
        │
        ▼
docs/status/digest.md block updated + committed (tracked, public-safe)
        │
        ▼ (next Friday 14:00 UTC)
cloud routine clones repo → reads digest.md → cadence check → compose email
        │
        ▼
Gmail send: lawrencepanes8@gmail.com → paneslawrence8@gmail.com
```

## Error handling

- `digest.md` missing entirely (first run before this system exists, or a
  department that's never run): routine falls back to "no report on file
  yet" for that department — never invents a verdict or figures.
- Repo clone or Gmail send failure: existing routine-level observability
  (`RemoteTrigger` `list_runs` / `get_run_log`) already covers this; no new
  handling needed.
- A department's digest block is stale (report hasn't run in a while): the
  routine states the block's own "Last run" date as-is; it doesn't compute or
  claim freshness beyond that.

## Testing

Content/prompt-following, not application logic:
- Locally: run `/report ops` (or `/report all`) once, confirm
  `docs/status/digest.md` is created/updated correctly, contains no figures,
  and is committed.
- Remotely: trigger the routine once via `RemoteTrigger` (`action: "run"`),
  confirm via Gmail that the email reflects real digest content, respects the
  finance-cadence rule, includes the HERALD line, and leaks no figures.
