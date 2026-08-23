# Three-Track Consolidation — Master Plan

Supersedes the three per-session handoffs (signup school/sector, buyer emails,
contributed PRs). Where they disagree, this file wins — it was written against
measured repo state on 2026-08-23, not memory.

## Decisions taken (by lauurnce, this session)
1. Land order: **PR #21 -> school/sector -> chore/schema-safety -> emails**
2. Migrations: I prepare ONE ordered idempotent SQL script, CI-verified against
   throwaway Postgres; **lauurnce pastes it** into the Supabase SQL Editor.
   (Supabase MCP OAuth deliberately declined — scopes too broad.)
3. Resend marketplace terms: **drive Chrome with lauurnce present**; he makes
   the actual acceptance click (legal agreement in his name).
4. Push scope: **push branches AND merge PR #21**. Other PRs stay for review.

## DONE
- [x] PR #21 merged. origin/main 8f7380f -> a0d7717.
      Auto-closed #1-#12, #15-#19 (17 contributed fixes now on main).
      Verified safe first: PR #21's code is app-level only; migrations
      0003/4/5 merely REVOKE anon access the code already stopped using,
      so code-before-migration is the correct ordering, not a gap.

## Remaining PRs
| PR | What | Blocker |
|----|------|---------|
| #13 | require explicit PAYMONGO_LIVEMODE | value unreadable via CLI ([SENSITIVE]); must be eyeballed in dashboard. If not exactly `true`/`false`, merging 503s every live payment webhook |
| #14 | reject signing secrets <32 chars | prod secrets are 11 chars; needs dual-secret transition (IN PROGRESS) |
| #20 | rate limiter fails closed | must exempt the payment path first |

## Work streams
- **A. Integration trunk** (owner: main session) — merge school/sector +
  schema-safety + emails onto new origin/main. One known collision:
  `app/(auth)/actions.test.ts` asserts `{ error: "taken" }`; PR #19 redacted it
  to `"Unable to create account. Please try again."` Update the expectation,
  KEEP the `saveSignupSchool` not-called assertion — that is the point of the test.
- **B. Dual-secret transition** (agent, `feat/dual-secret-transition`) —
  sign with primary, verify primary then `*_SECRET_PREVIOUS`; 32-char floor on
  primary only, previous exempt. Unblocks #14 without stranding subscribers.
- **C. Rate limiter** (`fix/rate-limit-fail-closed` amend) — fail closed on
  /api/run + /api/feedback, stay fail-open on the payment path.
- **D. Sector audit** (agent, `chore/university-sector-audit`) — verify all 50
  Philippine institutions' Public/Private against CHED; students see this.
- **E. CI Postgres harness** — postgres:16 service applies every migration to a
  throwaway DB per PR. Retires the "live verification NOT run" disclaimers AND
  validates the consolidated SQL before lauurnce pastes it into prod.
- **F. Resend + DNS + email_outbox** — gated on the browser terms click.

## Migrations never applied to prod (ordered)
1. `20260821010000_profiles_school_type.sql`      (school/sector — BLOCKING signup deploy)
2. `20260821020000_admin_profiles_agg_school_type.sql`
3. `20260822000000_email_outbox.sql`              (must run before 0003+)
4. `20260822000003_restrict_privileged_rpcs.sql`
5. `20260822000004_server_only_public_writes.sql`
6. `20260822000005_server_only_feedback_inserts.sql`
Next free number: `20260822000006`.

## Landmines
- Node off default PATH: `export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"`
- `vercel env pull` writes literal `[SENSITIVE]`, producing an invalid
  NEXT_PUBLIC_SUPABASE_URL and a 500 on every page. Copy .env.local instead.
- Do NOT rotate DEVICE_COOKIE_SECRET / ADMIN_SESSION_SECRET standalone —
  that strands every paying subscriber. Only via stream B's runbook.
- CLAUDE.md still claims lauurnce is sole contributor; false since #21.
