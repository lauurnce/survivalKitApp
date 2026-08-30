---
name: report
description: Run a department report — operations, growth, finance, or security. Use when asked to "run the ops report", "/report ops", "generate the department reports", or "what is happening in the product".
---

# Department reports

Each department is a collector (deterministic, free) plus an agent (judgment, costs
tokens). Run the collector first; it costs nothing and can be re-run freely.

## Departments

| Argument | Collector | Agent | Cadence |
|---|---|---|---|
| `ops` | `npm run report:ops` | `pulse` | daily |
| `growth` | `npm run report:growth` | `vantage` | weekly |
| `finance` | `npm run report:finance` | `ledger` | monthly + weekly delta (`npm run report:finance:weekly`) |
| `security` | `npm run report:security` | `warden` | weekly |

The growth and finance collectors need production Supabase credentials in
`.env.reports.local`. If either fails on a missing variable, that file is
incomplete — get the values from the Supabase dashboard, never from `.env.local`,
which deliberately holds none.

## Running one department

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

## Running all departments

`/report all` runs every built department **in a single invocation**.

Every department still follows all four steps from "Running one department"
above, including its own `docs/status/digest.md` update — `/report all` is
not exempt from that step.

This is not a style preference. A cold invocation costs roughly 22 US cents in
cache-creation overhead before any analysis happens. Running departments separately
pays that once each and produces identical reports. One invocation pays it once, and
the council in the next step becomes nearly free because every report is already in
context.

(Written as "22 US cents" rather than with a dollar sign on purpose. In a skill file a
dollar sign immediately followed by a digit is an argument placeholder — the observed
case was dollar-sign-zero being replaced with the invocation's first argument, which
rendered the figure as "ops.22" under `/report ops`. This note spells the character out
instead of quoting the sequence, because the first version of the warning quoted it
literally and was mangled by the very bug it documents. It is only visible when the
skill is actually invoked, so reading this file on disk will never show it. Do not
restore the dollar sign here.)

## The council

**Only runs when two or more departments have reported in the same invocation.**
All four departments exist, so `/report all` produces a council. A single
department's report still does not — a council of one is just a report.

Departments overlap in specific, useful ways: PULSE sees route health and caching,
VANTAGE knows which routes conversion depends on. A cache regression on a route
nobody converts through and one on the paywall path are different severities,
and only the combination reveals which is which.

Once two or more exist, after all reports are written, produce a council section that
does three things no single department can:

- **Connects** findings that are the same problem in different clothes.
- **Re-ranks** severity when another department supplies missing context, recording
  which department supplied it and what it was.
- **Surfaces disagreement** rather than resolving it away, presenting each side's
  strongest argument as a decision for the user.

The council never invents findings. Every item traces to a department report.

## Cost

Every report ends with a RUN / COST / CUMULATIVE footer. Values that were not
measured are recorded as `not read` — never estimated.

The ledger lives at `docs/reports/cost-ledger.jsonl`, one JSON line per run. PULSE
owns it and reports on it monthly, since cost of operation is already in its charter.

## Disclosure

`docs/reports/` is gitignored and must stay that way. The repo is public; these
reports carry traffic, revenue, conversion, and security data. Never copy a figure
from a report into a tracked file.

The one deliberate exception is `docs/status/digest.md`: a tracked,
current-state file holding one verdict word plus one figure-free headline
sentence per department, kept updated by step 4 of "Running one department"
above. It exists so the weekly reminder routine (which cannot see the
gitignored reports) has real content to read. It must never carry a number
beyond the "Last run" date. For security specifically, a headline states the
verdict and whether work is outstanding, but never names the unpatched
component, package, or defect class.
