# Mobile Viewport Fit — Implementation Plan

**Date**: 2026-08-26  
**Status**: Ready for execution  
**Target**: BSIT Survival Kit dashboard (`/account`) and full site

---

## Problem Statement

User reports on mobile (tryi2i.com):
- Dashboard content wider than screen → header tabs cut off when pinch-zoomed out
- "Academic roadmap to bottom is larger than the header"
- Wants: **not zoom-out-able, but zoom-in-able**; dashboard fits phone dimensions always

### Root Cause Analysis (baseline measurement 2026-08-26)

| Width | Layout viewport (CSS px) | Scroll width | Fits? |
|-------|--------------------------|--------------|-------|
| 320   | 452                      | 452          | ✅    |
| 375   | 507                      | 507          | ✅    |
| 390   | 522                      | 522          | ✅    |
| 412   | 544                      | 544          | ✅    |
| 430   | 549                      | 549          | ✅    |

**Current main branch (commit 9683120 "fit dashboard to phones") ALREADY FITS** at all phone widths — the `overflow-x-auto` guards on `NavRail` and `RoadmapTimeline` contain horizontal overflow.

**But two critical gaps remain:**

1. **No `viewport` export in `app/layout.tsx`** — Next.js emits default `<meta name="viewport" content="width=device-width, initial-scale=1">`. Without `minimum-scale=1`, Safari WILL zoom out below 100% if any future element overflows, reproducing the exact user symptom.

2. **No global `overflow-x` guard** — A single uncontained `whitespace-nowrap` or fixed-width element anywhere in the tree can re-introduce page-wide overflow, triggering zoom-out.

3. **Production deployment status unknown** — `main == origin/main` but Vercel may not have deployed commit 9683120. User's screenshots from today (tryi2i.com) show the old broken state.

---

## Solution Strategy

### Track A — Viewport Config + Global Guards (root level)
**Files**: `app/layout.tsx`, `app/globals.css`, new `lib/viewport.ts`

1. Extract viewport config to `lib/viewport.ts` (testable, shared)
2. Add `export const viewport: Viewport = { width: "device-width", initialScale: 1, minimumScale: 1, viewportFit: "cover" }` to root layout
   - `minimumScale: 1` = **prevents pinch-zoom-out below 100%** (the "not zoomout-able" requirement)
   - No `maximumScale` / `userScalable: false` = **zoom-in still works** (the "zoom in-able" requirement)
   - `viewportFit: "cover"` = uses full screen on notched iPhones; safe-area insets handled by existing padding
3. Add `html { overflow-x: clip; }` to `globals.css` — belt-and-braces global clip that doesn't break `position: sticky` (unlike `overflow: hidden`)

### Track B — Component Hardening + Contract Tests (dashboard)
**Files**: `components/dashboard/*.tsx`, `components/DiscountCodesSection.tsx`, test files

1. **HeroCard** — Ensure stat row (`<dl class="flex gap-6">`) wraps on narrow screens (`flex-wrap gap-y-4`)
2. **RoadmapTimeline** — Already contained; add `snap-x snap-mandatory` + `-webkit-overflow-scrolling: touch` for native feel
3. **SemesterSections / ThisWeekPanel / DiscountCodesSection** — Verify no fixed widths; add `min-w-0` where needed
4. **Unit tests** asserting scroll-container classes exist on critical elements (prevent regression)

### Track C — Verification Tooling + CI Gate
**Files**: `scripts/dev/check-mobile-fit.mjs`, `scripts/dev/render-fit-harness.tsx`, `package.json`

1. Keep the measurement harness (already built) as permanent dev tool
2. Add `npm run test:mobile-fit` script that:
   - Builds harness HTML + CSS
   - Runs headless Chrome CDP check at 320/375/390/412/430
   - Exits non-zero on any overflow
3. Run locally before every deploy (manual for now; can be CI later)

---

## Detailed Task Breakdown

### Track A Tasks (Agent 1)
| Task | File | Change |
|------|------|--------|
| A1 | `lib/viewport.ts` (new) | Export `viewportConfig = { width: "device-width", initialScale: 1, minimumScale: 1, viewportFit: "cover" }` |
| A2 | `app/layout.tsx` | Import and `export const viewport = viewportConfig` |
| A3 | `app/globals.css` | Add `html { overflow-x: clip; }` at top level |
| A4 | `lib/viewport.test.ts` (new) | Vitest: import config, assert `minimumScale === 1`, `maximumScale` undefined, `userScalable` undefined |

### Track B Tasks (Agent 2)
| Task | File | Change |
|------|------|--------|
| B1 | `components/dashboard/HeroCard.tsx` | Stat row: `flex flex-wrap gap-6 gap-y-4` |
| B2 | `components/dashboard/RoadmapTimeline.tsx` | Add `snap-x snap-mandatory` to `<ol>`, touch scrolling |
| B3 | `components/dashboard/SemesterSections.tsx` | Ensure `grid` children have `min-w-0` |
| B4 | `components/DiscountCodesSection.tsx` | Verify button `w-full` wraps text (long coupon codes) |
| B5 | `components/dashboard/RoadmapTimeline.test.tsx` (new) | Render, assert `ol` has `overflow-x-auto` + `snap-x` |
| B6 | `components/dashboard/HeroCard.test.tsx` (new) | Render, assert stat `dl` has `flex-wrap` |
| B7 | `components/dashboard/NavRail.test.tsx` (new) | Render, assert `nav` has `overflow-x-auto` |

### Track C Tasks (Agent 3)
| Task | File | Change |
|------|------|--------|
| C1 | `scripts/dev/render-fit-harness.tsx` | Already exists — enhance with dynamic mock data import |
| C2 | `scripts/dev/check-mobile-fit.mjs` | Already exists — polish, add visualViewport check |
| C3 | `package.json` | Add `"test:mobile-fit": "tsx scripts/dev/render-fit-harness.tsx && node scripts/dev/check-mobile-fit.mjs"` |
| C4 | Run `npm run test:mobile-fit` | Verify PASS locally |
| C5 | Run `npm run lint && npm run typecheck && npm run test && npm run build` | Full gate check |

---

## Acceptance Criteria

1. **Viewport meta** in production HTML includes `minimum-scale=1` (verify via `curl -s tryi2i.com | grep viewport`)
2. **Global clip**: `html { overflow-x: clip }` in compiled CSS
3. **Harness passes** at 320, 375, 390, 412, 430px (`npm run test:mobile-fit` → exit 0)
4. **All gates green**: `lint`, `typecheck`, `test`, `build`
5. **Manual verification**: Open `/account` on real iPhone (390px) → no horizontal scroll on page, header never cut, pinch-out stops at 100%, pinch-in works

---

## Deployment Checklist

- [ ] All Track A/B/C tasks complete
- [ ] `npm run test:mobile-fit` passes
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` all pass
- [ ] Commit with message: `fix(mobile): prevent zoom-out, harden dashboard fit, add fit harness`
- [ ] Push to `main` → Vercel auto-deploy
- [ ] Post-deploy: verify `tryi2i.com` viewport meta + manual iPhone check

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| `minimumScale: 1` breaks accessibility | iOS 10+ ignores `user-scalable=no`/`maximum-scale`; `minimum-scale` is honored. WCAG allows zoom-in, doesn't require zoom-out below fit. |
| `overflow-x: clip` breaks sticky NavRail | `clip` does NOT create scroll container; `position: sticky` works. Tested in harness (lg rail sticky). |
| Production deploy fails | Run `vercel ls survival-kit-app` pre-push; check build logs. |
| Harness drifts from real page | Harness mirrors `app/account/page.tsx` structure exactly; unit tests pin scroll-container classes. |

---

## Files to Create/Modify

```
lib/viewport.ts                    # NEW - shared viewport config
lib/viewport.test.ts               # NEW - viewport config test
app/layout.tsx                     # MODIFY - import & export viewport
app/globals.css                    # MODIFY - add html overflow-x: clip
components/dashboard/HeroCard.tsx  # MODIFY - flex-wrap on stat row
components/dashboard/RoadmapTimeline.tsx  # MODIFY - snap-x
components/dashboard/SemesterSections.tsx # MODIFY - min-w-0 on grid items
components/DiscountCodesSection.tsx       # VERIFY - no overflow
components/dashboard/RoadmapTimeline.test.tsx # NEW
components/dashboard/HeroCard.test.tsx        # NEW
components/dashboard/NavRail.test.tsx         # NEW
scripts/dev/render-fit-harness.tsx    # EXISTING - enhance
scripts/dev/check-mobile-fit.mjs      # EXISTING - polish
package.json                          # MODIFY - add test:mobile-fit script
docs/plans/2026-08-26-mobile-viewport-fit.md # THIS FILE
```

---

## Execution Order

1. **Parallel**: Agent 1 (Track A) + Agent 2 (Track B) + Agent 3 (Track C tooling)
2. **Sequential**: Agent 3 runs `test:mobile-fit` after A+B merge
3. **Gate**: Full lint/typecheck/test/build
4. **Commit & push**