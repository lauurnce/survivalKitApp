# Semester rollover runbook

How long a semester pass lasts is decided by one dated list,
`TERM_SCHEDULE` in `lib/terms.ts`. Nothing else in the code holds a term date:
the webhook, the class-block grant, the receipt, the plan cards' "until Jan 31"
copy, the renewal line in expiry mail and the finance report all read it.

This runbook is what to check once per term. Done on time, the rollover needs
no code change beyond adding one entry to the schedule.

## How the schedule works

| Field | Meaning |
|---|---|
| `purchasableFrom` | First instant (PH midnight) a semester purchase counts toward this term |
| `accessEndsAt` | When that access ends: 23:59:59 PH on the last day, written as `…T15:59:59Z` |

A semester purchase (`subject_sem`, `year_sem`, class blocks) belongs to the
**latest term whose `purchasableFrom` has passed**, keyed to the payment's
`paid_at`, and ends at that term's `accessEndsAt`. Every plan keeps a 31-day
floor. A monthly plan (`subject_month`) is always 31 days and ignores terms.

Current schedule, with the reasoning:

| Term | Purchasable from (PH) | Access ends (PH) | Why |
|---|---|---|---|
| `ay2026-27-sem1` | Jun 1, 2026 | Jan 31, 2027 23:59 | Past PUP's 1st-sem finals (~Jan 12–17). Unchanged from the old `SEMESTER_END`. |
| `ay2026-27-sem2` | Jan 1, 2027 | Jun 30, 2027 23:59 | PUP's 2nd-sem finals ~Jun 15–21 (estimate) + ~9 days slack. From Jan 1 a 1st-sem pass would have under 31 days left, and USTP starts Jan 5. |
| `ay2026-27-midyear` | Jun 1, 2027 | Jul 31, 2027 23:59 | Summer classes and PUP stragglers; ends before the Aug 4–17 freshman wave. |

Source for every date: `docs/gtm/academic-calendars-ay2026-27.md`.

**Trade-off to know:** a PUP student who buys between Jan 1 and their Jan 17
finals gets access to Jun 30, i.e. their whole 2nd semester too. That is
deliberate: the alternative (a later cutoff) would give a USTP student who
buys on Jan 5 a 31-day stub.

**If the schedule runs out**, a semester buyer gets 31 days and
`periodEndFor` logs `no term in TERM_SCHEDULE covers …`. Two tripwires stop that
from happening silently:

- `lib/terms.test.ts` fails (CI and `npm test`) once the last term is within
  **30 days** of ending with no successor. For the schedule above that is
  **Jul 1, 2027**.
- The monthly finance report prints **Days of term schedule left**.

Similarly `lib/reports/academicCalendar.test.ts` fails once `TERM_CALENDAR`
covers less than 30 days ahead (Sep 3, 2027 for the calendar today).

## Each term: checklist

Do this when a school publishes its next calendar, and no later than 45 days
before the last scheduled `accessEndsAt`.

### 1. Add or correct the schedule entry

In `lib/terms.ts`, append the next term. Rules (enforced by
`scheduleProblems()`, which the test suite runs):

- `purchasableFrom` on or before the previous term's `accessEndsAt` — no gap.
- `accessEndsAt` at `T15:59:59Z` and at least 31 days after `purchasableFrom`.
- Ids are never reused.
- Pick the end from the **latest** school in the audience (PUP so far): a pass
  must outlast the last finals week it is sold for. Cite the calendar in `why`
  and say ESTIMATE when the date is inferred.

Next one due: **AY 2027–28 1st semester**. Expected shape, to be confirmed
against published calendars: purchasable from Aug 1, 2027; access ending
Jan 31, 2028 if PUP keeps January finals.

```sh
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
npx vitest run lib/terms.test.ts
```

### 2. Extend the academic calendar

In `lib/reports/academicCalendar.ts`, add the next term's windows to
`TERM_CALENDAR` (contiguous, non-overlapping, every inferred window's `note`
containing `ESTIMATE`). Replace estimates with published dates when they
appear; the 2nd sem AY 2026–27 windows are all projected today.

```sh
npx vitest run lib/reports/academicCalendar.test.ts
```

### 3. Check the copy

Nothing to edit by hand: the plan cards call `semesterUntilLabel()`. Confirm it
quotes what you expect for a date in the new term:

```sh
npx tsx -e 'import("./lib/terms").then(t => console.log(t.semesterUntilLabel(new Date("2027-08-15T00:00:00+08:00"))))'
```

`lib/terms.test.ts` fails if a hand-typed "until <Month> <day>" comes back into
`components/SubscribeGate.tsx` or `components/account/SubscribeModals.tsx`.
If you add a new surface that quotes the end, call `semesterUntilLabel()` and
add the file to that test's `SURFACES` list.

### 4. Check the expiry emails for the ending term

The daily cron (`vercel.json`: `0 1 * * *`, i.e. 09:00 PH, anywhere inside
that hour) scans for subscriptions ending in 4 days and those that ended 3
days ago, each window one day wide plus 2 hours of slack. For a term ending at
23:59 PH on day D:

| Mail | Queued by the run on | Lead / lag |
|---|---|---|
| `expiry_warning` | D−3, 09:00 PH | ~3 days 15 h before the end |
| `winback` | D+4, 09:00 PH | ~3 days 9 h after the end |

For Jan 31, 2027: warning **Jan 28**, win-back **Feb 4**. Both include "A
semester pass bought now runs until …", computed when the mail is sent, so the
Jan 28 warning quotes Jun 30, 2027.

Capacity: `drain()` sends at most 50 rows per call, transactional kinds first
(receipt, welcome, expiry_warning, winback), marketing (reactivation) only in
the room left. The whole semester cohort shares one end instant, so it is
queued in one run. If the cohort exceeds ~50, the rest go out on the
following daily runs (and on each purchase's webhook drain): up to 4 drains
fit before the end, so ~200 warnings arrive in time. Resend's free tier is
100/day, 3,000/month; check that before a large term end.

Each mail is scoped to `<subscription id>:<period end>`, so a subscription
renewed on the same device (same row, new end) is warned again for the new
end. Scans skip a subscription when the same account already holds later
access to the same content (a renewal on another device, or a year pass over
a subject pass).

Read-only checks (Supabase SQL editor). Size of the cohort ending this term:

```sql
select current_period_end, count(*) as subs,
       count(*) filter (where user_id is not null) as with_account
from subscriptions
where status = 'active'
  and current_period_end = '2027-01-31T15:59:59Z'   -- the ending term's accessEndsAt
group by 1;
```

Everything due in the outbox around the end, by kind:

```sql
select kind, status, count(*)
from email_outbox
where send_after >= '2027-01-26' and send_after < '2027-02-06'
group by 1, 2
order by 1, 2;
```

Marketing load that could compete for the daily cap (should be zero pending
near a term end; reactivation was scheduled Nov 24–Dec 3, 2026):

```sql
select date_trunc('day', send_after) as day, status, count(*)
from email_outbox
where kind = 'reactivation' and status = 'pending'
group by 1, 2
order by 1;
```

After the warning run, compare against the cohort count above (rows can be
fewer: no account, no email, or already renewed elsewhere):

```sql
select status, count(*) from email_outbox
where kind = 'expiry_warning'
  and (payload->>'accessEndsAt')::timestamptz = '2027-01-31T15:59:59Z'
group by 1;
```

Do not enqueue anything by hand; the cron does it.

### 5. If a term end moves after passes were sold

Rows already written keep the old end. Never shorten access. To extend:

1. Change `accessEndsAt` in `lib/terms.ts`, merge and deploy (new sales get the
   new end from then on).
2. Dry run, then apply. `--to` must be a term end in the deployed schedule:

   ```sh
   npx tsx scripts/db/extend-semester-subscriptions.ts \
     --from 2027-06-30T15:59:59Z --to 2027-07-07T15:59:59Z
   npx tsx scripts/db/extend-semester-subscriptions.ts \
     --from 2027-06-30T15:59:59Z --to 2027-07-07T15:59:59Z --apply
   ```

   It matches `current_period_end` exactly, prints ids/plan/status only, and a
   second `--apply` is a no-op. Credentials: `.env.reports.local`.
3. Class blocks are reported by the script but not changed. To extend them too
   (SQL editor, after checking the count the script printed):

   ```sql
   update classes
   set current_period_end = '2027-07-07T15:59:59Z'
   where current_period_end = '2027-06-30T15:59:59Z';
   ```

4. Expiry mail already queued for the old end would announce the wrong date.
   Mail is scoped to `<subscription id>:<period end>`, so once the rows carry
   the new end the cron queues a fresh warning for it on its own. Only the
   stale pending rows need clearing, before they send:

   ```sql
   update email_outbox
   set status = 'failed', last_error = 'skipped: term end moved'
   where kind in ('expiry_warning', 'winback') and status = 'pending'
     and (payload->>'accessEndsAt')::timestamptz = '2027-06-30T15:59:59Z';
   ```

   A warning that already **sent** for the old end cannot be recalled; the
   subscriber also gets the corrected one 4 days before the new end.

### 6. Gates

```sh
npm run typecheck && npm run lint && npm test
npm run report:finance   # "Days of term schedule left" should be > 30
```
