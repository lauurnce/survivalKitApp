# Supabase Migrations

## Applying Migrations

### Option 1 — Supabase CLI

```bash
supabase db push
```

This applies all pending migrations in `supabase/migrations/` to your linked remote project.

### Option 2 — Supabase Dashboard SQL Editor

Open the [Supabase Dashboard](https://app.supabase.com), navigate to **SQL Editor**, paste the contents of the migration file, and run it.

---

## RLS Migration (`20260623_enable_rls.sql`)

This migration enables Row-Level Security (RLS) on all tables and defines policies for the `anon` role.

### No app behavior changes

All server API routes in this project use the **service role key** (`SUPABASE_SERVICE_ROLE_KEY`). The service role key bypasses RLS entirely by design, so enabling RLS does not affect any existing server-side queries, mutations, or RPCs.

### Defense-in-depth

The purpose of this migration is defense-in-depth:

- If a bug ever caused the anon key to be used for a query that should be service-role-only, RLS would prevent unauthorized data exposure.
- The `waitlist` table has no `SELECT` policy for `anon` — only the service role (used by the admin dashboard) can read it.
- Device-scoped tables (`events`, `module_progress`, `counter_log`, `unlocks`) allow anon inserts and reads; the app's server-side logic is responsible for scoping queries to the correct `device_id`.
- Public content tables (`years`, `subjects`, `modules`, `sections`, `counters`) allow unrestricted `SELECT` for `anon`.

### Applying this to a live database

After running this migration, verify in the Supabase dashboard under **Authentication > Policies** that all tables show RLS as enabled with the expected policies listed.

> **Note:** This migration was already applied directly to the live Supabase project (mpdymglipgzuybtxuvhy) on 2026-06-23. This file exists for tracking and reproducibility only.
