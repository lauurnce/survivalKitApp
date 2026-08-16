# Admin Dashboard v2 — Behavioural Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace a dashboard that measures traffic with one that measures behaviour — where students exit the content, how paying subscribers actually use the product, and who the audience is — so the owner can tell which part of the product to fix next.

**Architecture:** Three layers, built bottom-up. A schema layer bridges the two identity systems (`device_id` activity and `user_id` profiles) and adds device type to events. A Postgres aggregate layer replaces four unauditable production RPCs with migration-defined functions. A UI layer rebuilds the dashboard against those aggregates behind characterization tests written first.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript (target ES2017), Supabase/Postgres, Vitest, Tailwind.

## Global Constraints

- **The word "users" is banned in dashboard copy.** Devices and accounts are separate populations differing by roughly 470× in current data. Say "devices" or "accounts", never "users".
- **Aggregate in Postgres, never in JavaScript.** Supabase caps a `select` at 1000 rows and `events` is far past that; client-side counting silently truncates and reports a confidently wrong number.
- **Manila dates everywhere** (`Asia/Manila`), half-open windows (`>= since`, `< until`).
- **Every new Postgres function gets its `revoke`/`grant` pair immediately after its own `create or replace function`** — never batched at the end of the migration. Postgres default-grants `EXECUTE` to `PUBLIC`; a paste that errors partway leaves earlier functions readable by anyone holding the public anon key.
- **Every migration gets a `<name>.test.md`** verification checklist recording a real Postgres run, not an assertion.
- **Migrations are never applied by an agent.** Applying schema is the owner's action.
- **`module_progress.module_id` is TEXT while `modules.id` is UUID.** Cast the uuid side to text; casting text→uuid raises on the first non-uuid row ever written and takes the whole report down for one bad record.
- **`events` has no `user_id` today and is excluded from `lib/auth/claim.ts:4`.** Until Task 3 lands, subscriber joins go through `device_id` only.
- **`subscriptions` rows are UPSERTED on renewal**, so `subscriptions.created_at` does not mark when the current paid period began. Use `payments.paid_at` (append-only) as the window start.
- **`docs/reports/` is gitignored and the repo is PUBLIC.** No traffic, revenue, or conversion figure may enter a tracked file.
- Tests colocate as `<name>.test.ts` / `<name>.test.tsx`. No new npm dependencies without a reason.
- Commits use conventional-commit prefixes, **no trailer block ever**, no `Co-Authored-By`.

## Prerequisite

**This plan starts from `main` with `feat/growth-department-agent` already merged.** That branch modifies `app/admin/page.tsx` and `components/AdminDashboard.tsx`; starting before it merges guarantees conflicts. Branch: `feat/admin-dashboard-v2`.

---

## Phase 0 — Safety net

### Task 1: Characterization tests for the current dashboard

**Files:**
- Create: `components/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a fixture factory `makeDashboardProps(overrides?: Partial<Props>): Props` that later tasks reuse when asserting new sections.

1,386 lines of admin UI have zero tests. Every later task restructures that code. These tests pin what renders **today**, so a regression fails loudly instead of shipping.

Do not fix anything you notice while writing these. Pin current behaviour even where it is wrong — the misleading tiles are corrected in Task 8, and a test that already asserts the corrected copy would pass against unfixed code and guard nothing.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AdminDashboard from "./AdminDashboard";

function makeDashboardProps(overrides: Record<string, unknown> = {}) {
  return {
    totalUniqueUsers: 5668,
    newUsers: 66,
    recurringUsers: 5602,
    activeNow: 1,
    todayUsers: 73,
    last7Sessions: 624,
    approvedUnlocks: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscribers: 0,
    dau: [],
    funnelSteps: [],
    topSubjects: [],
    topModules: [],
    topSections: [],
    payments: [],
    revenueRows: [],
    waitlistEntries: [],
    waitlistAgg: { total: 0, by_source: [], by_subject: [] },
    profilesAgg: {
      total: 12,
      by_pathway: [{ pathway: "IT Support", count: 7 }],
      by_university: [{ university: "Polytechnic University of the Philippines", count: 2 }],
      by_major: [{ major: "BS Information Technology", count: 9 }],
    },
    ...overrides,
  };
}

describe("AdminDashboard (characterization)", () => {
  it("renders every numbered section band in order", () => {
    render(<AdminDashboard {...(makeDashboardProps() as never)} />);
    const bands = screen.getAllByTestId("section-band-eyebrow").map((n) => n.textContent);
    expect(bands).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("renders a stat tile's value and label as given", () => {
    render(<AdminDashboard {...(makeDashboardProps() as never)} />);
    expect(screen.getByText("5,668")).toBeInTheDocument();
    expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
  });

  it("renders one BarChart row per datum with its count", () => {
    render(<AdminDashboard {...(makeDashboardProps() as never)} />);
    expect(screen.getByText("IT Support")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("shows the full university name in the label's title attribute", () => {
    render(<AdminDashboard {...(makeDashboardProps() as never)} />);
    const label = screen.getByTitle("Polytechnic University of the Philippines");
    expect(label).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add the test id the first assertion needs**

In `components/AdminDashboard.tsx`, in `SectionBand` (around L102-122), add `data-testid="section-band-eyebrow"` to the element rendering the eyebrow number. This is the only production change in this task.

- [ ] **Step 3: Run the tests**

Run: `npm test -- AdminDashboard`
Expected: PASS, 4 tests. If the section-band assertion fails, read the actual array it printed and correct the expectation to match reality — the point is to pin what exists, not to assert what you assume.

- [ ] **Step 4: Prove the tests guard something**

Temporarily change the `Total Users` label in `AdminDashboard.tsx` to `Total Devices`, re-run `npm test -- AdminDashboard`, and confirm the stat-tile test FAILS. Restore the label and confirm the suite passes again and `git status` is clean apart from the test file and the test id.

**Paste the failure output into your task report.** A characterization test that passes against changed code protects nothing, and this repo has been bitten by exactly that.

- [ ] **Step 5: Commit**

```bash
git add components/AdminDashboard.test.tsx components/AdminDashboard.tsx
git commit -m "test(admin): pin current dashboard rendering before the rebuild"
```

---

## Phase 1 — Schema

### Task 2: Add `device_type` to events

**Files:**
- Create: `supabase/migrations/20260820000000_events_device_type.sql`
- Create: `supabase/migrations/20260820000000_events_device_type.test.md`
- Modify: `app/api/events/route.ts`

**Interfaces:**
- Consumes: `getDeviceType` from `lib/deviceType.ts`.
- Produces: `events.device_type text` — `'mobile' | 'desktop' | null`. Null means "recorded before this migration", never "unknown device".

Device type currently exists only on `waitlist`, so it describes signups and nothing else. Putting it on `events` makes device mix visible at every funnel step, which is what answers "do phone students convert worse than laptop students".

- [ ] **Step 1: Write the migration**

```sql
-- events.device_type: mobile vs desktop at every funnel step.
--
-- Until now device type lived only on `waitlist`, so it described signups and
-- nothing else. On `events` it segments the whole funnel.
--
-- Nullable on purpose and NOT backfilled: rows written before this migration
-- genuinely have no device signal, and inventing one would make a guess
-- indistinguishable from a measurement. Read NULL as "not recorded", never as
-- "unknown device".
alter table events
  add column if not exists device_type text
  check (device_type is null or device_type in ('mobile', 'desktop'));

-- Partial index: every analytical query filters to rows that HAVE a device
-- type, so indexing the nulls would be dead weight on the largest table.
create index if not exists events_device_type_created_idx
  on events (device_type, created_at desc)
  where device_type is not null;
```

- [ ] **Step 2: Write the verification checklist**

Create `supabase/migrations/20260820000000_events_device_type.test.md` with, in order: (1) a RED state query proving the column is absent — `select column_name from information_schema.columns where table_name='events' and column_name='device_type';` expected zero rows; (2) the apply step with a blank for the date applied and the role used; (3) a GREEN state re-running the same query, expected one row; (4) the constraint check — `insert into events(device_id, event_type, device_type) values ('test','enter','tablet');` expected to FAIL on the check constraint, then `rollback`; (5) an index check — `select indexname from pg_indexes where tablename='events' and indexname='events_device_type_created_idx';` expected one row.

- [ ] **Step 3: Populate it on write**

In `app/api/events/route.ts`, import `getDeviceType` from `lib/deviceType.ts`, derive the type from the request's user-agent and client hints exactly as `app/api/waitlist/route.ts` already does, and include `device_type` in the inserted row. Read the waitlist route first and mirror its call — do not invent a second way of deriving the same value.

- [ ] **Step 4: Test the write path**

Add to `app/api/events/route.test.ts` a case asserting that a request with a mobile user-agent inserts `device_type: "mobile"`, and one with a desktop user-agent inserts `"desktop"`. Follow the mocking style already used in that file.

Run: `npm test -- events`
Expected: PASS including the two new cases.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260820000000_events_device_type.sql supabase/migrations/20260820000000_events_device_type.test.md app/api/events/route.ts app/api/events/route.test.ts
git commit -m "feat(analytics): record device type on every event"
```

---

### Task 3: Bridge profiles to behaviour

**Files:**
- Create: `supabase/migrations/20260820000001_events_user_id.sql`
- Create: `supabase/migrations/20260820000001_events_user_id.test.md`
- Modify: `lib/auth/claim.ts`
- Modify: `app/api/events/route.ts`
- Test: `lib/auth/claim.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `events.user_id uuid null references auth.users(id) on delete set null`, claimed on login.

**This task is the reason the dashboard can answer anything about who students are.** `profiles` keys on `user_id`; `events` keys on `device_id` and never receives a `user_id`. Today those two tables cannot be joined at all, so "conversion by university" is unanswerable — not thin, unanswerable. Claiming events on login attributes a device's whole prior history to the account.

- [ ] **Step 1: Write the migration**

```sql
-- events.user_id: the bridge between behaviour and identity.
--
-- `profiles` keys on user_id. `events` keys on device_id. Without this column
-- there is NO join path between what a student did and who they are, so
-- questions like "do Cybersecurity students convert better" cannot be asked
-- of this schema at all.
--
-- `on delete set null` rather than cascade: deleting an account must not
-- delete the behavioural record, or every funnel number silently rewrites
-- itself retroactively when someone deletes their account.
alter table events
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists events_user_id_created_idx
  on events (user_id, created_at desc)
  where user_id is not null;
```

- [ ] **Step 2: Write the verification checklist**

Create the `.test.md` with: RED state (column absent), the apply step with date-applied and role blanks, GREEN state (column present, is nullable, references `auth.users`), an index check, and a **deletion-semantics check**: insert a throwaway auth user and an event carrying its id, delete the user, confirm the event row still exists with `user_id` now null. State the expected result explicitly for each.

- [ ] **Step 3: Add events to the claim list**

In `lib/auth/claim.ts`, add `"events"` to the `TABLES` list at line 4. Read the surrounding claim logic first and confirm the same `device_id → user_id` update pattern applies unchanged to `events`; if it does not, stop and report rather than special-casing it.

- [ ] **Step 4: Write the failing test**

In `lib/auth/claim.test.ts`, add a case asserting that claiming a device updates `events` rows for that `device_id` with the given `user_id`, following the existing cases' mocking style.

Run: `npm test -- claim`
Expected: FAIL before Step 3's edit, PASS after. Run it both ways and paste both outputs — a claim test that passes without the table in the list is not testing the claim.

- [ ] **Step 5: Stamp user_id on new events**

In `app/api/events/route.ts`, include the authenticated `user_id` on insert when a session exists, leaving it null for anonymous traffic.

- [ ] **Step 6: Run the suite and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add supabase/migrations/20260820000001_events_user_id.sql supabase/migrations/20260820000001_events_user_id.test.md lib/auth/claim.ts lib/auth/claim.test.ts app/api/events/route.ts
git commit -m "feat(identity): bridge event history to accounts on login"
```

---

### Task 4: Canonical program and university names

**Files:**
- Create: `lib/academicPrograms.ts`
- Test: `lib/academicPrograms.test.ts`
- Modify: `lib/profile.ts`
- Modify: `components/account/ProfileCard.tsx`

**Interfaces:**
- Consumes: `matchUniversity` from `lib/universities.ts`.
- Produces: `canonicalProgram(raw: string): string` and `canonicalUniversity(raw: string): string`. Both are total functions: an unrecognised value is returned trimmed, never dropped and never coerced to "Other".

Twelve profiles currently display as four majors — `BS Information Technology` (9), `BS INFORMATION TECHNOL…` (1), `BSIT` (1), `BS Information technology` (1) — because `lib/profile.ts` only trims and length-caps. Normalising at read time fixes today's data; a picker at write time stops new variants arriving. Both are needed: the picker alone leaves the existing twelve split.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { canonicalProgram, canonicalUniversity } from "./academicPrograms";

describe("canonicalProgram", () => {
  it("collapses the four observed BSIT spellings to one label", () => {
    const variants = [
      "BS Information Technology",
      "BS INFORMATION TECHNOLOGY",
      "BSIT",
      "BS Information technology",
    ];
    const canon = variants.map(canonicalProgram);
    expect(new Set(canon).size).toBe(1);
    expect(canon[0]).toBe("BS Information Technology");
  });

  it("returns an unrecognised program trimmed rather than dropping it", () => {
    expect(canonicalProgram("  BS Marine Biology  ")).toBe("BS Marine Biology");
  });

  it("treats blank input as Not specified", () => {
    expect(canonicalProgram("   ")).toBe("Not specified");
  });
});

describe("canonicalUniversity", () => {
  it("collapses a known alias to the canonical name", () => {
    expect(canonicalUniversity("PUP")).toBe("Polytechnic University of the Philippines");
  });

  it("returns an unknown university trimmed rather than dropping it", () => {
    expect(canonicalUniversity("  Some New College  ")).toBe("Some New College");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/academicPrograms.test.ts`
Expected: FAIL — cannot resolve `./academicPrograms`.

- [ ] **Step 3: Implement**

Create `lib/academicPrograms.ts` exporting both functions. `canonicalProgram` normalises by uppercasing and stripping punctuation and whitespace for lookup against an alias map whose first entry maps `BSIT`, `BS INFORMATION TECHNOLOGY` and `BS INFO TECH` to `"BS Information Technology"`; unmatched input returns `raw.trim()`; blank returns `"Not specified"`. `canonicalUniversity` delegates to `matchUniversity` from `lib/universities.ts` and returns its canonical name on a hit, `raw.trim()` on a miss, `"Not specified"` on blank.

**`matchUniversity` is exact case-insensitive matching with no fuzzy logic** — verify that yourself in `lib/universities.ts` before relying on it, and do not add fuzzy matching here.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run lib/academicPrograms.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Normalise at write time**

In `lib/profile.ts`'s `validateProfile`, pass `university` through `canonicalUniversity` and `major` through `canonicalProgram` before the existing length cap. In `components/account/ProfileCard.tsx`, replace the free-text major input with a combobox modelled on the existing `UniversityCombobox`, offering the canonical program list plus a free-text escape so an unlisted program is still enterable.

- [ ] **Step 6: Run the suite and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add lib/academicPrograms.ts lib/academicPrograms.test.ts lib/profile.ts components/account/ProfileCard.tsx
git commit -m "feat(profiles): canonicalise program and university names"
```

---

## Phase 2 — Aggregates

### Task 5: Identity and exit aggregates

**Files:**
- Create: `supabase/migrations/20260820000002_dash_identity_exit_agg.sql`
- Create: `supabase/migrations/20260820000002_dash_identity_exit_agg.test.md`

**Interfaces:**
- Produces two functions:
  - `dash_identity_agg()` → `{ devices_reached, devices_any_event, accounts, accounts_confirmed, profiles, devices_paid, subscriptions_active }`
  - `dash_exit_agg(p_since timestamptz, p_until timestamptz)` → `{ depth: {...}, exit_modules: {rows, total_groups}, exit_subjects: {rows, total_groups} }`

`dash_identity_agg` replaces `admin_user_totals`, which has **no migration anywhere in this repo** — the "5,668 Total Users" figure is currently unauditable. `dash_exit_agg` answers the owner's actual churn question: how many devices stop after exactly one module or one subject, and which module or subject they stopped on.

`modules.sort_order` and `subjects.sort_order` both exist and are used for ordering in the app, so "the first module" is well defined — verify both columns yourself before relying on them.

- [ ] **Step 1: Write `dash_identity_agg`**

Two populations, never merged. Devices come from `events.device_id`; accounts from `auth.users`; profiles from `profiles`; paid from `payments.device_id`; active subscriptions per `status='active' and current_period_end > now()`. Every count is `count(distinct ...)`. Put the `revoke`/`grant` pair immediately after the function.

```sql
revoke execute on function dash_identity_agg() from public, anon, authenticated;
grant execute on function dash_identity_agg() to service_role;
```

- [ ] **Step 2: Write `dash_exit_agg`**

Build it from CTEs: `activity` (device_id, module_id, subject_id, created_at from `events` where `event_type = 'module_open'` and `created_at` half-open in the window); `per_device` (modules_opened `count(distinct module_id)`, subjects_touched `count(distinct subject_id)`, last_seen `max(created_at)`); `depth` (devices that opened exactly 1 / 2-3 / 4+ modules, and exactly 1 / 2+ subjects); `last_module` (each device's module at `last_seen`, joined to `modules` and `subjects` for titles and `sort_order`).

Return `exit_modules` and `exit_subjects` as **`{ rows, total_groups }`**, capped at 20 rows ordered by device count descending, with `total_groups` computed from the **uncapped** CTE. A `total_groups` computed off the capped subquery always equals `length(rows)` and silently defeats the signal.

Join `module_progress` only with an explicit cast — `modules.id::text = module_progress.module_id` — never the reverse.

Add its `revoke`/`grant` pair immediately after it.

- [ ] **Step 3: Write the verification checklist**

Include for each function: a RED state (function absent), the apply step with date/role blanks, a GREEN state, a shape check naming every expected key, **a permission check run per function** (`has_function_privilege('anon', '<signature>', 'EXECUTE')` expected `false`), and an arithmetic check proving `depth` buckets sum to the distinct device count in the window.

Add a **Step 5a**: run the permission check even if an earlier statement errored, because a function created without its revoke is the one outcome the rest of the checklist cannot detect.

- [ ] **Step 4: Verify the SQL mechanically**

You cannot execute this SQL — no Supabase CLI, no Docker, remote database. So: grep every column named against the migrations that define it, confirm parenthesis balance and `$$` pairing, and confirm each `revoke`/`grant` names the exact argument-type signature of the function above it. A signature mismatch leaves the function granted to `PUBLIC`.

Record each check and its result in your report.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260820000002_dash_identity_exit_agg.sql supabase/migrations/20260820000002_dash_identity_exit_agg.test.md
git commit -m "feat(dashboard): add auditable identity and content-exit aggregates"
```

---

### Task 6: Subscriber engagement aggregate

**Files:**
- Create: `supabase/migrations/20260820000003_dash_subscriber_agg.sql`
- Create: `supabase/migrations/20260820000003_dash_subscriber_agg.test.md`

**Interfaces:**
- Produces `dash_subscriber_agg(p_weeks int default 8)` → `{ active_subscribers, engaged_7d, engaged_28d, dormant, median_modules_per_week, by_plan: [...], top_subjects: {rows, total_groups}, weekly_activity: [...] }`

This answers the owner's retention question: how paying subscribers behave **while** subscribed. They are the priority because they already pay.

**Use `payments.paid_at` as the window start, never `subscriptions.created_at`.** Subscription rows are upserted on renewal, so `created_at` may predate the current paid period by months. `payments` is append-only and carries real per-purchase timestamps.

**Join through `device_id`, never `user_id`.** `events` has no `user_id` until Task 3 is applied, and even after, historical rows only carry it once claimed.

- [ ] **Step 1: Write the aggregate**

CTEs: `subs` (active subscriptions per `status='active' and current_period_end > now()`, carrying `device_id`, `year_id`, `subject_id`, `current_period_end`); `started` (per device, `min(paid_at)` from `payments` for the current period); `activity` (events for those devices at or after their period start); then the engagement buckets, per-plan split (`subject_id is null` = year plan, else subject plan), capped `top_subjects` as `{rows, total_groups}` from the uncapped CTE, and a trailing `p_weeks` complete-PH-week series.

**Trim the weekly series to complete weeks.** Exclude the current in-progress week: a partial week always has fewer days of activity than a finished one purely because it is not over, so including it reads as a manufactured decline in the newest bucket.

`revoke`/`grant` immediately after the function.

- [ ] **Step 2: Write the verification checklist**

Same structure as Task 5, plus a check that `engaged_7d + engaged_28d + dormant` reconciles against `active_subscribers` with the overlap rule stated explicitly, and a check that the weekly series returns **at most** `p_weeks` rows — a week with zero active devices produces no row rather than a zero, so the count is a ceiling, not an equality.

- [ ] **Step 3: Verify mechanically and commit**

Same mechanical checks as Task 5, Step 4. Then:

```bash
git add supabase/migrations/20260820000003_dash_subscriber_agg.sql supabase/migrations/20260820000003_dash_subscriber_agg.test.md
git commit -m "feat(dashboard): add paid-subscriber engagement aggregate"
```

---

## Phase 3 — Collection

### Task 7: Survey capture at signup and after a module

**Files:**
- Create: `supabase/migrations/20260820000004_survey_fields.sql`
- Create: `supabase/migrations/20260820000004_survey_fields.test.md`
- Modify: `components/ModuleSurveyCard.tsx`
- Modify: `app/api/feedback/route.ts`
- Create: `components/account/SignupIntentCard.tsx`
- Test: `components/account/SignupIntentCard.test.tsx`

**Interfaces:**
- Produces: `user_feedback.price_ceiling int null`, `user_feedback.willing_to_pay text null`; `profiles.intent text null`, `profiles.year_level text null`.

A survey already exists — `ModuleSurveyCard` writes `app_rating`, `module_rating` and free text to `user_feedback`, **and it already carries a coupon-code incentive**, which is the response-rate mechanism. Extend it rather than building a parallel one.

**Read the honest limitation into the plan:** a signup-time survey can only reach the population that already converts, currently 12 of 5,668 devices. It will tell you why the twelve stayed, never why the rest left. The module survey fires on activity and does not have this problem to the same degree. Device type comes from Task 2 passively and must not depend on a survey answer.

- [ ] **Step 1: Write the migration**

Add the four nullable columns with `check` constraints on the enumerated values, each `add column if not exists`. Nullable because every existing row predates the question, and a default would make a non-answer indistinguishable from an answer.

- [ ] **Step 2: Write the verification checklist**

RED/apply/GREEN per column, plus a constraint-rejection check per constrained column, plus a check that existing rows are unaffected and read null.

- [ ] **Step 3: Extend the module survey**

Add a price-ceiling question to `components/ModuleSurveyCard.tsx` and persist it in `app/api/feedback/route.ts`. Keep it optional — a required question on an incentivised form trades response rate for completeness and this form's value is its response rate.

- [ ] **Step 4: Build the signup intent card**

Create `components/account/SignupIntentCard.tsx` asking intent and year level once, after account creation, writing to `profiles`. Write the test first, asserting it renders the questions, submits the selected values, and is skippable without blocking account creation.

Run: `npx vitest run components/account/SignupIntentCard.test.tsx`
Expected: FAIL first, then PASS.

- [ ] **Step 5: Run the suite and commit**

```bash
git add supabase/migrations/20260820000004_survey_fields.sql supabase/migrations/20260820000004_survey_fields.test.md components/ModuleSurveyCard.tsx app/api/feedback/route.ts components/account/SignupIntentCard.tsx components/account/SignupIntentCard.test.tsx
git commit -m "feat(survey): capture price ceiling after a module and intent at signup"
```

---

## Phase 4 — Dashboard

### Task 8: Honest identity tiles, and remove the dead ones

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/AdminDashboard.tsx`
- Test: `components/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `dash_identity_agg()` from Task 5.

Three tiles are actively misleading and all three go:

- **"Total Users 5,668"** counts devices, not people, and comes from an unauditable RPC. Becomes **"Devices reached"**, sourced from `dash_identity_agg`.
- **"Recurring Users 5,602"** is literally `total − new_3d`. A device that visited once in March counts as recurring. It measures nothing and is **deleted**, not renamed.
- **"Approved Unlocks 0"** reads a dead event type and will show 0 forever. **Deleted.**

Add **"Accounts created"** and the **device→account conversion**, because that gap is the onboarding problem and belongs on the page as the headline, not buried.

- [ ] **Step 1: Update the characterization tests to the new intent**

Change the Task 1 assertions that pinned `Total Users` and `Recurring Users` to assert `Devices reached`, `Accounts created`, a conversion percentage, and the **absence** of both deleted tiles (`expect(screen.queryByText(/Recurring/i)).toBeNull()`).

Run: `npm test -- AdminDashboard`
Expected: FAIL — the tiles still say the old thing. This is the point: the test now describes the target.

- [ ] **Step 2: Swap the data source**

In `app/admin/page.tsx`, call `dash_identity_agg` and stop calling `admin_user_totals`. Remove the now-unused props through to `AdminDashboard`. Also delete the dead pending-unlocks fetch at L98-103, which is destructured as `{}` and discarded.

- [ ] **Step 3: Rebuild the tiles**

Replace the Activity tiles using the existing `Stat` primitive (L126-164). Do not introduce a parallel tile component.

- [ ] **Step 4: Run and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS, with the updated assertions now green.

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx components/AdminDashboard.test.tsx
git commit -m "fix(admin): count devices and accounts honestly, drop the dead tiles"
```

---

### Task 9: Exit analysis and subscriber retention sections

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/AdminDashboard.tsx`
- Test: `components/AdminDashboard.test.tsx`

**Interfaces:**
- Consumes: `dash_exit_agg`, `dash_subscriber_agg`.

Two new sections, built from the existing `SectionBand`, `Stat` and `BarChart` primitives.

**Where students stop** — devices that opened exactly one module, one subject, the depth distribution, and the top exit modules and subjects by device count.

**Paid subscriber engagement** — active subscribers, engaged in 7d and 28d, dormant, per-plan split, top subjects among subscribers, and the trailing weekly series.

Whenever a capped list is rendered, show **"top N of M"** using `total_groups`. A capped list presented as complete is a confident lie, and the aggregates carry the count precisely so the UI does not have to guess.

- [ ] **Step 1: Write the failing tests**

Extend `components/AdminDashboard.test.tsx` with cases asserting: both new section bands render; the exit section shows the one-module and one-subject device counts; the exit list renders a module title with its device count; a capped list renders "top 20 of 47" when `total_groups` is 47; the subscriber section renders active, engaged and dormant counts.

Run: `npm test -- AdminDashboard`
Expected: FAIL on every new case.

- [ ] **Step 2: Fetch and pass the data**

Add both RPC calls in `app/admin/page.tsx` and pass typed props through, modelling the nested `{rows, total_groups}` shape explicitly. **Access capped lists via `.rows`** — reading a nested field as a flat array yields `undefined` rather than an error and will not fail typecheck if the interface is wrong in the matching way.

- [ ] **Step 3: Render the sections**

Add both sections with the next eyebrow numbers, reusing the primitives.

- [ ] **Step 4: Run and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx components/AdminDashboard.test.tsx
git commit -m "feat(admin): show where students exit and how subscribers engage"
```

---

### Task 10: Remove the waitlist section, add a feedback summary

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/AdminDashboard.tsx`
- Test: `components/AdminDashboard.test.tsx`

Revenue has replaced the waitlist as the demand signal, so the section is dead real estate. Willingness-to-pay and device type are preserved by Tasks 2 and 7, so nothing is lost by removing it.

**Remove exactly this surface and no more.** In `app/admin/page.tsx`: the waitlist select at L111-115, the `waitlistRaw → waitlistEntries` transform at L291-303, the `admin_waitlist_agg` RPC call at L131, the `waitlistAggRaw → waitlistAgg` transform at L278-282, and both props at L335-336. In `components/AdminDashboard.tsx`: interfaces `WaitlistEntry` L42-54 and `WaitlistAgg` L56-60, the two Props entries L86-87, and components `WaitlistPieChart` L411-452, `WaitlistSubjectDemand` L454-496, `WaitlistTable` L677-719 including its CSV export L741-778, `WaitlistSection` L721-857, and the render block L1000-1008.

**Leave the public signup path alone** — `app/api/waitlist/route.ts` and its test, `WaitlistBanner.tsx`, `ComingSoonModal.tsx`, `SubjectComingSoon.tsx`, `lib/rateLimit.ts`. The table keeps receiving signups; only the dashboard section goes.

Note in your report that `admin_waitlist_agg` becomes an orphaned RPC in production. Do not drop it — that is the owner's call.

- [ ] **Step 1: Write the failing tests**

Assert the waitlist section is absent (`queryByText(/Waitlist/i)` is null) and that a feedback summary renders its counts, average ratings and recent comments.

Run: `npm test -- AdminDashboard`
Expected: FAIL — the waitlist still renders and the feedback tile does not exist.

- [ ] **Step 2: Remove the waitlist surface**

Delete exactly the lines listed above.

- [ ] **Step 3: Add the feedback summary**

Add a summary showing counts, average app and module ratings, and the three most recent comments, linking to `/admin/feedback`. Reuse `Stat` and `SectionBand`.

Quote comments sparingly and never render anything identifying — no device id, no user id, no coupon code.

- [ ] **Step 4: Run and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add app/admin/page.tsx components/AdminDashboard.tsx components/AdminDashboard.test.tsx
git commit -m "feat(admin): retire the waitlist section, surface feedback"
```

---

### Task 11: Readable labels and normalised breakdowns

**Files:**
- Modify: `components/AdminDashboard.tsx`
- Modify: `app/admin/page.tsx`
- Test: `components/AdminDashboard.test.tsx`

University names are cut off at `BarChart`'s label span (L285, `w-28 sm:w-40 truncate`). **That fixed width is what keeps every row's bar starting at the same x-position**, so removing it lets long labels push each bar to a different offset and the bar column stops forming a straight edge. Widen the column and allow two lines with a clamp — full names visible, alignment preserved.

`BarChart` is used **six times** (top subjects, top modules, top sections, pathways, universities, majors), so this change affects all of them. Check each still reads well.

- [ ] **Step 1: Write the failing test**

Assert that a long university name renders in full as visible text — not merely in a `title` attribute — and that a `BarChart` given the four BSIT spellings renders **one** row with count 12.

Run: `npm test -- AdminDashboard`
Expected: FAIL on both.

- [ ] **Step 2: Widen and wrap**

Replace the label span's `w-28 sm:w-40 truncate` with a wider column and two-line clamp, keeping `shrink-0` so the bar column stays aligned.

- [ ] **Step 3: Normalise the breakdowns**

In `app/admin/page.tsx`, map `profilesAgg.by_university` through `canonicalUniversity` and `by_major` through `canonicalProgram` from Task 4, **re-summing counts after normalisation** — mapping labels without merging duplicate keys leaves four BSIT rows that now share one label, which looks worse than the original.

- [ ] **Step 4: Run and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add components/AdminDashboard.tsx app/admin/page.tsx components/AdminDashboard.test.tsx
git commit -m "fix(admin): show full names and merge duplicate program spellings"
```

---

## Phase 5 — Release

### Task 12: Redistribute commit dates and push

**Files:** none — git history only.

The owner has asked for this branch's commits to be spread across 2026-08-09 → 2026-08-20 rather than clustered.

**Do this last, after every review has passed and the branch is otherwise final.** Rewriting dates changes every commit SHA, which invalidates every review range recorded in the ledger. Doing it earlier destroys the audit trail this work depends on.

**The owner has been told the repository is PUBLIC** (`github.com/lauurnce/survivalKitApp`), contrary to their initial belief, and confirmed the decision with that correction in hand. Do not re-litigate it; do not proceed if that confirmation is absent from the record.

- [ ] **Step 1: Verify the branch is final**

Run `npm test && npm run typecheck && npm run lint`, and confirm the final review has passed with no open Critical or Important findings. Do not start the rewrite otherwise.

- [ ] **Step 2: Record the current SHAs**

Save `git log --format='%H %ad %s' --date=iso` to a scratch file outside the repo. This is the only way back if the rewrite goes wrong.

- [ ] **Step 3: Rewrite the dates**

Assign each commit a date spread across 2026-08-09 → 2026-08-20, in the existing commit order so history stays chronologically coherent. Use `git rebase` with an `--exec` that sets **both** `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` — setting only the author date leaves GitHub displaying the real commit date and achieves nothing.

- [ ] **Step 4: Verify**

Run `git log --format='%ad %cd %s' --date=short` and confirm author and committer dates match on every commit and all fall in range. Confirm the tree is unchanged: `git diff <recorded-final-sha> HEAD` must be empty — the rewrite must change dates only, never content.

- [ ] **Step 5: Push**

Follow the git-owner-workflow skill: `git fetch origin`, check the behind-count, check open PRs, confirm every outgoing commit is authored by `lauurnce <paneslawrence8@gmail.com>` with no `Co-Authored-By` trailer, then push.

---

## What this plan does NOT deliver

Stated so nobody discovers it later:

- **Nothing works until the owner applies the migrations by hand.** There is no `supabase db push` here, no CLI, and Docker is not running. Five migrations land in this plan and all five need manual application through the Supabase Studio SQL editor as `postgres`, running every permission check.
- **Retroactive profile-to-behaviour analysis is limited to claimed devices.** Task 3 attributes a device's history at login, so a student who never logs in stays unattributed, and one who uses a phone and a laptop is bridged only for devices they log in on.
- **`device_type` is not backfilled.** Rows before Task 2 read null, meaning "not recorded" — device-mix percentages must be computed over rows that have the value, not over all rows.
- **The signup survey cannot explain non-conversion.** It reaches only the ~0.2% who create accounts.
- **The four undefined production RPCs are not dumped into migrations.** This plan stops *depending* on `admin_user_totals`; `admin_funnel_counts`, `admin_dau_30d` and `admin_active_since` remain undefined and still power other parts of the page. That drift belongs to Operations' data-ops sub-function.
- **`admin_waitlist_agg` becomes orphaned** in production. Dropping it is the owner's call.
