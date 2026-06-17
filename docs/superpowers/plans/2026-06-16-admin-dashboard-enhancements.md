# Admin Dashboard Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Active Now, New Users, Recurring Users, and Revenue stats to the admin dashboard overview section.

**Architecture:** Two new Supabase queries in the server component compute active/new/recurring counts from the `events` table; derived revenue comes from the existing `approvedUnlocks` count. The `AdminDashboard` client component receives four new props and renders an expanded 8-stat overview grid.

**Tech Stack:** Next.js App Router (server component), Supabase JS client, React, Tailwind CSS

---

### Task 1: Add new queries and derived values in `app/admin/page.tsx`

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add time constants near the top of `AdminPage`**

In `app/admin/page.tsx`, after the existing `thirtyDaysAgo` constant (line 42), add:

```ts
const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
```

- [ ] **Step 2: Add two new queries inside the `Promise.all`**

The existing `Promise.all` block starts at line 52. Add two entries at the end of the array (before the closing `]`):

```ts
    supabase
      .from("events")
      .select("device_id")
      .eq("event_type", "enter")
      .gte("created_at", fifteenMinutesAgo),
    supabase
      .from("events")
      .select("device_id, created_at")
      .eq("event_type", "enter")
      .order("created_at", { ascending: true })
      .limit(50000),
```

- [ ] **Step 3: Destructure the two new query results**

The existing destructuring on line 44 ends with `{ data: approvedRaw }`. Extend it:

```ts
  const [
    { data: funnelRaw },
    { data: dauRaw },
    { data: subjectCounters },
    { data: moduleCounters },
    { data: sectionEventRaw },
    { data: pendingRaw },
    { data: approvedRaw },
    { data: activeRaw },
    { data: allEnterRaw },
  ] = await Promise.all([
```

- [ ] **Step 4: Compute `activeNow`, `newUsers`, `recurringUsers`, `totalRevenue`**

Add this block after the existing `const last7Sessions = ...` line (around line 163):

```ts
  const activeNow = new Set((activeRaw ?? []).map((e) => e.device_id)).size;

  const firstSeen = new Map<string, string>();
  for (const e of allEnterRaw ?? []) {
    if (!firstSeen.has(e.device_id)) firstSeen.set(e.device_id, e.created_at);
  }
  let newUsers = 0;
  let recurringUsers = 0;
  for (const date of firstSeen.values()) {
    if (date >= threeDaysAgo) newUsers++;
    else recurringUsers++;
  }

  const totalRevenue = (approvedRaw?.length ?? 0) * 20;
```

- [ ] **Step 5: Pass new props to `<AdminDashboard />`**

Update the JSX return (around line 165) to include the four new props:

```tsx
  return (
    <AdminDashboard
      funnel={funnel}
      dau={dau}
      topSubjects={topSubjects}
      topModules={topModules}
      topSections={topSections}
      pendingUnlocks={pendingUnlocks}
      totalUniqueUsers={totalUniqueUsers}
      todayUsers={todayUsers}
      last7Sessions={last7Sessions}
      approvedUnlocks={approvedRaw?.length ?? 0}
      activeNow={activeNow}
      newUsers={newUsers}
      recurringUsers={recurringUsers}
      totalRevenue={totalRevenue}
    />
  );
```

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): add active-now, new/recurring users, and revenue queries"
```

---

### Task 2: Update `AdminDashboard` props and overview grid

**Files:**
- Modify: `components/AdminDashboard.tsx`

- [ ] **Step 1: Extend the `Props` interface**

In `components/AdminDashboard.tsx`, find the `Props` interface (line 37) and add four new fields:

```ts
interface Props {
  funnel: FunnelStep[];
  dau: DauDay[];
  topSubjects: TopItem[];
  topModules: TopItem[];
  topSections: TopSection[];
  pendingUnlocks: PendingUnlock[];
  totalUniqueUsers: number;
  todayUsers: number;
  last7Sessions: number;
  approvedUnlocks: number;
  activeNow: number;
  newUsers: number;
  recurringUsers: number;
  totalRevenue: number;
}
```

- [ ] **Step 2: Update the `Stat` component to support an optional `dot` prop**

Find the `Stat` function (line 50) and replace it with:

```tsx
function Stat({
  value,
  label,
  accent,
  dot,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
  dot?: boolean;
}) {
  return (
    <div className={`border p-6 ${accent ? "border-accent/40 bg-accent/5" : "border-ink-faint/30"}`}>
      <div className="flex items-baseline gap-2 mb-1">
        {dot && (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 self-center" />
        )}
        <p className={`font-serif text-4xl ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      </div>
      <p className="label-sm text-ink-muted">{label}</p>
    </div>
  );
}
```

- [ ] **Step 3: Destructure new props in `AdminDashboard`**

Find the function signature of `AdminDashboard` (line 180) and extend the destructuring:

```tsx
export function AdminDashboard({
  funnel, dau, topSubjects, topModules, topSections,
  pendingUnlocks, totalUniqueUsers, todayUsers, last7Sessions,
  approvedUnlocks, activeNow, newUsers, recurringUsers, totalRevenue,
}: Props) {
```

- [ ] **Step 4: Replace the 4-stat overview grid with an 8-stat grid**

Find the `{/* Key stats */}` section (around line 227) and replace the entire `<section>` block with:

```tsx
      {/* Key stats */}
      <section className="mb-16">
        <p className="label mb-4">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat value={activeNow} label="Active Now (15 min)" dot />
          <Stat value={totalUniqueUsers.toLocaleString()} label="Total Users" />
          <Stat value={newUsers} label="New Users (3 days)" />
          <Stat value={recurringUsers} label="Recurring Users" />
          <Stat value={todayUsers} label="Today" />
          <Stat value={last7Sessions} label="7-day Sessions" />
          <Stat value={`₱${totalRevenue.toLocaleString()}`} label="Total Revenue" />
          <Stat
            value={pendingUnlocks.length > 0 ? pendingUnlocks.length : approvedUnlocks}
            label={pendingUnlocks.length > 0 ? "Pending Unlocks ⚠" : "Approved Unlocks"}
            accent={pendingUnlocks.length > 0}
          />
        </div>
      </section>
```

- [ ] **Step 5: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/AdminDashboard.tsx
git commit -m "feat(admin): expand overview to 8-stat grid with active-now, new/recurring, revenue"
```

---

## Self-Review

**Spec coverage:**
- [x] Active Now (15 min) — Task 1 query A + Task 2 Step 4
- [x] Total Users — unchanged, passed through
- [x] New Users (3 days) — Task 1 Steps 1 & 4
- [x] Recurring Users (first seen > 3 days ago) — Task 1 Steps 1 & 4
- [x] Revenue = approvedUnlocks × 20 — Task 1 Step 4
- [x] Green dot on Active Now — Task 2 Steps 2 & 4
- [x] Pending Unlocks accent retained — Task 2 Step 4
- [x] Mobile grid (2-col) + desktop grid (4-col) — grid classes in Task 2 Step 4

**Placeholder scan:** None found.

**Type consistency:** `activeNow`, `newUsers`, `recurringUsers`, `totalRevenue` are all `number` throughout both tasks. `dot` prop is `boolean | undefined`. Consistent.
