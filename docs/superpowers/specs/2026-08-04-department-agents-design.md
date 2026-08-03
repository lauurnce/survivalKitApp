# Department Agents — Design

**Date:** August 4, 2026
**Status:** Approved design, pending implementation plan

Four standing departments — Growth, Security, Finance, Operations — each scoped like a
real 10–20 person team rather than a single checklist. Each gathers facts
deterministically, interprets them with judgment, ranks findings by whether they
deserve interruption, and proposes options rather than a single verdict.

## Goal

A solo founder cannot hold the whole product in their head at once. These departments
exist so that "what is happening inside the product" becomes something read rather than
something investigated — and so every finding arrives with a decision attached, not just
a fact.

Three properties define a useful report here:

1. **Actionable.** Every finding names what to do, not only what is wrong.
2. **Optioned.** Findings offer 2–3 courses of action with trade-offs, so the founder
   chooses. A single recommendation is a decision taken away.
3. **Triaged.** Findings are labelled by urgency, including an explicit "not worth
   solving now" — so attention goes to the few things that deserve it.

## Non-goals

- **Org-chart completeness.** HR, Legal, and Sales have no data behind them and are not
  built. Marketing is excluded until TikTok analytics can be fed in — 89% of traffic
  arrives with no referrer, leaving almost nothing to read.
- **Agents writing to production.** Every collector is read-only.
- **Agents writing SQL ad hoc.** Queries live in version-controlled code, not prompts.
- **Replacing judgment.** Departments surface and frame decisions. They do not make them.

## Architecture

Two layers, deliberately separated.

**Collectors** — `scripts/reports/*.ts`. Deterministic TypeScript that gathers facts and
emits JSON. No LLM, no judgment. Unit-testable with Vitest like the rest of `lib/`.
The only things that touch Supabase or shell out to the build. Running one twice gives
the same answer twice. **Collectors cost zero tokens.**

**Interpreters** — `.claude/agents/*.md`. Subagent definitions that read the collector's
JSON plus the previous report, then decide what is alarming, what changed, and what the
options are. Judgment only. **Interpreters cost tokens.**

**Reports** — append-only markdown under `docs/reports/<department>/`, gitignored,
one file per run, plus a `README.md` per department carrying standing open items.

The split is the point. An agent never writes ad-hoc SQL against production, never
invents a number, and cannot hammer the database. When a report cites a number, that
number came from tested code. The split is also the cost lever — see *Scheduling*.

### The house standard

`docs/vercel-status/` already established the conventions every department now inherits:

- **A scan is a diff, not a snapshot.** Read the previous report before collecting
  anything. A report that doesn't reference the previous one has thrown away the reason
  the log exists.
- **Identical metrics table every run**, with a "last run" column and a delta. Identical
  rows are what make a log readable over months.
- **Every prior finding reappears**, tagged NEW / ONGOING / CLOSED. Dropping a finding
  silently is how things get lost.
- **An escalation list** defining what actually justifies interruption, so backlog items
  are never dressed up as incidents.
- **Chat summary is the deliverable**, not the file. The founder should never have to
  open a file to learn whether something is on fire.

## Severity taxonomy

Shared across all four departments. The point of the bottom two labels is to make
"ignore this" an explicit, durable decision rather than a thing that quietly resurfaces
every week.

| Label | Means | Response |
|---|---|---|
| **P0 — CRITICAL** | Money, data, or availability is actively at risk right now. | Interrupt whatever else is happening. |
| **P1 — HIGH** | Will become P0 if left, or is already costing measurable revenue/users. | This week. |
| **P2 — PLANNED** | Real problem, bounded cost, no deadline pressure. | Put it in the backlog with a size estimate. |
| **P3 — WATCH** | Not a problem yet. Named so a trend is visible if it moves. | Nothing. Re-checked automatically each run. |
| **ACCEPTED** | Known, understood, deliberately not being fixed. | Nothing — but records *why*, and the condition that would reopen it. |

ACCEPTED is a first-class label with required fields: the reason, the risk being taken,
and the **trigger** that would promote it back to P1/P2. An accepted finding is never
re-litigated until its trigger fires. This is what stops a weekly report from nagging.

## Finding format

Every finding in every department, regardless of subject:

```
### <n>. <Title> — [P0|P1|P2|P3|ACCEPTED] · [NEW|ONGOING|CLOSED]

**What:**      the defect or signal, one or two sentences
**Evidence:**  file:line, a metric with its delta, or a query result — never a vibe
**Impact:**    who or what is affected, quantified where possible
**Why now:**   what makes this the current severity, not a higher or lower one

**Options:**
  A. <do nothing / accept> — cost of inaction, what it risks
  B. <minimal intervention> — effort, what it trades away
  C. <full fix> — effort, what it trades away

**Recommendation:** one of the above, with the reasoning in a sentence.
```

Option A is very often "accept and move on," and it is stated explicitly rather than
implied by omission — because for a solo founder, *not* doing something is usually the
correct answer and deserves to be argued for as seriously as doing it.

## Personas

Each department reports under a codename with a fixed voice. The persona is not
decoration — it constrains how the agent writes, and each one is a guard against that
department's characteristic failure mode.

| Codename | Department | Voice | Guards against |
|---|---|---|---|
| **VANTAGE** | Growth | Skeptical of averages. Never reports a blended number without the segments underneath it. | Vanity metrics; a first-year-dominated average hiding everything interesting. |
| **WARDEN** | Security | Assumes compromise, but never uses alarming language for unalarming things. Precise about why a severity is what it is. | Crying wolf, which trains the reader to ignore the report. |
| **LEDGER** | Finance | Reconciles before opining. Distrusts any figure with only one source. | Reporting a number that no second source confirms. |
| **PULSE** | Operations | On-call voice. Short sentences. Says "nothing needs action today" without padding. | Dressing backlog items as incidents. |

## Report layout

Dashboard format. Fixed section order, identical every run, so the log is readable as a
series rather than as isolated documents.

```
<CODENAME> · <DEPARTMENT>                          <YYYY-MM-DD> · <cadence>
═════════════════════════════════════════════════════════════════════════
VERDICT   One line. Is anything on fire, and the single thing that moved.

<SURFACE|FUNNEL|LEDGER|HEALTH>     NOW        LAST RUN         Δ
─────────────────────────────────────────────────────────────────────────
<metric>                           <value>    <value>          <delta>
  … identical row set every run — this is what makes deltas readable
─────────────────────────────────────────────────────────────────────────

FINDINGS
 [P0] NEW      <title>
 [P1] ONGOING  <title>                                   (week <n>)
 [ok] CLOSED   <title>

ACCEPTED (<n>)  not re-litigated · reopens on trigger
 · <finding>                          → reopens if <trigger>

─────────────────────────────────────────────────────────────────────────
DETAIL · <severity> · <title>

  <what, evidence with file:line or metric, impact, why this severity>

  A  <accept>          <cost of inaction>
  B  <minimal>         <effort>
  C  <full fix>        <effort, trade>

  → <choice, with the reasoning in a sentence>
```

Rules:

- **Detail is written for the top finding only** by default, plus every P0 and P1.
  P2 and below stay one-liners in the index unless asked for. A report nobody finishes
  reading has failed regardless of how complete it is.
- **The metrics row set never changes between runs.** Adding a row is a deliberate
  decision that resets that row's delta history.
- **Every finding from the previous run appears**, even if only to be CLOSED.
- **ACCEPTED items are listed with their reopen trigger** and are never re-argued until
  that trigger fires.
- **The chat summary is the deliverable.** Verdict first, then what moved, then whether
  anything needs action today — the file is the archive, not the product.

## The council

Individual reports answer "what is happening in my department." They cannot answer
"what should I do about the product this week," because no single department can see
that. The council phase exists to close that gap.

After every department has reported, each one reads the others' reports and the council
produces a single synthesis section. This is not a summary — summarising four reports
adds nothing. The council exists to do three things a lone department cannot:

**1. Connect findings that are the same problem wearing different clothes.** PULSE sees
a cache regression on `/for-blocks`. LEDGER sees the CPU budget moving. VANTAGE knows
`/for-blocks` is where conversion happens. Individually those are three P1s in three
reports; together they are one issue with a clear priority.

**2. Re-rank severity using another department's context.** This is the council's most
valuable output. WARDEN rates a device-cookie forgery path P1 — low-value data, nothing
exposed. LEDGER points out that device identity is what gates paid content, so a forgery
path is a revenue leak. **The finding is promoted to P0 by the combination**, and neither
department could have reached that alone. Severity changes made in council are recorded
with the reasoning and which department supplied the missing context.

**3. Surface disagreement rather than resolving it away.** When two departments
recommend opposing actions — Growth wants to ship a pricing experiment, Finance wants to
freeze pricing until reconciliation is clean — the council states both cases and does not
manufacture agreement. A council that always agrees is a council that is not thinking.
Disagreements are presented as a decision for the founder, with each side's strongest
argument stated by the department that holds it.

### Council output

```
COUNCIL · <YYYY-MM-DD>
═════════════════════════════════════════════════════════════════════════
IF YOU DO ONE THING     <the single highest-leverage action this week>

CONSENSUS
 1. <finding> — <the departments that agree, and what each contributes>
 2. …

CROSS-REFERENCED
 <finding A> + <finding B> → <what the combination means>

RE-RANKED IN COUNCIL
 <finding> <old severity> → <new severity>
   <which department supplied the missing context, and what it was>

UNRESOLVED
 <question> — <dept> argues <x>, <dept> argues <y>. Your call because <why>.

STANDING DOWN
 <what every department agrees is not worth attention this period>
```

`STANDING DOWN` is deliberate. A council that only ever adds to the pile is a burden.
Naming what can be safely ignored this week is as useful as naming what cannot.

### Council constraints

- The council runs **only when two or more departments have reported in the same
  invocation.** A council of one is just a report.
- The council may **re-rank** findings but never invents new ones. Every council item
  traces to a finding in a department report.
- The council reads reports, not raw data. If it wants a number it does not have, it
  says so rather than deriving one.

## Cost accounting

Every run records what it consumed. The goal is comprehensive analysis at a resource
cost that is known rather than assumed.

### What is measured

`claude -p --output-format json` returns real accounting per invocation:
`total_cost_usd`, `usage.input_tokens`, `usage.output_tokens`,
`usage.cache_creation_input_tokens`, `usage.cache_read_input_tokens`, `duration_ms`,
`duration_api_ms`, and `num_turns`. Collector wall-clock is timed separately by the
script.

These are measured values, not estimates. The rule inherited from the hosting scan
applies here too: **an unmeasured cost is recorded as "not read", never guessed.** A
guessed cost that hardens into a baseline poisons every future comparison.

### The report footer

Every department report ends with:

```
─────────────────────────────────────────────────────────────────────────
RUN          collect 1.8s · interpret 34.2s · 2 turns
COST         $0.14   ·  in 1,204  out 3,891  cache-r 18,332  cache-w 0
CUMULATIVE   $2.31 this month · 17 runs · $0.136 avg
```

### The cost ledger

`docs/reports/cost-ledger.jsonl` — one JSON line per run, appended, never rewritten:
timestamp, department, cost, token breakdown, durations, and the finding count produced.
This makes two questions answerable that a per-report footer cannot:

- **Is a department earning its cost?** Cost per finding, and per finding that was
  acted on. A department producing expensive reports nobody acts on should be cut or
  have its cadence lowered.
- **Is cost drifting?** Report cost grows as reports accumulate, since each run reads the
  previous one. The ledger makes that trend visible before it becomes a problem.

PULSE owns the ledger and reports on it monthly, since cost of operation is already in
its charter.

### The batching rule

Measured on this machine: a trivial headless invocation that produced four output tokens
cost **$0.22**, of which essentially all was cache-creation overhead from loading context
— not work. That fixed cost is paid once per invocation regardless of how much analysis
happens inside it.

Therefore **all departments run in a single invocation.** Running four separately pays
the startup cost four times and produces the same reports. The council is nearly free
under this arrangement, because every department's report is already in context by the
time it runs.

`/report <department>` for a single department remains available for debugging, and is
understood to be the expensive way to do it.

---

# Department charters

Each department below is scoped as a team of specialists. The sub-functions are the
"headcount" — each is a distinct lens with its own checks, its own data, and its own
failure modes.

---

## Growth

**Charter.** Own the question of whether people arrive, stay, and pay — and why they
don't. Paywall conversion is what killed the previous model, so this department carries
the most weight.

**Cadence:** weekly.

### Sub-functions

**1. Acquisition analysis.** Where visitors come from, using the attribution captured on
`enter` events (`referrer`, `utm_source`, `utm_medium`, `utm_campaign` in
`lib/analytics.ts`). Tracks the no-referrer share — the dark-social signal that means
links are moving through group chats rather than search.

**2. Activation.** What happens in a first session: how far a new device gets, how many
reach a module, how many reach the paywall at all. A user who never sees the paywall is
a different problem from one who sees it and leaves.

**3. Funnel and conversion.** Step-to-step conversion across the live path:
`enter → year_select → subject_open → module_open → paywall_teaser_view →
paywall_teaser_click → subscribe_click`, then completion joined from `payments` /
`subscriptions`. Reports the single largest leak and whether it moved.

**4. Retention and cohorts.** Weekly device cohorts and return rates. Given that visits
cluster around exam dates, seasonality is signal, not noise — the department must
distinguish "engagement dropped" from "it is not exam week."

**5. Segmentation.** Conversion and engagement split by year, subject, university
(`lib/universities.ts`), and device type (`lib/deviceType.ts`). A blended average across
a first-year-dominated audience hides everything interesting.

**6. Content–market fit.** Which modules are opened, completed, abandoned. High opens
with low completion is a content problem wearing an engagement costume. Feeds the
question of what to build next.

**7. Demand sensing.** The waitlist and `ComingSoonModal` interactions — what people ask
for that does not exist yet. Upper-year demand has historically run far ahead of
first-year demand on a per-capita basis.

**8. Voice of customer.** The `user_feedback` table, read qualitatively. Themes, not
counts. This is the only department input written in the users' own words.

**9. Experiment design.** Proposes what to test next and states the sample size needed
for the result to mean anything at current traffic. Explicitly flags when traffic is too
thin for a test to conclude — a real constraint at this scale.

**10. Forecasting.** Projects current trajectory against targets and states the
assumptions. Never presents a projection without its assumptions.

### Data sources

`events` (via Postgres aggregate RPC), `payments`, `subscriptions`, `profiles`,
`user_feedback`, `classes` / `class_members`, waitlist aggregates.

### Standing checks

- Largest funnel leak, and its week-over-week movement
- Conversion by subject and by year, against the blended median
- New vs returning device split
- Cohort retention curve, seasonality-adjusted commentary
- Modules with high open / low completion
- Feedback themes, newly emerging vs ongoing
- Any metric definition that has drifted between sources

### Escalation — what is P0 here

1. Conversion to paid falls to zero across a full reporting period while traffic holds
2. A funnel step's volume drops by more than half week-over-week with no release to
   explain it
3. The paywall fails to render for a segment — users cannot pay even if they want to

### First-run priority

**Reconcile the user-count definition before reporting anything else.** Auth accounts
and the "signed-up users" figure recorded in POST-MORTEM.md differ by an order of
magnitude, most likely because the latter counted devices under the device-first
identity model that predates accounts. One metric, one source, one number. Every other
Growth finding is untrustworthy until this is settled.

### Known repairs owned by this department

`unlock_click` and `unlock_submitted` are dead event types — present in the DB enum, the
events API allowlist, and `lib/supabase/types.ts`, but emitted by no code. They are
pre-pivot leftovers. `app/admin/page.tsx:29-30` and `AdminDashboard.tsx:867-868` still
render them as funnel steps, so the admin dashboard shows two frozen counts that will
never increment. Fixing that display is part of this department's first implementation.

There is also **no completion event on the live path** — `unlock_submitted` was the
"they paid" step and the pivot did not replace it. Completion therefore comes from the
ledger, which is the better source anyway: ledger rows are ground truth, while a client
beacon is lost whenever a user bounces to GCash and never returns.

---

## Security

**Charter.** Own everything that could expose user data, lose money, or hand control of
the product to someone else. Reports regressions against a known baseline rather than
re-deriving the same audit weekly.

**Cadence:** weekly.

### Sub-functions

**1. Application security.** Injection paths, unvalidated input, authorization gaps on
API routes. Cross-references every route under `app/api/` against the guards it should
have — auth check, rate limit, input validation via `lib/validation.ts`.

**2. Database and RLS posture.** Every table in `supabase/migrations/` checked for RLS
enabled and for policies that actually constrain rather than merely exist. A policy of
`using (true)` is not a policy. Tracks new tables shipped without protection.

**3. Identity and session security.** Admin session HMAC (`lib/auth/adminSession.ts`),
the device cookie that carries subscription identity
(`lib/auth/deviceCookie.ts`, `DEVICE_COOKIE_SECRET`), and whether identity can be forged
or replayed. Device-derived entitlement is the product's soft underbelly: if a device
cookie can be minted, paid content is free.

**4. Secrets management.** Scans for secrets reaching the client bundle, for
`SUPABASE_SERVICE_ROLE_KEY` usage in client-reachable paths, and for any `NEXT_PUBLIC_`
variable holding something that should not be public. Confirms `.env*` stays ignored.

**5. Supply chain.** `npm audit`, transitive dependency drift, lockfile integrity, and
packages with install scripts. Notably `esbuild` currently carries an unapproved
postinstall script flagged by npm.

**6. Sandbox and code execution.** The highest-surface area in the product: users run
arbitrary Python, SQL, C++, and Java through Pyodide, sql.js, and Vercel Sandbox.
Covers resource limits, timeout enforcement (`maxDuration`), stdin caps, and whether
sandbox escape or resource exhaustion is possible. `app/api/run/route.ts` and
`lib/ide/sandboxRunner.ts` are permanent review targets.

**7. Payment integrity.** Webhook signature verification, replay protection, and the
`PAYMONGO_LIVEMODE` mode-matching trap that makes failures silent. Also whether payment
state can be forged to grant access without payment.

**8. Business-logic abuse.** Free access obtained through unintended paths: class-rep
seat caps (`class_members_seat_cap_trigger`), join-request flows, discount codes, the
`UNLOCK_ALL` production guard. These are not "vulnerabilities" in a scanner's sense and
only a human-shaped reviewer finds them.

**9. Abuse and rate limiting.** Coverage of `lib/rateLimit.ts` and
`lib/serverRateLimit.ts` across endpoints, and whether limits are shared across
serverless instances rather than per-instance.

**10. Privacy and data protection.** PII inventory — what personal data exists, where,
and for how long. Account deletion completeness (`app/api/account/delete/`), and PH Data
Privacy Act posture given the users are students, some of whom may be minors.

**11. Detection coverage.** The question nobody asks until too late: if this were being
attacked right now, what would show it? Assesses whether logging and error reporting
would surface an ongoing attack at all.

### Data sources

Repository source, `supabase/migrations/`, `npm audit --json`, `.env.example` versus
actual `process.env` usage, `middleware.ts` matcher coverage, Vercel runtime errors.

### Baseline

`docs/superpowers/plans/2026-06-15-security-hardening.md` is the known-good checklist.
Findings already fixed there are not re-reported. The department reports **regressions
and newly added surface**, which is what makes a weekly cadence bearable.

### Escalation — what is P0 here

1. A table readable or writable without RLS containing user data
2. A secret reachable from the client bundle
3. Identity or entitlement forgeable — device cookie or admin session
4. Sandbox escape, or unbounded resource consumption in code execution
5. Payment state settable without a verified webhook
6. Any actively exploited issue, regardless of theoretical severity

### Reporting constraint

Security reports name exploitable weaknesses in a live product. They stay in
`docs/reports/security/`, gitignored, permanently. A security report in a public repo is
a published attack surface.

---

## Finance

**Charter.** Own the money: what came in, whether the records agree, what it costs to
operate, and what the trajectory implies. At current volume the interesting questions
are integrity and unit economics, not accounting scale.

**Cadence:** monthly, with a lightweight weekly revenue delta.

### Sub-functions

**1. Revenue accounting.** Month-over-month revenue via `revenueByMonth` in
`lib/payments.ts`, with the current month annotated "so far" to prevent false
comparisons.

**2. Ledger integrity.** Reconciles `subscriptions` against `payments`. A subscription
without a payment row is either legitimate — comped access, class-rep block seats — or a
webhook writing entitlement without recording money. The department's job is to know
which, every month, and to name each exception.

**3. Billing operations.** Failed and abandoned payments, PayMongo links created but
never completed, and webhook deliveries that did not land. Abandoned checkouts are a
Growth signal too and are handed across.

**4. Unit economics.** ARPU, and lifetime value against a customer acquisition cost that
is currently zero — distribution is organic. The department states plainly that CAC is
zero *because no money is spent*, not because acquisition is efficient, and models what
happens to payback if that changes.

**5. Pricing and packaging.** Tracks price points in `app/(main)/for-blocks/pricing.ts`
against realised revenue per plan, and whether the subscription pivot's pricing is
converting differently from the one-time unlock it replaced.

**6. Formula drift.** Asserts the block-price formula agrees across every place it is
computed — a bug class already hit twice, most recently documented in commit 44c2957.
A standing assertion, not a one-time fix.

**7. Revenue recognition.** Subscription periods, `periodEndFor`, and `SEMESTER_END`
semantics — money received for a period not yet delivered is deferred, and the
distinction matters once subscriptions are the model.

**8. Renewals and expiry.** Which subscriptions lapse when, and how much revenue is at
risk in the next period. With semester-bound access this clusters hard around academic
dates rather than spreading evenly.

**9. Cost of operation.** Vercel and Supabase consumption against free-tier limits —
notably the account-wide 4-hour Active CPU allowance. Cost per active user, and the
volume at which the free tier stops being free. Coordinates with Operations, which owns
the measurement.

**10. Scenario modelling.** What revenue looks like at 2×, 5×, 10× current conversion,
and what each scenario requires. Assumptions always stated.

### Data sources

`payments`, `subscriptions`, `classes` / `class_members`, `lib/payments.ts`,
`lib/paymongo.ts`, `app/(main)/for-blocks/pricing.ts`, hosting cost figures from
Operations.

### Escalation — what is P0 here

1. Money received without entitlement granted — a paying user locked out
2. Entitlement granted without money received, at a rate suggesting a bug rather than
   deliberate comping
3. Webhook signature verification failing, or silently rejecting live payments through
   a `PAYMONGO_LIVEMODE` mismatch
4. Price formula disagreement between any two sources
5. Free-tier limits about to be exceeded with no plan

### Reporting constraint

Revenue and conversion figures are private under the disclosure rule already applied to
`docs/POST-MORTEM.md`. They never enter tracked files.

---

## Operations

**Charter.** Own whether the product is up, fast, deployable, and affordable. Absorbs
the existing `vercel-status` scan as its hosting module rather than duplicating it.

**Cadence:** daily.

### Sub-functions

**1. Availability.** Production deployment state, live URL status across key routes
(`/`, `/login`, `/year`, `/for-blocks`), and deployment protection — confirming
production is still publicly reachable.

**2. Error surveillance.** Vercel runtime error clusters and the 5xx count, tagged
NEW / ONGOING / CLOSED against the previous run. New clusters are the "is it broken"
answer.

**3. Performance and caching.** The cache canary — `x-vercel-cache: HIT` means ISR is
working; a permanent `MISS` with `cache-control: private, no-cache` means every page
view costs a full render. Route latency, and Core Web Vitals where measurable.

**4. Capacity and cost.** Active CPU against the account-wide 4-hour monthly allowance.
**This number has no API and is read by hand** at the Vercel usage page. An estimate is
never written into the metrics table — "not read" is the honest entry, because an
estimate that hardens into a baseline poisons every future delta. Since the allowance is
account-wide, other projects on the account are checked before blaming this one.

**5. Release engineering.** Deployment success rate, build times, failed builds, and
what is currently deployed versus what is on `main`.

**6. Build and test health.** `npm test`, `npm run typecheck`, `npm run lint`,
`npm run build` exit codes. A red build that nobody noticed is an outage waiting for the
next deploy.

**7. Data operations.** Migration drift between `supabase/migrations/` and the live
schema, and backup posture — including whether a free-tier Supabase project is at risk
of pausing through inactivity.

**8. Dependency lifecycle.** `npm outdated`, major-version drift, and end-of-life
runtimes. Distinct from Security's CVE view: this is maintenance debt, not exposure.

**9. Observability coverage.** Whether `instrumentation.ts` and error handling would
actually surface a failure. Silent failure is the specific enemy — analytics already
fails silently by design, which is correct for analytics and dangerous everywhere else.

**10. Toil identification.** Recurring manual work worth automating, including anything
this department itself keeps doing by hand.

### Data sources

Vercel MCP tools (`get_project`, `get_runtime_errors`, `get_runtime_logs`,
`list_deployments`, `get_project_deployment_protection`), live `curl` checks, local build
and test commands, `npm outdated`, `supabase/migrations/`.

### Constants

Do not rediscover these each run.

| | |
|---|---|
| Team | `team_oXH2hiibIrhhOSZvjv7btKbR` — lauurnce's projects, **Hobby** tier |
| Project | `prj_5oTgRygFk9QxzLTHVOuVDN8cqN3w` — survival-kit-app |
| Production URL | https://survival-kit-app.vercel.app |

`get_web_analytics` returns 404 — Web Analytics is disabled, it is not the usage API, and
calling it wastes a turn.

### Escalation — what is P0 here

1. Production deployment not `READY`, or the live URL not returning `200`
2. Any 5xx in the status-code breakdown
3. New clusters in runtime errors
4. Active CPU past ~50% of the 4-hour allowance with the month not half over
5. Production alias accidentally behind deployment protection
6. Supabase project paused or approaching inactivity pause

Everything else — caching, region, cleanup — is planned work and is labelled as such.

### Migration note

`docs/vercel-status/` becomes `docs/reports/ops/hosting/`, preserving history. The
existing `vercel-status` skill is retained as the hosting module's procedure; the Ops
department wraps it and adds the build, test, dependency, and data-ops sub-functions
around it. Its metrics table, escalation list, and NEW/ONGOING/CLOSED convention are
kept verbatim — they are the pattern the other three departments are being brought up to.

---

# Invocation

Departments are invoked from inside a Claude Code session. There is no OS-level
scheduler.

```
/report <department>      one department, now
/report all               all four, sequentially
```

For repetition while working:

```
/loop 4h /report ops      every four hours
/loop /report ops         self-paced
```

A run is still two phases internally:

**Phase 1 — collect (free).** Plain Node runs the collector, which queries Postgres or
shells out to build commands and writes JSON to `docs/reports/<dept>/.data/`. No model
is involved, so this phase costs nothing and can be re-run freely while debugging.

**Phase 2 — interpret (costs tokens).** The department agent reads that JSON plus the
previous report, then writes the new one. Model usage is billed here, against the same
allowance as ordinary interactive work.

Keeping the phases separate means a collector can be fixed and re-run without spending
anything, and a report can be regenerated from stored JSON without re-querying.

## Why not cron or launchd

Considered and rejected. An OS scheduler would run departments without a session open,
but it carries three costs that outweigh that at this stage:

- **The Mac must be awake.** cron silently misses runs during sleep, permanently.
  launchd recovers missed runs on wake but cannot wake the machine itself.
- **A nearly empty environment.** Verified on this machine: in a clean environment
  `node` is not found at all. Node lives under nvm at
  `/Users/lauurnce/.nvm/versions/node/v24.18.0/bin` and reaches `PATH` only through the
  interactive shell profile, which launchd does not load. Every scheduled script would
  need `PATH`, credentials, and working directory set explicitly.
- **Silent failure looks like good news.** A scheduled department that stops running
  produces no error — just an absence of reports, which reads as "nothing is wrong."

Session-bound invocation avoids all three, and has a property worth keeping: every run
happens while the founder is present to read it. Tokens are only spent during actual
working time.

The upgrade path, if reports later justify running unattended, is a private reports
repository with a cloud runner — which solves the sleep and environment problems
properly rather than working around them.

---

# Testing

Collectors are ordinary TypeScript, tested with Vitest like the rest of `lib/` —
fixtures for aggregate shapes and edge cases: empty windows, PH-time month boundaries,
devices with partial funnels, months with no revenue.

Interpreters are not unit-tested; their output is prose. The guarantee is structural —
every number an interpreter cites came from a tested collector, and the report format is
fixed enough that a missing section is obvious.

The severity taxonomy is tested for a specific failure: an ACCEPTED finding must not
reappear as NEW on the next run. That regression would make the whole log untrustworthy.

# Data access

| File | Contents | Used by |
|---|---|---|
| `.env.reports.local` | Production Supabase credentials | `scripts/reports/*` only |
| `.env.local` | Development secrets, no Supabase | `npm run dev` |

Both gitignored. The split exists because local dev pointed at production would write
rows into `events`, `profiles`, and `feedback` — polluting the exact dataset Growth
reads, so testing would corrupt its own funnel numbers.

**Production values cannot be pulled from Vercel.** They are flagged Sensitive there,
making them write-only; `vercel env pull` returns `"[SENSITIVE]"` placeholders. Supabase
credentials come from the Supabase dashboard directly.

**Aggregate in Postgres, not JavaScript.** Supabase caps a `select` at 1000 rows and the
`events` table is far past that, so collectors call Postgres aggregate functions over
RPC — following `20260629000000_admin_top_sections.sql`,
`20260629000001_admin_waitlist_agg.sql`, and `20260706000001_admin_profiles_agg.sql`.

# Privacy and disclosure

The repository is public. The established rule, visible in `.gitignore` around
`docs/POST-MORTEM.md` and `docs/vercel-status/`, is that **reach metrics are public and
revenue, conversion, traffic, and security findings are not**.

All four departments produce output on the private side of that line. `docs/reports/` is
gitignored in full. This spec deliberately describes what is measured without publishing
measured values.

# Build sequence

## Why one department at a time

Four departments in one plan would be a plan too large to execute reliably — each needs
a collector, tests, an agent definition, and report scaffolding.

More importantly, the **first department built is not just a department**. It establishes
the shared machinery every later one inherits: the report contract, the severity
taxonomy, the file layout, the `/report` command, the cost ledger, and the diff-against-
previous behaviour. Once that exists and is proven, departments two through four are
mostly their own collector and their own charter. The first is expensive; the rest are
cheap.

That argues for making the first department the one where the machinery is easiest to
prove — not the one with the most valuable output.

## Build cost versus build value

These orders are not the same, which is the whole difficulty:

| Department | Build cost | Why |
|---|---|---|
| **Operations** | Lowest | The `vercel-status` procedure already exists and works. Marginal cost is the build, test, dependency, and data-ops modules. |
| **Security** | Low | Repo greps, migration parsing, `npm audit`. No database work. |
| **Finance** | Low | `payments` and `subscriptions` are small enough to read with a plain select — no aggregate migration needed. |
| **Growth** | Highest | 141k+ events forces a Postgres aggregate function and RPC migration, plus funnel edge cases and the admin-dashboard repair. |

Business value runs close to the reverse: Growth first, then Finance and Security, then
Operations.

## The order

1. **Operations** — nearly free, since the procedure is already written and proven. Its
   real job here is to establish the shared machinery cheaply, so that machinery is
   debugged against an easy case rather than the hardest one.
2. **Growth** — highest value and the most work. Built second so it inherits proven
   infrastructure instead of inventing it, and so the council becomes available as soon
   as it lands.
3. **Finance** — cheap, and its reconciliation finding is the one most likely to be
   promoted in council by Growth's context.
4. **Security** — cheap, and benefits most from having the other three present, since
   its severities are the ones most often re-ranked by business context.

The council becomes available after step 2 and improves with each addition.

Deferring Growth by one step costs roughly one build cycle. Building it first would mean
debugging the report contract, the severity taxonomy, the cost ledger, and a Postgres
aggregate migration simultaneously — and if the format needs revision after seeing real
output, that revision lands on the most complex department instead of the simplest.
