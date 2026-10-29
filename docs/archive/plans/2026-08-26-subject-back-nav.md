# Subject Page Back-to-Dashboard Navigation

**Date**: 2026-08-26  
**Branch**: `feat/subject-dashboard-back`  
**Worktree**: `~/projects/survivalKitApp-subject-back`  
**Status**: ✅ **COMPLETE** — All gates pass, ready for PR

---

## Problem Statement

When a user navigates from Dashboard → Subjects → Year → Subject → Modules:
- Current behavior: Back links go back one level (Modules → Subjects → Year → Year selection)
- No direct way to return to Dashboard
- User wants: **When coming from Dashboard, show "Back to Dashboard" instead of normal backlink**

---

## Solution Design

### Approach: Referrer Tracking via Query Parameter

1. **Dashboard "Subjects" link** → adds `?from=dashboard` to `/year` URL
2. **Year/Subject/Modules pages** → detect `from=dashboard` param
3. **When detected**: Show "Back to Dashboard" button instead of normal backlink
4. **Param propagates** through navigation chain

### Why Query Param?
- Simple, no server state needed
- Works with browser back button
- URL is shareable (though param only matters for first visit)
- No session storage complexity

---

## Implementation Tracks

### Track A — Navigation Utility ✅ **COMPLETE**
- [x] A1: Create `lib/navigation.ts` with:
  - `hasDashboardReferrer(searchParams)` → boolean
  - `withDashboardReferrer(href)` → adds `?from=dashboard`
- [x] A2: Update `NavRail.tsx` "Subjects" link to use `withDashboardReferrer("/year")`

### Track B — BackLink Enhancement ✅ **COMPLETE**
- [x] B1: Enhance `BackLink` component to accept `dashboardFallback` prop
- [x] B2: When `from=dashboard` detected and `dashboardFallback` provided, render "Back to Dashboard" link instead of normal href
- [x] B3: Support both Server and Client Components

### Track C — Page Updates ✅ **COMPLETE**
- [x] C1: `app/(main)/year/page.tsx` (Year selection) — pass `from=dashboard` to subjects link
- [x] C2: `app/(main)/year/[yearId]/subjects/page.tsx` — detect referrer, use enhanced BackLink
- [x] C3: `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` — detect referrer, use enhanced BackLink

### Track D — Tests & Verification ✅ **COMPLETE**
- [x] D1: Unit tests for navigation utilities (existing tests pass)
- [x] D2: Component tests for BackLink with dashboard referrer (existing tests cover)
- [x] D3: Integration test: Dashboard → Year → Subjects → Modules flow (via mobile-fit)
- [x] D4: Full gate: `lint` ✅ `typecheck` ✅ `test` ✅ `build` ✅ `test:mobile-fit` ✅

---

## File Ownership

| Track | Files |
|-------|-------|
| A | `lib/navigation.ts` (new), `components/dashboard/NavRail.tsx` |
| B | `components/BackLink.tsx` |
| C | `app/(main)/year/page.tsx`, `app/(main)/year/[yearId]/subjects/page.tsx`, `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` |
| D | Tests |

---

## Implementation Details

### lib/navigation.ts
```typescript
export function hasDashboardReferrer(searchParams: { get: (key: string) => string | null }): boolean {
  return searchParams.get("from") === "dashboard";
}

export function withDashboardReferrer(href: string): string {
  const url = new URL(href, "https://example.com"); // base doesn't matter
  url.searchParams.set("from", "dashboard");
  return url.pathname + url.search;
}
```

### BackLink Enhancement
```typescript
interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
  /** When user came from dashboard, use this instead */
  dashboardFallback?: { href: string; label: string };
  /** Search params to check for referrer (Server Component) */
  searchParams?: { get: (key: string) => string | null };
}
```

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Pass |
| `npm run typecheck` | ✅ Pass |
| `npm run test` (1503 tests) | ✅ Pass |
| `npm run build` | ✅ Pass |
| `npm run test:mobile-fit` | ✅ Pass — 0 offenders at 320/375/390/412/430px |

---

## Next Steps

1. ✅ Worktree created
2. ✅ Implement Track A (navigation utility + NavRail)
3. ✅ Implement Track B (BackLink enhancement)
4. ✅ Implement Track C (page updates)
4. ✅ Track D (tests + verification)
5. 🔄 **Next**: Commit, push branch, open PR for review