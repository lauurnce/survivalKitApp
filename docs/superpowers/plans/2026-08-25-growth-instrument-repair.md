# Growth instrument repair — implementation plan

**Status:** IN PROGRESS · started 2026-08-25
**Origin:** /report all sweep 2026-08-25 — VANTAGE blocked report `docs/reports/growth/2026-08-25.md`
(P1 growth migrations never applied to production · P2 pending-array drift)
**Executor:** opencode session, autonomous, updating this doc as steps complete.

## Goal

`npm run report:growth` produces a real data file from production, and the
pending-array machinery tells the truth again ("exactly the migrations never
applied").

## Verified facts (pre-execution)

| Fact | Evidence | When |
|---|---|---|
| 4 growth migrations absent from prod | VANTAGE control probe (`admin_waitlist_agg` ok vs `growth_identity_agg` missing); `.test.md` headers say UNAPPLIED | 08-25 |
| All 4 honor idempotency contract | grep: `create or replace function` everywhere, `if not exists` index, plain revokes/grants | 08-25 |
| `_21010000_profiles_school_type` APPLIED | live probe: `profiles.school_type` EXISTS | 08-25 |
| `_22000000_email_outbox` APPLIED | live probe: table EXISTS | 08-25 |
| `_22000005_feedback_inserts` APPLIED (inferred) | prod RLS scan shows no anon INSERT policy on user_feedback | 08-25 |
| Supabase CLI authenticated | `npx supabase projects list` returns survivalKitApp `mpdymglipgzuybtxuvhy` | 08-25 |

## Steps

### Step 0 — Verify remaining three "pending" migrations are applied
- [ ] `_21020000_admin_profiles_agg_school_type` — call new-signature RPC as service role
- [ ] `_22000003_restrict_privileged_rpcs` — behavior-probe one restricted RPC as anon (permission denied = applied)
- [ ] `_22000004_server_only_public_writes` — behavior-probe per its contents
- Rule: prune only what is PROVEN applied. In doubt → keep listed (idempotent re-paste is free).

### Step 1 — Fix `scripts/db/build-consolidated.sh`
- [ ] Prune applied entries from `pending`; add the four growth files (sort first)
- [ ] Make heredoc header generated FROM the array (currently hand-written, lines 47–58 — third drift bug)
- [ ] `Generated:` line dynamic (`date +%F`)

### Step 2 — Regenerate artifact
- [ ] `./scripts/db/build-consolidated.sh`; inspect output contains exactly the four

### Step 3 — Branch, commit, push, CI green
- [ ] Branch `chore/growth-migrations-apply`
- [ ] CI gates: `apply-migrations` (fresh replay all migrations) + `validate-consolidated` (prod-minus-pending simulation + drift check)

### Step 4 — Apply to production via Supabase CLI (user-approved autonomous)
- [ ] `npx supabase db execute` against project ref with `consolidated-pending.sql`
- Idempotent → safe re-run on partial failure

### Step 5 — Permission checks + status flips
- [ ] Run Step-5 checks from all four `.test.md`: every growth RPC must REJECT anon calls
- [ ] Flip `UNAPPLIED and UNVERIFIED` headers → applied + date; tick checkboxes

### Step 6 — Prove instrument works
- [ ] `npm run report:growth` writes `docs/reports/growth/.data/<today>.json`, zero refusals

### Step 7 — Close loop
- [ ] Mark P1/P2 CLOSED in `docs/reports/growth/2026-08-25.md`
- [ ] Dispatch VANTAGE for first real weekly growth report
- [ ] Final update to this doc

## Risks / rollback

- Sole watch item: non-concurrent index build on `events` (`events_type_created_idx`) — negligible at current scale.
- Worst case: re-paste artifact (idempotency contract).
- Nothing here touches tracked files with report figures; docs/reports/ stays gitignored.
