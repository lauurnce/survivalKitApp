# Handoff — profile context fields → admin visibility pipeline

**Branch:** `feat/profile-dashboard` · **Worktree:** `~/projects/survivalKitApp-profile`
**Date:** 2026-08-26 · **Status:** gates green locally (lint, tsc, vitest 1521, build) — not yet merged

This document hands off everything the *next* session needs to pipe the new
profile context data into the admin dashboard. Nothing admin-side was built
yet — by design. Read this top to bottom before touching anything.

## 1. What shipped on this branch

The student profile page (`app/account/profile`) was redesigned from a single
narrow card into a dashboard: landmark-art hero, IT interests, languages,
devices, starting background, reason-for-IT quote, career goal, links, danger
zone. To feed it, seven context columns were added to `profiles`.

### Migration (must be applied before any deploy of this branch)

`supabase/migrations/20260826000000_profiles_context_fields.sql`

| column | type | constraint |
|---|---|---|
| `devices` | `text[] NOT NULL DEFAULT '{}'` | `<@ array['Laptop','Desktop PC','Tablet','Smartphone','None yet']` |
| `languages` | `text[] NOT NULL DEFAULT '{}'` | `<@ array['Python','JavaScript','TypeScript','Java','C','C++','C#','PHP','SQL','HTML/CSS','Kotlin','Swift','Go','Rust','Dart','None yet']` |
| `background` | `text NULL` | `in ('TVL / ICT strand','STEM strand','Other SHS strand','ALS completer','Career shifter','Zero knowledge')` |
| `it_reason` | `text NULL` | `char_length <= 280` |
| `career_goal` | `text NULL` | `char_length <= 120` |
| `github_url` | `text NULL` | `char_length <= 200`, app enforces `https://` prefix |
| `portfolio_url` | `text NULL` | same as above |

No RLS changes: the pre-existing owner-only select/update policies on
`profiles` cover the new columns automatically.

Preflight: `lib/profileRow.ts → REQUIRED_PROFILE_COLUMNS` now includes all
seven plus `created_at`; `npm run db:check`
(`scripts/db/schema-check.ts`) fails deploys until the migration is applied.
Apply order: run this migration, then deploy code.

## 2. TS shape (single source: `lib/profile.ts`)

```ts
Profile {
  // existing: firstName, lastName, age, gender, university,
  //           schoolType ("Public"|"Private"|null), major, pathways[]
  devices: Device[]          // DEVICES constant
  languages: Language[]      // LANGUAGES constant
  background: Background | null  // BACKGROUNDS constant
  itReason: string | null    // ≤280 free text, why they chose IT
  careerGoal: string | null  // ≤120 free text
  githubUrl: string | null   // https, ≤200
  portfolioUrl: string | null
  createdAt: string | null   // ISO, surfaced as "Journey started" label
}
```

Constants `DEVICES` / `LANGUAGES` / `BACKGROUNDS` are exported from
`lib/profile.ts` and are byte-identical to the SQL check constraints. If you
ever widen a list, change BOTH files plus the UI in one commit — validators
reject unknown values (`validateProfile`).

Data flow today: form (`components/account/EditProfileModal.tsx`) →
`saveProfileAction` (`app/account/actions.ts`, parses FormData) →
`validateProfile` (`lib/profile.ts`) → `saveProfile` upsert
(`lib/profileStore.ts`) → reads via tolerant mapper `profileFromRow`
(`lib/profileRow.ts`). The file-store dev backend
(`PROFILE_STORE=file`, `.dev/profile-store.json`) also carries all fields.

## 3. Files added/changed on this branch

```
supabase/migrations/20260826000000_profiles_context_fields.sql   new
lib/profile.ts            types + constants + validation (+tests)
lib/profileRow.ts         REQUIRED_PROFILE_COLUMNS + row mapping (+tests)
lib/profileStore.ts       upsert payload extended
app/account/actions.ts    parses the 7 new FormData fields
app/account/profile/page.tsx        server shell + joinedLabel formatting
components/account/ProfileCard.tsx  rewritten: composed client dashboard
components/account/EditProfileModal.tsx  extracted+extended modal (new)
components/account/DangerZone.tsx(+test) delete-zone card (new)
components/account/ProfileCard.test.tsx  rewritten coverage
scripts/dev/render-fit-harness.tsx  fixture literal only (typecheck)
docs/plans/2026-08-26-profile-context-handoff.md  this file
```

Untouched on purpose: `DeleteAccountButton`, delete API/rate limit,
`NavRail`, signup flow (signup still writes school only).

## 4. Your job: user profile → admin visibility

Admin currently reads aggregates through the service-role-only RPC
`admin_profiles_agg()` (+ `admin_profiles_agg_school_type()` revision), called
from server code using the service-role client `createServerClient()`
(`lib/supabase/server.ts`). Profiles themselves are RLS-locked to their owner;
admin has NO direct table grant — keep it that way.

Recommended approach (matches repo precedent):

1. Extend the aggregate family instead of granting table access:
   `admin_profiles_context_agg()` (or widen `admin_profiles_agg()`) returning
   per-field distributions: devices[] unnest counts, languages[] counts,
   background counts, pathway counts, fill-rates for it_reason/career_goal/
   links. Follow the existing pattern: `revoke from public/anon/authenticated`,
   `grant execute to service_role` only.
2. Admin UI lives under `app/admin/` (server components + route handlers under
   `app/api/admin/`). Render distributions with existing theme tokens — see
   `components/dashboard/StatusChip.tsx` and the roadmap-redesign pages
   (`docs/plans/2026-08-26-roadmap-v2.md`) for the sibling visual language.
3. Free-text fields (`it_reason`, `career_goal`) are personal. If surfacing
   them individually rather than as counts, decide deliberately and note the
   privacy posture (RA 10173; students entered this text voluntarily inside a
   self-service profile they can edit or erase at any time). Erasure already
   covers these columns: `lib/deleteAccount.ts` deletes the whole profile row.
4. Useful cross-cuts once aggregated: "zero knowledge" share vs TVL/ICT share;
   device gap (phone-only students) against module content weight;
   languages-known histogram vs first-year language coverage.

Verification for your session: apply the migration to the target env, run
`npm run db:check`, then lint/tsc/vitest/build. Fork-PR Vercel checks are
expected red (deploys blocked for unauthorized forks) — verify locally.

## 5. Open decisions left to you

- Whether `createdAt` should join admin cohorts (column is exposed but not
  written by the app).
- Whether links (GitHub/portfolio) belong in admin at all.
- Whether `it_reason` gets a quick-pick chip set later (schema allows text
  either way; adding canonical picks later means a new array column, not a
  migration of this one).
