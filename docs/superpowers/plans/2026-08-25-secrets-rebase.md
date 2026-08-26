# Plan — dual-secret transition rebased onto post-#14 main (2026-08-25)

Track: `feat/dual-secret-transition` in
`~/projects/survivalKitApp-secrets` (worktree, opencode-D3 claim). The branch sat
blocked on PR #14; #14 landed on main today as `83f25f3`. This plan records the
reconciliation decisions before the rebase, per the commit-early rule.

## Starting state

- Branch tip `6ee2c30`, 2 commits over a base 106 commits behind `origin/main`.
- Branch design (`89fae77` + `6ee2c30`): shared `signingSecretCandidates()`
  resolves `[primary, <primary>_PREVIOUS]`; signing always uses the primary;
  verification falls back through candidates. Floor (≥32) applied to the primary
  unconditionally. **Previous secrets exempt from the floor**, on the theory
  that "they exist precisely because old ones were short" — i.e. a short legacy
  secret could ride in `*_PREVIOUS` as a verification-only key.
- Main after #14 (`15127da`, merged by `83f25f3`): every consumer throws when
  its secret is unset **or shorter than 32 chars** (`getSecret()` in
  deviceCookie/adminSession), plus an explicit length check in middleware's
  `verifyAdminToken`. No dual-secret mechanism exists on main — that work never
  left this branch.

## Reconciliation decision

The two designs collide at exactly one point: the branch's floor exemption for
`*_PREVIOUS`. Everything else overlaps cleanly.

**Ruling: #14's invariant wins — the floor now applies to EVERY candidate,
primary and previous alike. A secret below 32 characters can never be used to
sign or verify anything, anywhere, including inside a rotation window.**

Why this is the only defensible reading:

1. #14's threat model does not care which env var carries the weak secret. A
   32-byte HMAC key is the whole point; letting a brute-forceable legacy key
   validate device cookies (1-year lifetime!) re-opens the exact window #14
   closes, just during "transition".
2. Verification with a short key is not weaker enforcement than signing with
   one — an attacker who recovers/guesses the short previous secret can mint
   valid cookies either way. "Verification-only" was not actually a reduced
   privilege.
3. The task framing is explicit: newer-main security posture wins over older
   branch code.

**What survives of the transition mechanism:** everything except the
short-legacy bridge. Rotating between two ≥32-char secrets works exactly as
designed — set both vars, deploy, old credentials verify against `*_PREVIOUS`
during the grace window, delete `*_PREVIOUS` after. The runbook in
`signingSecrets.ts` is updated: step 1 now requires BOTH secrets ≥32, and the
old grandfathering rationale is replaced with the #14 ruling so nobody
re-introduces it.

**Operational consequence (documented, accepted):** an operator whose *current*
production secrets are short cannot bridge to strong ones without invalidating
existing credentials. Device cookies fail verification once and get re-minted
by the app; admin sessions are 8-hour TTL and die naturally. That is a
one-time cost, paid in exchange for never accepting weak-key signatures.

**Enforcement-point note (precision for reviewers):** neither implementation
throws literally at module import. Both enforce at first candidate resolution /
first sign-or-verify call, which is on every request path for these modules.
Main's #14 wording ("throws at import") describes the same call-time behavior
this branch already had. No change needed — but stated here because it will be
scrutinized.

## File-level reconciliation map

| File | Resolution |
|---|---|
| `lib/auth/signingSecrets.ts` | Floor check moves from primary-only to all candidates; error names the offending var; runbook rewritten per above |
| `lib/auth/signingSecrets.test.ts` | Exemption test flipped to refusal tests (short previous rejected with long primary present; empty-string previous still counts as unset) |
| `lib/auth/deviceCookie.ts` / `adminSession.ts` | Branch structure (candidates loop) kept; #14's guarantee inherited through the shared resolver — message text keeps `must be at least 32 characters` so #14's test regexes hold |
| `middleware.ts` | Branch candidates-loop kept AND #14's explicit `!secret \|\| secret.length < 32 \|\| !token` guard kept in front — defense-in-depth: middleware fails closed without relying on exception handling, while the resolver additionally rejects any short previous |
| `*.test.ts` fixtures | #14's ≥32-char fixtures and short-secret throw tests merged into branch suites |

## proxy.ts migration decision: SKIP (evidence-based)

Premise checked and falsified in this environment:

- Installed Next is **15.5.23**, not 16. `rg -l "proxy\.ts" node_modules/next/dist/build/`
  → no hits; no deprecation strings in the build pipeline. The `proxy.ts`
  convention does not exist in this version.
- The claims registry records `chore/next-security-bump` abandoned precisely
  because it required a next@16 major bump — out of scope for this track.
- Renaming `middleware.ts` → `proxy.ts` on 15.5 would make Next ignore the file
  entirely: CSP nonce injection, Supabase session refresh, the /admin page
  guard, and the /api/admin defense-in-depth layer would all silently vanish.
  That is the opposite of mechanical.

Revisit if/when the Next 16 bump lands as its own track.

## Execution order

1. Commit this plan doc.
2. `git fetch origin && git rebase origin/main`; expect conflicts in
   `lib/auth/*` and `middleware.ts`; resolve per the table above.
3. Full gates: `npx tsc --noEmit` · `npx vitest run` · `npm run lint` ·
   `npm run build`. Auth suites must pass with ≥32-char fixtures; record exact
   numbers and build warning status.
4. No push, no merge. Conventional commits, authored by lauurnce, no trailers.
