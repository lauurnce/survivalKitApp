# Payments Ledger + Dashboard Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record every successful PayMongo payment in an append-only ledger and surface real revenue + a transactions table on the admin dashboard.

**Architecture:** A new `payments` table (unique on `paymongo_link_id`) is written by the webhook before the subscription upsert. The webhook's grant logic moves into a testable `lib/payments.ts` helper. The admin page queries `payments` for real revenue and a transactions list.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + RLS, service-role writes), Vitest, TypeScript.

## Global Constraints

- Amounts are stored in **centavos** (integer); `SUBSCRIPTION_AMOUNT = 5000` = ₱50.00.
- The ledger is **append-only** — no updates/deletes in app code.
- All existing webhook trust guards (rate limit, signature, livemode, event-type, amount, status, remarks-UUID) stay **in front of and unchanged by** the new logic.
- The ledger insert happens **before** the subscription upsert (never grant access without a recorded payment).
- Idempotency is keyed on **`paymongo_link_id` only** (each link is single-use).
- `paid_at` from the payload is **untrusted display metadata** — it never gates access.
- Commits: no `Co-Authored-By` trailer; sole contributor is lauurnce. Already on branch `feat/payments-ledger`.
- Test runner: `npm test` (vitest run) or `npx vitest run <file>` for one file.

---

## File Structure

- `supabase/migrations/20260624120000_payments_ledger.sql` (new) — table, indexes, RLS.
- `lib/supabase/types.ts` (modify) — add `payments` table type.
- `lib/payments.ts` (new) — `recordPayment(supabase, input)` grant/dedup helper + `sumRevenueForMonth(payments, ...)` pure helper.
- `lib/payments.test.ts` (new) — unit tests for both helpers.
- `app/api/webhooks/paymongo/route.ts` (modify) — call `recordPayment`, parse `paid_at`.
- `app/admin/page.tsx` (modify) — query payments, compute real revenue + new-today, pass transactions.
- `components/AdminDashboard.tsx` (modify) — Transactions table + revenue tile wiring.

---

## Task 1: Payments table migration

**Files:**
- Create: `supabase/migrations/20260624120000_payments_ledger.sql`

**Interfaces:**
- Produces: `payments` table with columns `id, paymongo_link_id, device_id, year_id, amount, currency, paid_at, created_at`; unique index on `paymongo_link_id`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260624120000_payments_ledger.sql`:

```sql
-- Append-only ledger: one immutable row per successful link.payment.paid.
-- subscriptions remains the access-control table; this is the audit record.
create table payments (
  id                uuid primary key default gen_random_uuid(),
  paymongo_link_id  text not null,
  device_id         text not null,
  year_id           uuid not null references years(id),
  amount            integer not null,            -- centavos; 5000 = ₱50.00
  currency          text not null default 'PHP',
  paid_at           timestamptz not null,
  created_at        timestamptz not null default now()
);

-- Single-use link => unique. Makes the replay/dedup check race-safe, mirroring
-- the existing subscriptions_paymongo_link_id_idx guard.
create unique index payments_paymongo_link_id_idx on payments (paymongo_link_id);

-- Dashboard reads by recency.
create index payments_paid_at_idx on payments (paid_at desc);

alter table payments enable row level security;

-- Mirror the subscriptions select policy: a device may read only its own
-- payments. The webhook writes via the service role, which bypasses RLS.
create policy "device reads own payments"
  on payments for select
  using (device_id = current_setting('app.device_id', true));
```

- [ ] **Step 2: Sanity-check SQL syntax locally**

Run: `grep -c "create" supabase/migrations/20260624120000_payments_ledger.sql`
Expected: `4` (table, 2 indexes, policy — `create policy` counts).

> Note: this project applies migrations against the remote Supabase project; there is no
> local `supabase db` step wired into `npm`. The migration is applied manually/by the
> Supabase MCP after review (see "Applying the migration" at the end). Do not block this
> task on a live apply.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260624120000_payments_ledger.sql
git commit -m "feat(db): add append-only payments ledger table"
```

---

## Task 2: payments type in Supabase types

**Files:**
- Modify: `lib/supabase/types.ts` (the `subscriptions` table block ends around line 141; insert `payments` after it, before `events`)

**Interfaces:**
- Consumes: existing `Database["public"]["Tables"]` shape.
- Produces: `Database["public"]["Tables"]["payments"]` with `Row`/`Insert`/`Update`.

- [ ] **Step 1: Add the payments type**

In `lib/supabase/types.ts`, immediately after the closing `};` of the `subscriptions:` table block (the line with `Update: Partial<{ status: SubscriptionStatus; current_period_end: string }>;` then `};`), insert:

```ts
      payments: {
        Row: {
          id: string;
          paymongo_link_id: string;
          device_id: string;
          year_id: string;
          amount: number;
          currency: string;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          paymongo_link_id: string;
          device_id: string;
          year_id: string;
          amount: number;
          currency?: string;
          paid_at: string;
          created_at?: string;
        };
        // Append-only ledger: no updates.
        Update: Record<string, never>;
      };
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors referencing `types.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(types): add payments table type"
```

---

## Task 3: `recordPayment` + `sumRevenueForMonth` helpers (TDD)

**Files:**
- Create: `lib/payments.ts`
- Test: `lib/payments.test.ts`

**Interfaces:**
- Produces:
  - `recordPayment(supabase, input): Promise<{ recorded: boolean; deduped: boolean }>`
    where `input = { linkId: string; deviceId: string; yearId: string; amount: number; paidAt: Date }`.
    Inserts a `payments` row (returns `{ recorded:false, deduped:true }` on unique violation /
    pre-existing link), then upserts the subscription with `current_period_end` = now+31d.
  - `sumRevenueForMonth(rows: { amount: number; paid_at: string }[], year: number, monthIndex0: number): number`
    — returns peso total (centavos summed / 100) for rows whose `paid_at` falls in that PH month.
  - `PH_OFFSET_MS = 8 * 60 * 60 * 1000`.

- [ ] **Step 1: Write the failing tests**

Create `lib/payments.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordPayment, sumRevenueForMonth } from "./payments";

// Chainable Supabase mock. payments: select→eq→maybeSingle for the replay check,
// insert for the ledger row. subscriptions: upsert.
function makeSupabase(opts: {
  existingLink?: boolean;
  insertError?: { code?: string } | null;
}) {
  const paymentsBuilder: Record<string, unknown> = {};
  paymentsBuilder.select = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.eq = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.limit = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: opts.existingLink ? { id: "p1" } : null, error: null });
  paymentsBuilder.insert = vi
    .fn()
    .mockResolvedValue({ error: opts.insertError ?? null });

  const subsUpsert = vi.fn().mockResolvedValue({ error: null });
  const subscriptionsBuilder = { upsert: subsUpsert };

  const supabase = {
    from: vi.fn((table: string) =>
      table === "payments" ? paymentsBuilder : subscriptionsBuilder
    ),
  };
  return { supabase, paymentsBuilder, subsUpsert };
}

const input = {
  linkId: "link_abc",
  deviceId: "11111111-1111-1111-1111-111111111111",
  yearId: "22222222-2222-2222-2222-222222222222",
  amount: 5000,
  paidAt: new Date("2026-06-24T03:00:00Z"),
};

describe("recordPayment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a ledger row and upserts the subscription on a first payment", async () => {
    const { supabase, paymentsBuilder, subsUpsert } = makeSupabase({});
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(paymentsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        paymongo_link_id: "link_abc",
        device_id: input.deviceId,
        year_id: input.yearId,
        amount: 5000,
        currency: "PHP",
      })
    );
    expect(subsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      { onConflict: "device_id,year_id" }
    );
  });

  it("dedups when the link already exists (no insert, no upsert)", async () => {
    const { supabase, paymentsBuilder, subsUpsert } = makeSupabase({ existingLink: true });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(paymentsBuilder.insert).not.toHaveBeenCalled();
    expect(subsUpsert).not.toHaveBeenCalled();
  });

  it("treats a unique-violation on insert as a dedup, not an error", async () => {
    const { supabase, subsUpsert } = makeSupabase({ insertError: { code: "23505" } });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(subsUpsert).not.toHaveBeenCalled();
  });
});

describe("sumRevenueForMonth", () => {
  it("sums centavos to pesos for rows in the given PH month", () => {
    const rows = [
      { amount: 5000, paid_at: "2026-06-24T03:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-06-01T00:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-05-31T10:00:00Z" }, // May PH
    ];
    // June 2026 => monthIndex0 = 5
    expect(sumRevenueForMonth(rows, 2026, 5)).toBe(100);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenueForMonth([], 2026, 5)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/payments.test.ts`
Expected: FAIL — `recordPayment`/`sumRevenueForMonth` not exported / module not found.

- [ ] **Step 3: Implement `lib/payments.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

const PERIOD_DAYS = 31;

export interface RecordPaymentInput {
  linkId: string;
  deviceId: string;
  yearId: string;
  amount: number; // centavos
  paidAt: Date;
}

// Append-only ledger write + subscription grant. Idempotent on linkId: a
// replayed webhook (same single-use link) is deduped and does NOT extend access.
export async function recordPayment(
  supabase: SupabaseClient,
  input: RecordPaymentInput
): Promise<{ recorded: boolean; deduped: boolean }> {
  const { linkId, deviceId, yearId, amount, paidAt } = input;

  // Replay check against the ledger.
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("paymongo_link_id", linkId)
    .limit(1)
    .maybeSingle();

  if (existing) return { recorded: false, deduped: true };

  // Ledger row first — never grant access without a recorded payment.
  const { error: insertError } = await supabase.from("payments").insert({
    paymongo_link_id: linkId,
    device_id: deviceId,
    year_id: yearId,
    amount,
    currency: "PHP",
    paid_at: paidAt.toISOString(),
  });

  if (insertError) {
    // 23505 = unique_violation: a concurrent delivery beat us. Treat as dedup.
    if ((insertError as { code?: string }).code === "23505") {
      return { recorded: false, deduped: true };
    }
    throw new Error(insertError.message);
  }

  // Grant / extend access.
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + PERIOD_DAYS);

  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      device_id: deviceId,
      year_id: yearId,
      paymongo_link_id: linkId,
      status: "active",
      current_period_end: currentPeriodEnd.toISOString(),
    },
    { onConflict: "device_id,year_id" }
  );

  if (upsertError) throw new Error(upsertError.message);

  return { recorded: true, deduped: false };
}

// Sum ledger rows (centavos) to pesos for a given PH calendar month.
export function sumRevenueForMonth(
  rows: { amount: number; paid_at: string }[],
  year: number,
  monthIndex0: number
): number {
  let centavos = 0;
  for (const r of rows) {
    const ph = new Date(new Date(r.paid_at).getTime() + PH_OFFSET_MS);
    if (ph.getUTCFullYear() === year && ph.getUTCMonth() === monthIndex0) {
      centavos += r.amount;
    }
  }
  return centavos / 100;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/payments.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/payments.ts lib/payments.test.ts
git commit -m "feat(payments): add recordPayment ledger helper and revenue summer"
```

---

## Task 4: Wire the webhook to `recordPayment`

**Files:**
- Modify: `app/api/webhooks/paymongo/route.ts`

**Interfaces:**
- Consumes: `recordPayment` from `lib/payments.ts`.

- [ ] **Step 1: Parse `paid_at` from the payload**

In `app/api/webhooks/paymongo/route.ts`, extend the `PaymongoEvent` inner `attributes` type to include an optional paid timestamp (Unix seconds), alongside the existing `remarks`/`amount`/`status`/`id`:

```ts
          // PayMongo emits paid_at as Unix seconds on payment resources.
          // Untrusted display metadata only — never gates access.
          paid_at?: number;
```

- [ ] **Step 2: Replace the inline dedup + upsert block with a `recordPayment` call**

Add the import at the top:

```ts
import { recordPayment } from "@/lib/payments";
```

Then replace everything from the `// Idempotency:` comment through the final `return NextResponse.json({ ok: true });` (the existing-link check, the 31-day calc, and the `upsert`) with:

```ts
  const supabase = createServerClient();

  const paidAtSeconds = resource.attributes.paid_at;
  const paidAt =
    typeof paidAtSeconds === "number"
      ? new Date(paidAtSeconds * 1000)
      : new Date();

  try {
    const { deduped } = await recordPayment(supabase, {
      linkId,
      deviceId,
      yearId,
      amount: typeof paidAmount === "number" ? paidAmount : SUBSCRIPTION_AMOUNT,
      paidAt,
    });
    if (deduped) return NextResponse.json({ ok: true, deduped: true });
  } catch (err) {
    // Log details server-side; return a generic message so internal DB errors
    // aren't disclosed to the caller.
    console.error("recordPayment failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
```

(The `linkId`, `deviceId`, `yearId`, `paidAmount` consts and all guards above this block stay exactly as they are.)

- [ ] **Step 3: Typecheck + full test run**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all existing tests + the new `lib/payments.test.ts` pass.

- [ ] **Step 4: Commit**

```bash
git add app/api/webhooks/paymongo/route.ts
git commit -m "feat(webhook): record payments in the ledger before granting access"
```

---

## Task 5: Dashboard — real revenue + transactions data

**Files:**
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `sumRevenueForMonth`, `PH_OFFSET_MS` from `lib/payments.ts`.
- Produces: new props passed to `AdminDashboard`: `totalRevenue` (now real), `newSubscribersToday` (now payments-today), `transactions: TransactionRow[]`.
  `TransactionRow = { id: string; paid_at: string; device_id: string; year_label: string; amount: number; paymongo_link_id: string }`.

- [ ] **Step 1: Add the payments query**

In the `Promise.all([...])` block in `app/admin/page.tsx`, add a destructured entry `{ data: paymentsRaw }` and a corresponding query (after the `subscriptionRaw` query):

```ts
    supabase
      .from("payments")
      .select("id, device_id, year_id, amount, paymongo_link_id, paid_at")
      .order("paid_at", { ascending: false })
      .limit(100),
```

- [ ] **Step 2: Import the helper and compute revenue / new-today / transactions**

At the top of the file add:

```ts
import { sumRevenueForMonth } from "@/lib/payments";
```

Replace the three subscription-derived lines:

```ts
  const totalRevenue = activeSubscribers * 50; // ₱50/subscriber, simplified
  const newSubscribersToday = subscriptions.filter(
    s => s.created_at.slice(0, 10) === todayStrPH
  ).length;
```

with payments-derived values (keep `activeSubscribers` as-is above these):

```ts
  const payments = (paymentsRaw ?? []) as {
    id: string;
    device_id: string;
    year_id: string;
    amount: number;
    paymongo_link_id: string;
    paid_at: string;
  }[];

  // Real revenue = sum of ledger amounts in the current PH calendar month.
  const totalRevenue = sumRevenueForMonth(
    payments,
    todayPH.getUTCFullYear(),
    todayPH.getUTCMonth()
  );

  // "New Today" counts payments (renewals included), not subscription rows.
  const newSubscribersToday = payments.filter(
    p => new Date(new Date(p.paid_at).getTime() + PH_OFFSET_MS).toISOString().slice(0, 10) === todayStrPH
  ).length;
```

Add `PH_OFFSET_MS` to the import from `@/lib/payments` (it is already declared locally in this file at line ~120 as `const PH_OFFSET_MS`; **remove the local `const PH_OFFSET_MS = 8 * 60 * 60 * 1000;` declaration** and import it instead to avoid a redeclare error):

```ts
import { sumRevenueForMonth, PH_OFFSET_MS } from "@/lib/payments";
```

- [ ] **Step 3: Build the transactions rows with year labels**

After computing `payments`, resolve year labels (reuse the `years` table). Add near the other label lookups:

```ts
  const txYearIds = Array.from(new Set(payments.map(p => p.year_id)));
  const { data: txYears } = txYearIds.length
    ? await supabase.from("years").select("id, label").in("id", txYearIds)
    : { data: [] as { id: string; label: string }[] };

  const transactions = payments.map(p => ({
    id: p.id,
    paid_at: p.paid_at,
    device_id: p.device_id,
    year_label: txYears?.find(y => y.id === p.year_id)?.label ?? "—",
    amount: p.amount,
    paymongo_link_id: p.paymongo_link_id,
  }));
```

> If the `years` table's display column is not `label`, use whatever the existing code uses
> for year display (check `app/admin/page.tsx` / year queries) and match it.

- [ ] **Step 4: Pass `transactions` to the component**

In the `<AdminDashboard ... />` JSX, add:

```tsx
      transactions={transactions}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors ONLY about `AdminDashboard` not yet accepting `transactions` (fixed in Task 6). No other errors. If `years.label` is wrong, fix per the note in Step 3.

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): compute real revenue and transactions from the ledger"
```

---

## Task 6: Dashboard — Transactions table UI

**Files:**
- Modify: `components/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `transactions: TransactionRow[]` prop.

- [ ] **Step 1: Add the `TransactionRow` interface and prop**

In `components/AdminDashboard.tsx`, add near the other interfaces (e.g. after `WaitlistEntry`):

```ts
interface TransactionRow {
  id: string;
  paid_at: string;
  device_id: string;
  year_label: string;
  amount: number;            // centavos
  paymongo_link_id: string;
}
```

Add to the `Props` interface:

```ts
  transactions: TransactionRow[];
```

Add `transactions` to the destructured params of `export function AdminDashboard({ ... })`.

- [ ] **Step 2: Add the Transactions section component**

Add this component above `export function AdminDashboard`:

```tsx
function TransactionsSection({ rows }: { rows: TransactionRow[] }) {
  return (
    <section className="mb-16 max-w-wide">
      <div className="flex items-baseline gap-3 mb-6">
        <p className="label">Transactions</p>
        <span className="font-mono text-xs text-ink-faint">{rows.length} recorded</span>
      </div>
      {rows.length === 0 ? (
        <p className="font-sans text-xs text-ink-faint">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-ink-faint/30">
                {["Date", "Device", "Year", "Amount", "Ref"].map(h => (
                  <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id} className="border-b border-ink-faint/15">
                  <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                    {new Date(t.paid_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{t.device_id.slice(0, 8)}…</td>
                  <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{t.year_label}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink">₱{(t.amount / 100).toFixed(2)}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink-faint">{t.paymongo_link_id.slice(0, 12)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Render it**

In the returned JSX of `AdminDashboard`, add `<TransactionsSection rows={transactions} />` immediately before `<WaitlistSection entries={waitlistEntries} />`.

The existing revenue tile (`<Stat value={`₱${totalRevenue}`} label="Est. Monthly Revenue" />`) now receives a real peso number — change its label to drop "Est.":

```tsx
          <Stat value={`₱${totalRevenue}`} label="Monthly Revenue" />
```

- [ ] **Step 4: Typecheck + full test run**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/AdminDashboard.tsx
git commit -m "feat(admin): show recorded PayMongo transactions table"
```

---

## Applying the migration

After Task 6, the migration must be applied to the remote Supabase project (the dashboard
queries `payments`, which won't exist until then). Apply `20260624120000_payments_ledger.sql`
via the Supabase MCP `apply_migration` or the project's normal migration step, then verify with
a `list_tables`/`select` that `payments` exists with the unique index. Do this as an explicit,
reviewed step — it writes to the live project.

## Final verification

- [ ] `npm test` — all green.
- [ ] `npx tsc --noEmit` — clean.
- [ ] `npm run build` — succeeds.
- [ ] Manual: a `link.payment.paid` webhook (test mode) inserts exactly one `payments` row; a replay inserts none; the admin dashboard shows the row and a non-zero Monthly Revenue.
