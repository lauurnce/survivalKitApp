# Progress Share Card — Design

**Date:** 2026-07-13 · **Status:** Approved for implementation
**Source:** [GTM implementation plan, Track C](../../gtm/implementation-plan-ay2026-27.md) — card #2 (Module Completion / Progress), the "Strava for studying" share loop.

## Goal

A student can download (or natively share) a story-format PNG showing their study
progress and post it to their IG/FB story. Success metric (from the plan): ≥5% of
module completions produce a share action by Aug 31; share events measurable from day one.

## Scope (v1)

- **One card:** the Progress Card (plan card #2). Quiz Score card (#1) and all others deferred.
- **One format:** 1080×1920 story PNG. Square 1080×1080 deferred.
- **Transparent background** (Strava-sticker style): the PNG has no background so it
  overlays the student's own story photo/video. All text must stay readable on any
  backdrop → white text with a soft dark drop-shadow; the big number in brand
  vermillion `#E0492B` with the same shadow treatment.
- **No QR** in v1; plain text wordmark + domain.

## Card content

Rendered as a vertically arranged "sticker" group, centered, with generous margins
so story UIs don't crop it:

1. Optional first name (only when a signed-in profile has one) — small, uppercase label style
2. Big display number (Fraunces): **modules completed in the subject**
3. Subline: "modules done in {Subject Title}"
4. Completion-trigger only: "just finished: {Module Title} ✓"
5. Date ("Jul 13") + "AY 2026–27" label
6. Bottom: text wordmark "BSIT Survival Kit" + `survival-kit-app.vercel.app`

## Architecture

### Renderer — `GET /api/card/progress`

- `next/og` `ImageResponse` (satori), returns `image/png` 1080×1920 with alpha.
  No background element → transparent canvas.
- **Fonts:** satori cannot use `next/font`; ship Fraunces (semibold) and Inter Tight
  (regular + medium) `.ttf` subsets in the repo (e.g. `assets/fonts/`), loaded in the
  route via `fs`/import.
- **Query params (no DB read):**
  - `subject` — subject title, required, length-capped (~40 chars, truncate with …)
  - `count` — completed-module count, required, integer clamped to 1–999
  - `module` — just-completed module title, optional, length-capped
  - `name` — first name, optional, length-capped (~20 chars)
- Invalid/missing required params → 400 JSON error, never a half-rendered card.
- Output is a pure function of params → `Cache-Control: public, max-age=31536000, immutable`.
- Spoofability accepted: it is a brag card, not a certificate.

### Share UI — `ShareProgressCard` dialog

One client component, two entry points:

1. **Completion moment:** after `setModuleCompleted(_, true)` succeeds, show a small
   non-blocking prompt ("🎉 Share your progress") that opens the dialog. Card includes
   the `module` line. Dismissible; no interruption to reading flow.
2. **Subject page:** persistent "Share progress" button, rendered only when the device
   has ≥1 completed module in the subject. Same dialog, no `module` line.

Dialog contents:
- Card preview: `<img src="/api/card/progress?…">` on a checkered/photo-hint backdrop
  so the transparency is visible in preview.
- **Share** button: fetch the PNG as a blob → `navigator.share({ files: [File] })`
  (mobile native sheet → IG/FB story). Shown only when
  `navigator.canShare?.({ files })` passes.
- **Download** button: always present; anchor download of the PNG
  (`bsit-progress-{subject-slug}.png`).
- Share cancel/rejection → silent; dialog stays open, Download still available.

Progress count comes from the client's existing `fetchCompletedModules(moduleIds)`
scoped to the subject's modules — no new read API.

### Tracking

New event types: `share_card_open`, `share_card_share`, `share_card_download`
(payload: `subject_id`, `module_id` when applicable).

Required changes:
- Migration extending the `events` CHECK constraint (known silent-rejection trap, git 9f4ab58).
  **Before writing it:** verify repo-vs-live migration state (known divergence risk).
- Add the three types to `VALID_EVENT_TYPES` in `app/api/events/route.ts`.

No other schema work; counts come from existing `module_progress` (device_id-keyed).

## Error handling

- Card route: 400 on bad params; try/catch → 500 JSON, never a broken image with 200.
- Fonts fail to load → build-time import, so failure is a build failure, not runtime.
- `navigator.share` unavailable or throws → Download fallback (always rendered).
- Profile name lookup fails/absent → card renders without the name line.

## Testing

- Unit (vitest): param validation/clamping/truncation for the card route; the three
  new event types accepted by `/api/events`; share-dialog URL building.
- Manual: card URL in browser (verify transparency + font rendering), full share flow
  on a real phone into an IG story, events landing in the `events` table.

## Out of scope (deferred per plan)

Quiz Score card (#1), square format, QR code, streak/readiness/wrap/survived/class
cards (#3–#7), score persistence, short-link domain.
