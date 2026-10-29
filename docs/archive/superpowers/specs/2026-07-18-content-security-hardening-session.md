# Session Spec: Content Rewrite + Security Hardening (2026-07-18)

## Goal
Land ~20 meaningful, isolated commits that improve the app's communication quality
and safety **without changing the functional behavior of features that already work**.

## Non-Goals
- No function-signature, data-flow, or schema changes in the content workstream.
- No changes to auth / webhook / payment logic without explicit user approval.
- No push to `origin/main`. All work stays local for user review. Production is live.

## Workstreams (in order)

### 1. Baseline verification
Capture a known-green baseline before any edits:
- `npm run test` (vitest)
- `npx tsc --noEmit`
- `npm run lint`
Surface any pre-existing failures before starting. No commits.

### 2. Security review (~3–4 commits)
Run `/security-review` plus a manual pass, focused on the newest live surface:
class-rep webhooks, join/approve endpoints, device-bound auth, PostgREST filters.
- **Fix** clear low-risk issues as isolated commits: input validation, security
  headers, info leaks, missing guards.
- **Flag** anything touching auth/webhooks/payment flow — bring to user before editing.

### 3. Content rewrite (~12 commits) — primary work
Rewrite AI-slop user-facing prose into instructive, concrete copy.
Targets: `for-blocks` checkout, paywall/subscribe/locked components, dashboard cards,
module/section renderers, admin.
- Latitude: reword freely within meaning; keep intent, CTAs, technical terms.
  Ask user before changing what a message *promises* or *claims*.
- Strings and JSX text only — no logic changes.
- Group commits by screen/area; each isolated and revertible.

### 4. Close-out
- Re-run test + typecheck + lint to prove nothing broke.
- Final pressure-test pass.
- Report batch to user for review. Do not push.

## Guardrails
- Solo-commits style: user is sole contributor, no co-author trailers.
- Every commit revertible and scoped to one concern.
- Stop and ask on any "big change" (behavior, promises, auth/payment surface).
