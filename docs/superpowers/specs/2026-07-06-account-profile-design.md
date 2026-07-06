# Account Profile Card — Design

**Date:** 2026-07-06
**Status:** Approved (preview locally first; live migration deferred until preview sign-off)

## What

A profile section on the My Account page (`/account`) where a logged-in user
records personal info and customizes it over time: first/last name (required),
age, gender, university, major (all optional), and preferred tech pathways
(multi-select from a fixed list).

## Decisions

- **Placement:** card at the top of the left sidebar, above the progress
  timeline.
- **Pathways:** multi-select from a fixed list — Data, AI / Machine Learning,
  UI/UX Design, Frontend, Backend, Full Stack, Cybersecurity, Networking,
  Cloud Computing, DevOps, Mobile Development, Game Development, QA / Testing,
  Database Administration, IT Support, Tech Entrepreneurship. No free text.
- **Required fields:** first + last name. Everything else optional; unfilled
  fields simply don't render on the card.
- **Edit UX:** "Edit profile" button opens a modal form (same visual pattern
  as the subscribe modals). Save via a React 19 `useActionState` server action.

## Storage

New `profiles` table (migration `20260706000000_profiles.sql`):

- `user_id uuid` PK → `auth.users(id)` on delete cascade
- `first_name` / `last_name text not null` (1–60 chars)
- `age int` check 13–100, `gender text` (Male / Female / Non-binary / Prefer
  not to say), `university` / `major text` (≤120 chars) — all nullable
- `pathways text[] not null default '{}'`, check `<@` the fixed list
- RLS: user selects/inserts/updates own row only; no delete policy.

Rejected alternatives: `auth.users` user_metadata (unqueryable, no
constraints); JSONB blob (loses typed columns for a stable field set).

## Local preview mode

The store behind `getProfile`/`saveProfile` is swappable via
`PROFILE_STORE=file` in `.env.local`: a gitignored `.dev/profile-store.json`
backs the exact same UI so the feature is fully clickable locally with **no
writes to the live database**. Removing the env var switches to the Supabase
table (session-scoped SSR client, RLS enforced). The migration is applied to
live only after preview sign-off, checking live-schema divergence first.

## Components & data flow

- `lib/profile.ts` — pure: types, `PATHWAYS`, `GENDERS`, `validateProfile`
  (trims, enforces name/age/gender/pathway rules). Unit tested.
- `lib/profileStore.ts` — IO: file or Supabase backend.
- `app/account/actions.ts` — `saveProfileAction(prevState, formData)`:
  auth check → validate → save → `revalidatePath("/account")`.
- `components/account/ProfileCard.tsx` — client: read-only card (or
  "Set up your profile" empty state) + edit modal.
- `AccountSidebar` gains a `profile` prop and renders the card at the top;
  `app/account/page.tsx` fetches the profile server-side.

## Error handling

Validation errors and save failures return `{ error }` from the action and
render inline in the modal; form values are preserved. Success closes the
modal and revalidates the page.

## Testing

Unit tests for `validateProfile` (required names, trimming, age bounds,
gender/pathway whitelists, optional-field nulling). Manual click-through of
empty → filled → edited states in local preview; RLS verified when the live
migration lands.
