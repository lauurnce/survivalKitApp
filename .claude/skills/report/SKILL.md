---
name: report
description: Run a department report — operations, and later growth, finance, and security. Use when asked to "run the ops report", "/report ops", "generate the department reports", or "what is happening in the product".
---

# Department reports

Each department is a collector (deterministic, free) plus an agent (judgment, costs
tokens). Run the collector first; it costs nothing and can be re-run freely.

## Departments

| Argument | Collector | Agent | Cadence |
|---|---|---|---|
| `ops` | `npm run report:ops` | `pulse` | daily |

Growth, finance, and security are not built yet. If asked for one, say so plainly
rather than improvising a report — an invented report is worse than no report.

## Running one department

1. Run the collector: `npm run report:ops`
2. Dispatch the matching agent with the Agent tool, `subagent_type: "pulse"`.
3. Relay the agent's chat summary — verdict first.

## Running all departments

`/report all` runs every built department **in a single invocation**.

This is not a style preference. A cold invocation costs roughly 22 US cents in
cache-creation overhead before any analysis happens. Running departments separately
pays that once each and produces identical reports. One invocation pays it once, and
the council in the next step becomes nearly free because every report is already in
context.

(Written as "22 US cents" rather than with a dollar sign on purpose: a literal
`$0` in a skill file is substituted with the invocation's first argument, so
`/report ops` would render the figure as "ops.22".)

## The council

**Only runs when two or more departments have reported in the same invocation.** With
one department built, there is no council — say so rather than faking one.

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
