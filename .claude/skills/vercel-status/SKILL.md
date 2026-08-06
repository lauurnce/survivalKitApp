---
name: vercel-status
description: Use when asked about Vercel status, hosting health, whether the site is up, deployment state, runtime errors, or CPU/usage against the free tier — including "what is the status of the vercel", "check hosting", "scan vercel", or "are we near the 4 hour limit".
---

# Vercel status scan

## Core principle

**A scan is a diff, not a snapshot.** The value is in what changed since last time. A
report that doesn't reference the previous one has thrown away the reason this log
exists.

## Step 1 — Read the previous report FIRST

Before any tool call, any curl, any grep:

```sh
ls -1 docs/reports/ops/hosting/*.md | grep -v -E 'README|TEMPLATE' | sort | tail -1
```

Read that file. You need its metrics table (to fill the "Last scan" column) and its
findings (to mark each as ONGOING or CLOSED). Also read `docs/reports/ops/hosting/README.md`
for the standing open items.

If the directory is empty, say so — this is a baseline scan, and every metric is a
baseline with no delta.

## Step 2 — Constants

Don't rediscover these. `.vercel/project.json` does not exist locally.

| | |
|---|---|
| Team | `team_oXH2hiibIrhhOSZvjv7btKbR` (lauurnce's projects, **Hobby**) |
| Project | `prj_5oTgRygFk9QxzLTHVOuVDN8cqN3w` (survival-kit-app) |
| Production URL | https://survival-kit-app.vercel.app |
| Reports | `docs/reports/ops/hosting/` (gitignored — see Disclosure) |

The 4h/month Active CPU allowance is **account-wide**, so if anything looks high, check
the other projects with `list_projects` before blaming this one.

## Step 3 — Collect

MCP tools, all take `teamId` + `projectId`:

| Call | Gets |
|---|---|
| `get_project` | Deployment state, domains, Node version, region |
| `get_runtime_errors` (`since: 7d`) | Error clusters — the "is it broken" answer |
| `get_runtime_logs` (`since: 7d`, `group_by: statusCode`) | The 5xx count |
| `get_runtime_logs` (`since: 7d`, `group_by: route`) | Traffic shape |
| `list_deployments` | Failed builds |
| `get_project_deployment_protection` | Confirm production is still public |

Live checks:

```sh
for u in / /login /year /for-blocks; do
  printf '%s ' "$u"
  curl -s -o /dev/null -w 'status=%{http_code} time=%{time_total}s\n' \
    -L --max-time 25 "https://survival-kit-app.vercel.app$u"
done
```

**The cache canary** — the highest-signal check for the CPU budget. `x-vercel-cache:
HIT` means ISR works; a permanent `MISS` with `cache-control: private, no-cache` means
every page view costs a full render:

```sh
curl -s -D - -o /dev/null https://survival-kit-app.vercel.app/for-blocks \
  | grep -iE '^(x-vercel-cache|cache-control|age)'
```

## Step 4 — The CPU number

**No Vercel MCP tool returns Active CPU usage. There is no usage or billing endpoint.**
`get_web_analytics` returns 404 (Web Analytics is disabled) — it is not the usage API
and calling it wastes a turn.

The meter is read by eye only, at https://vercel.com/lauurnces-projects/~/usage

So:

- If the user supplies the number, record it and date it.
- If not, ask for it, or write **"not read"** in the metrics table.

**Never write an estimate into the Active CPU row.** An estimate that hardens into a
baseline poisons every future diff — next scan would compute a delta against a number
nobody measured. Estimates belong in prose, labelled, with their derivation shown.

Traffic-based estimate, when useful: log events overcount, since one request can emit
both an `edge-middleware` and a `serverless` line. Halve it for a request count.

## Step 5 — Write the report

Copy `docs/reports/ops/hosting/TEMPLATE.md` to `docs/reports/ops/hosting/YYYY-MM-DD.md`.

Required, in this order:

1. **Verdict** — one line, is anything on fire.
2. **Previous report** — link it and state what changed. Never leave this blank.
3. **Metrics table** — identical row set every time, with the previous scan's values
   in the "Last scan" column and a Δ. Identical rows are what make the log readable.
4. **Findings** — each tagged NEW, ONGOING, or CLOSED against the previous report.
   Every finding from the last report must appear, even if only to close it.
5. **Action** — what to do before the next scan.

Then update `README.md`: add the history row, and update the standing open items table.

## Step 6 — Report in chat

Writing the file is not the deliverable. Summarize in chat, in this order:

1. **Verdict** — is anything on fire, yes or no. First line, not buried.
2. **What changed since the previous scan** — the deltas that moved, and any finding
   that opened or closed. If nothing moved, say "no change since <date>" plainly.
3. **Anything urgent**, per the escalation list — or an explicit "nothing needs action
   today" when there isn't.

The user should never have to open the file to learn whether their site is healthy.

## Escalation — what is actually urgent

Only these justify interrupting other work:

1. Production deployment not `READY`, or the live URL not returning `200`
2. Any 5xx in the status-code breakdown
3. New clusters in `get_runtime_errors`
4. Active CPU past ~50% of 4h with the month not half over
5. Production alias accidentally behind deployment protection

Everything else — caching, region, cleanup — is planned work. Say so plainly rather
than dressing a backlog item as an incident.

## Disclosure

`docs/reports/ops/hosting/` is gitignored. The repo is **public**, and these reports carry
traffic volumes — the same class of data that keeps `docs/POST-MORTEM.md` private.
Don't move reports out of that directory, and don't paste traffic numbers into files
that are tracked.

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing the report without reading the previous one | Step 1. The diff is the product. |
| Calling `list_teams` / `list_projects` to find IDs | They're in Step 2. |
| Calling `get_web_analytics` for usage | It 404s. It is not the usage API. |
| Putting an estimate in the Active CPU row | "not read" is the honest entry. |
| Dropping a finding that's still open | Every prior finding gets NEW/ONGOING/CLOSED. |
| Reporting a known backlog item as urgent | Check it against the escalation list. |
| `grep --include=*.ts` unquoted | zsh expands the glob. Quote it: `--include="*.ts"`. |
