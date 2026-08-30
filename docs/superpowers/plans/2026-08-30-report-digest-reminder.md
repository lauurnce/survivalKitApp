# Report Digest & Weekly Reminder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cloud reminder routine's frozen, hardcoded email body with
one that reads real, current, figure-free department verdicts from a small
tracked file, and covers all four departments on their actual cadence instead
of only ops.

**Architecture:** A new tracked file, `docs/status/digest.md`, holds one
current-state block per department (last run date, verdict, one-sentence
figure-free headline). The `report` skill gains a step that keeps this file
updated after every department run. The existing cloud routine
(`trig_01QnHDXK8pZsSR9VoMrZoVBa`) is reconfigured to read that file at fire
time instead of emailing a static 08-04 snapshot.

**Tech Stack:** Markdown (digest file, skill doc), the `RemoteTrigger` tool
(routine config), Gmail MCP connector (unchanged, already attached).

**Spec:** `docs/superpowers/specs/2026-08-30-report-digest-reminder-design.md`

## Global Constraints

- `docs/status/digest.md` must never contain a dollar figure, count,
  percentage, or specific metric — verdict word + one plain-English sentence
  per department, per the spec's Components section.
- `docs/status/digest.md` is **tracked** (committed), unlike `docs/reports/`
  which stays gitignored — this is a deliberate, narrow exception to the
  `report` skill's disclosure rule, and must be stated as such where that
  rule lives.
- Each department's block is **overwritten** in place on its next run, not
  appended — the file reflects current state, not a log.
- Cadence: ops, growth, security are due every Friday; finance is due only on
  the month's first Friday (day-of-month ≤ 7).
- The HERALD line in the reminder email stays static/generic text — HERALD
  has no fixed cadence and no digest entry to read yet (its own build is
  in-flight in a separate worktree, out of scope here).
- Do not touch anything under `.claude/agents/herald.md`,
  `.claude/skills/x-updates/**`, `docs/social/**`, or
  `docs/superpowers/specs/2026-08-29-x-updates-herald-design.md` — claimed by
  another active session.

---

### Task 1: Seed `docs/status/digest.md`

**Files:**
- Create: `docs/status/digest.md`

**Interfaces:**
- Produces: the four `## <AGENT> (<dept>)` blocks that Task 2's skill step
  updates going forward, and that Task 3's routine prompt reads. Header
  format is exactly `## PULSE (ops)`, `## VANTAGE (growth)`,
  `## LEDGER (finance)`, `## WARDEN (security)` — Task 3 depends on this
  literal text.

- [ ] **Step 1: Write the file**

Real verdicts below are already stripped of figures (pulled from each
department's most recent report on disk: `docs/reports/ops/2026-08-29.md`,
`docs/reports/growth/2026-08-25.md`, `docs/reports/finance/2026-08.md`,
`docs/reports/security/2026-08-25.md`).

```md
# Report digest

Current-state summary, one block per department. Overwritten in place on
each run — not a log. No figures: verdict word + one plain-English
sentence only. Read by the weekly reminder routine (see
docs/superpowers/specs/2026-08-30-report-digest-reminder-design.md).

## PULSE (ops)
- Last run: 2026-08-29
- Verdict: nothing on fire
- Headline: ISR is still off app-wide; root cause traced to a root-layout headers() call that forces every child page dynamic, overriding their revalidate settings. Scoped as planned work, not urgent.

## VANTAGE (growth)
- Last run: 2026-08-25
- Verdict: nothing on fire
- Headline: the growth instrument is producing real reports for the first time; reach is trending down across most week-over-week periods on record.

## LEDGER (finance)
- Last run: 2026-08
- Verdict: reconciles cleanly
- Headline: first clean reconciliation run — all known exceptions are now classified and no paying user is locked out; revenue did not move this cycle.

## WARDEN (security)
- Last run: 2026-08-25
- Verdict: nothing exposed
- Headline: the coupon-redemption defect opened the prior day is closed and verified; the npm-advisory fix remains blocked on the Next.js major-version decision.
```

- [ ] **Step 2: Verify no figures leaked**

Run: `grep -nE '[0-9]' docs/status/digest.md`
Expected: only the date lines (`2026-08-29`, `2026-08-25`, `2026-08`) match.
If any other line matches (a count, a percentage, a currency figure), rewrite
that headline in words until this check only hits date lines.

- [ ] **Step 3: Commit**

```bash
git add docs/status/digest.md
git commit -m "feat: seed report digest with current department verdicts"
```

---

### Task 2: Wire the digest step into the `report` skill

**Files:**
- Modify: `.claude/skills/report/SKILL.md:31` (insert step 4 after existing
  step 3 in "Running one department")
- Modify: `.claude/skills/report/SKILL.md:86-90` (Disclosure section — add
  the digest exception)

**Interfaces:**
- Consumes: `docs/status/digest.md`'s block format from Task 1.
- Produces: nothing new consumed by other tasks; this is the ongoing
  maintenance instruction so the digest doesn't go stale again the way the
  routine's old hardcoded text did.

- [ ] **Step 1: Insert the digest-update step**

In `.claude/skills/report/SKILL.md`, in the "Running one department" section,
change:

```md
1. Run the department's collector from the table above. It costs nothing.
2. Dispatch the matching agent with the Agent tool — `subagent_type: "pulse"`,
   `subagent_type: "vantage"`, `subagent_type: "ledger"`, or
   `subagent_type: "warden"`.
3. Relay the agent's chat summary — verdict first.

**If you have just edited an agent definition, restart the session before dispatching
it.** Definitions load at session start, so a subagent dispatched after a mid-session
edit runs the old instructions. This has already cost one whole verification run.
```

to:

```md
1. Run the department's collector from the table above. It costs nothing.
2. Dispatch the matching agent with the Agent tool — `subagent_type: "pulse"`,
   `subagent_type: "vantage"`, `subagent_type: "ledger"`, or
   `subagent_type: "warden"`.
3. Relay the agent's chat summary — verdict first.
4. Update this department's block in `docs/status/digest.md` with today's
   date, the verdict, and a one-sentence, figure-free headline. Commit it —
   this file is tracked, unlike `docs/reports/`.

**If you have just edited an agent definition, restart the session before dispatching
it.** Definitions load at session start, so a subagent dispatched after a mid-session
edit runs the old instructions. This has already cost one whole verification run.
```

- [ ] **Step 2: Add the disclosure exception**

In the same file's "Disclosure" section, change:

```md
## Disclosure

`docs/reports/` is gitignored and must stay that way. The repo is public; these
reports carry traffic, revenue, conversion, and security data. Never copy a figure
from a report into a tracked file.
```

to:

```md
## Disclosure

`docs/reports/` is gitignored and must stay that way. The repo is public; these
reports carry traffic, revenue, conversion, and security data. Never copy a figure
from a report into a tracked file.

The one deliberate exception is `docs/status/digest.md`: a tracked,
current-state file holding one verdict word plus one figure-free headline
sentence per department, kept updated by step 4 of "Running one department"
above. It exists so the weekly reminder routine (which cannot see the
gitignored reports) has real content to read. It must never carry a number
beyond the "Last run" date.
```

- [ ] **Step 3: Verify the file reads correctly**

Run: `sed -n '25,45p;86,100p' .claude/skills/report/SKILL.md`
Expected: step 4 appears between step 3 and the "If you have just edited..."
callout; the Disclosure section now has three paragraphs, the last two
distinguishing `docs/reports/` from `docs/status/digest.md`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/report/SKILL.md
git commit -m "docs: keep report digest current after every department run"
```

---

### Task 3: Reconfigure the cloud reminder routine

**Files:** none (API-only change via the `RemoteTrigger` tool — no repo file
is touched by this task).

**Interfaces:**
- Consumes: `docs/status/digest.md`'s block format and header text from
  Task 1 (the new prompt's step 4 names the exact headers
  `PULSE (ops)`, `VANTAGE (growth)`, `LEDGER (finance)`, `WARDEN (security)`).
- Produces: nothing consumed by other tasks — this is the terminal task.

- [ ] **Step 1: Load the RemoteTrigger tool**

Run (as a tool call, not shell): `ToolSearch` with query `select:RemoteTrigger`
(skip if already loaded in this session).

- [ ] **Step 2: Generate a fresh event UUID**

Run: `uuidgen | tr 'A-Z' 'a-z'`
Expected: a lowercase v4 UUID, e.g. `f47ac10b-58cc-4372-a567-0e02b2c3d479`.
Use the actual value this command prints in Step 3 below — do not reuse the
old routine's UUID (`7c1f4a92-3e6d-4b8f-9a25-d81c0f6b47e3`).

- [ ] **Step 3: Update the routine**

Call the `RemoteTrigger` tool with:

```json
{
  "action": "update",
  "trigger_id": "trig_01QnHDXK8pZsSR9VoMrZoVBa",
  "body": {
    "name": "Weekly report reminder",
    "job_config": {
      "ccr": {
        "environment_id": "env_01T1h4pYkJY7tMnswaDiuStJ",
        "session_context": {
          "model": "claude-sonnet-5",
          "sources": [
            {"git_repository": {"url": "https://github.com/lauurnce/survivalKitApp"}}
          ],
          "allowed_tools": ["Bash", "Read", "Glob", "Grep"]
        },
        "events": [
          {"data": {
            "uuid": "<the UUID printed in Step 2>",
            "session_id": "",
            "type": "user",
            "parent_tool_use_id": null,
            "message": {"role": "user", "content": "Send Lawrence a short weekly reminder email covering all four report departments. Your ONLY job is to determine what's due, read one file for content, and send one email. Do not analyze the repo beyond what's specified below, do not run any report, do not open a PR, do not commit anything.\n\nWhy you read a file instead of running reports yourself: you are a cloud session with no access to Lawrence's Mac. Full reports live in docs/reports/, which is gitignored and exists only locally. A small tracked file, docs/status/digest.md, carries a one-line, figure-free verdict + headline per department specifically so you can read it here.\n\nSteps:\n\n1. Read docs/status/digest.md from the repo root (already cloned via your configured source).\n2. Determine today's UTC date. This routine only ever fires on Fridays, so if today's day-of-month is 7 or less, today is the month's first Friday.\n3. Departments due today: ops, growth, and security are always due. finance is due only if today is the month's first Friday (day-of-month <= 7).\n4. For each due department, find its block in docs/status/digest.md under the header PULSE (ops), VANTAGE (growth), LEDGER (finance), or WARDEN (security). If the block exists, use its Last run, Verdict, and Headline lines verbatim. If the block or the file is missing, use the fallback text: \"No report on file yet -- run /report <dept>.\"\n5. Compose one plain-text email:\n\nSubject: Weekly report reminder -- <due departments, comma-separated>\n\nBody:\n\nIt's Friday. Time to run this week's department reports on BSIT Survival Kit.\n\nFor each due department, one paragraph:\n\n<DEPT NAME> -- /report <dept>\nLast run: <date from digest, or \"no report on file yet\">\nVerdict: <verdict from digest, or the fallback line>\n<headline from digest, or omit this line if using the fallback>\n\nAfter all due departments, always append this line verbatim:\n\nAlso: if there's been a good chunk of shipped work this week, consider a HERALD /x-updates batch.\n\nSign off: -- PULSE\n\n6. Send the email using Gmail to paneslawrence8@gmail.com.\n7. Do not add anything you cannot verify from docs/status/digest.md -- never invent metrics, uptime numbers, or current site status not present in that file.\n\nAfter sending, confirm in one line that the email went out, listing which departments you included."}
          }}
        ]
      }
    }
  }
}
```

- [ ] **Step 4: Verify the update landed**

Call `RemoteTrigger` with `{"action": "get", "trigger_id": "trig_01QnHDXK8pZsSR9VoMrZoVBa"}`.
Expected: `name` is `"Weekly report reminder"`; `derived_state.prompt` (or
the `events[0].data.message.content` you sent) contains
`docs/status/digest.md`, `first Friday`, and `HERALD`; `cron_expression` is
still `"0 14 * * 5"` (unchanged — only the prompt and name changed);
`enabled` is still `true`.

- [ ] **Step 5: No commit needed**

This task changes only the routine's remote config, not repo files — there is
nothing to commit.

---

## Verification (after all three tasks)

- [ ] `grep -nE '[0-9]' docs/status/digest.md` shows only date lines (Task 1,
  Step 2, re-run once more for safety).
- [ ] `git log --oneline -5` in the worktree shows two new commits (digest
  seed, skill doc update).
- [ ] `RemoteTrigger` `{"action": "get", "trigger_id": "trig_01QnHDXK8pZsSR9VoMrZoVBa"}`
  matches the expectations in Task 3 Step 4.
- [ ] Optional live check: `RemoteTrigger` `{"action": "run", "trigger_id": "trig_01QnHDXK8pZsSR9VoMrZoVBa"}`,
  then `{"action": "list_runs", ...}` and `{"action": "get_run_log", ...}` to
  confirm the fired run actually read the digest and sent an email matching
  the new template — only do this with the user's go-ahead, since it sends a
  real email outside the normal Friday schedule.

## Note on parallelizing this plan

The user asked for subagents fanned out where the split is clean. Being
honest about this plan's shape: Tasks 1 and 2 touch different files with no
shared state and could run as two parallel subagents. Task 3 is independent
of both (it's a fixed prompt text derived from the spec, not from whatever
Task 1 actually writes) and could run in parallel with both. So a 3-way
fan-out is *possible* — but each task is 3-5 minutes of work, and the
coordination overhead of dispatching, reviewing, and merging three subagents
exceeds the time saved. This plan is small enough that inline execution
(superpowers:executing-plans) finishes faster than subagent-driven
dispatch would, without giving up anything — there's no long-running or
context-heavy work here to isolate. Subagent-driven is still offered below
because the user can weigh that trade-off themselves.
