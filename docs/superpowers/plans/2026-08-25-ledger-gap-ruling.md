# Ledger gap ruling · 2026-08-25

Executor B (opencode-B), worktree `~/projects/survivalKitApp-finance`,
branch `chore/ledger-gap-ruling` (base 4874a98). Acting as LEDGER per
`.claude/agents/ledger.md`.

## Goal

Today's growth report found an entitlement-vs-ledger gap:
devices with active subscriptions exceed devices with recorded payments by 2.
Rule on each of those 2 entitlements per the Finance charter:

- known exception (demo / owner unlock / manual grant),
- legitimate comp,
- renewal edge case, or
- an actual leak → escalate.

If known exceptions, register them in `KNOWN_EXCEPTIONS`
(`lib/reports/ledgerIntegrity.ts`) with reason + `since: 2026-08-25`,
confirm the vitest suite green, re-run the monthly collector, and close
or escalate the growth-report P2 finding in a finance report update.

## Constraints

- READ-ONLY against production: SELECT-style reads only (service-role client
  per `scripts/reports/supabaseAdmin.ts`). Never INSERT/UPDATE/DELETE.
- Owned globs only: `lib/reports/ledgerIntegrity.ts`, `scripts/reports/finance.ts`,
  plus gitignored `docs/reports/**`. Anything else → report, don't touch.
- Disclosure rule: device ids, link ids, amounts stay inside gitignored
  `docs/reports/finance/`. This file names no production identifier.
- Conventional commits (`chore(ledger): …`), no Co-Authored-By trailers.
- Do NOT merge to main.

## Facts (as found)

- Charter read first: reconciliation before opining; name every exception
  individually; register legitimate ones rather than ignoring them;
  `matchedByRenewal` is good news, never an exception.
- Existing register shipped empty until 2026-08-24, then took 5 confirmed
  entries: four batch owner unlocks + one seeded demo subscription.
- Relevant test suite: `lib/reports/ledgerIntegrity.test.ts`.
- Collector env: `.env.reports.local` symlinked, credentials ready.

## Steps

1. [x] Read charter + claims registry.
2. [x] Run `npm run report:finance:weekly` for the current baseline
       (writes gitignored `docs/reports/finance/weekly/`).
3. [x] Identify the 2 unmatched subscription rows from the reconciliation
       output; run read-only queries for their full rows + any payment trail
       and unlock/manual-grant evidence.
4. [x] Classify each per charter taxonomy.
5. [x] If known exceptions: register with reason + since 2026-08-25, run
       `npx vitest run lib/reports/ledgerIntegrity.test.ts` (+ related suites),
       confirm green, commit separately.
6. [x] Re-run monthly collector (`npm run report:finance`) and confirm
       unexplained entitlements returns to 0 (or document why not).
7. [x] Write ruling into `docs/reports/finance/<YYYY-MM>.md` per charter
       format, marking the growth P2 CLOSED or ESCALATED with evidence.
8. [x] Cost ledger line appended (charter step 6).
9. [ ] Final verdict-first report in chat.

## Findings log

(Appended as work proceeds. No production identifiers here.)

- 2026-08-25 — session start, plan committed before any investigation.
- 2026-08-25 — weekly baseline collected: ledger internally reconciles,
  0 unexplained; 1 locally-minted manual grant not yet registered;
  5 known exceptions already registered 2026-08-24.
- 2026-08-25 — read-only production queries reproduce growth's counters
  exactly: devices_subscribed 11, devices_paid 9, gap = 2 devices. Both gap
  rows carry locally-minted link ids, zero payments, synthetic device ids
  with no event history, and expired periods. The owner-unlock device is NOT
  in the gap — it has its own gateway payments.
- 2026-08-25 — classification: both known-style hand grants, no leak. Demo row
  already registered; the manual grant registered this run (commit a5bb447),
  test updated to pin the six-entry register, 38/38 green, tsc clean.
- 2026-08-25 — monthly re-run: unexplained entitlements stays 0;
  locally-minted 1 → 0; known-exceptions 5 → 6. Growth P2 CLOSED in
  docs/reports/finance/2026-08.md. Cost ledger line appended (department
  finance, findingCount 1).
