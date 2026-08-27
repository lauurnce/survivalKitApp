# Navigation Performance Optimization Plan

## Goal
Reduce click-to-navigation latency from 1+ seconds to <200ms perceived by:
1. Prefetching next pages on hover/viewport entry
2. Caching public read data (revalidate instead of force-dynamic)
3. Removing auth overhead from public route middleware
4. Streaming slow queries with Suspense
5. Adding loading states for perceived speed

---

## Phase 1: Quick Wins (Immediate Impact)

### 1.1 Add `prefetch=true` to All Navigation Links
**Files to modify:**
- `components/YearGrid.tsx` - Year cards → `/year/[id]/subjects`
- `components/SubjectAccordion.tsx` - Subject links → `/year/[id]/subjects/[id]/modules`, module links → `/year/[id]/subjects/[id]/modules/[id]`
- `components/ModuleListItem.tsx` - Module links
- `components/BackLink.tsx` - Back navigation
- `components/NavRail.tsx` - Dashboard navigation
- `app/(main)/page.tsx` - "Start here", "Search" links
- `app/(main)/year/page.tsx` - Search link in header
- `app/(main)/year/[yearId]/subjects/page.tsx` - BackLink
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx` - BackLink, next/prev module links
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx` - BackLink, next/prev module links
- `app/(main)/resources/page.tsx` - Resource cards
- `components/SearchClient.tsx` - Search results (already uses router.push, add prefetch on hover)

**Expected gain:** 300-500ms per navigation

---

### 1.2 Replace `force-dynamic` with `revalidate` on Public Pages
**Pages to change:**

| Page | Current | New | Reason |
|------|---------|-----|--------|
| `/year` | `force-dynamic` | `revalidate: 60` | Year list rarely changes |
| `/year/[yearId]/subjects` | `revalidate: 300` | `revalidate: 60` | Subject list static |
| `/year/[yearId]/subjects/[subjectId]/modules` | `revalidate: 300` | `revalidate: 60` | Module list static |
| `/year/[yearId]/subjects/[subjectId]/modules/[moduleId]` | `revalidate: 300` | `revalidate: 60` | Content static |

**Keep `force-dynamic`:**
- `/account/*` - User-specific data
- `/resources` - Needs user progress
- `/quiz/*` - Auth-gated
- `/admin/*` - Admin only

**Expected gain:** 400-800ms (cached responses)

---

### 1.3 Optimize Middleware (proxy.ts)
**Current:** Runs `supabase.auth.getUser()` on EVERY request (line 133)

**Change:** Only validate session on protected routes:
- `/account/*`
- `/admin/*` (already has separate check)
- `/quiz/*`
- `/resources` (for progress rail)
- `/api/*` (API routes)

**Public routes skip auth:**
- `/` (landing)
- `/year` (year selection)
- `/year/[id]/subjects`
- `/year/[id]/subjects/[id]/modules`
- `/year/[id]/subjects/[id]/modules/[id]`
- `/search`
- `/playground`
- `/privacy`
- `/for-blocks`
- `/unlock`

**Implementation:** Check `pathname` before calling `getUser()`

**Expected gain:** 200-400ms per request

---

## Phase 2: Caching Layer (High Impact)

### 2.1 Add `unstable_cache` for Read-Heavy Queries
**Create:** `lib/cache/queries.ts`

**Cache these queries with 60s revalidate:**

```typescript
// Years list (used in landing, year page)
getYears()

// Subjects by year (used in year page, subjects page)
getSubjectsByYear(yearId)

// Modules by subject (used in subjects page, modules page)
getModulesBySubject(subjectId)

// Module content sections (used in module page)
getModuleSections(moduleId)

// Activity sections metadata (used in modules page, module page)
getActivitySections(moduleIds)
```

**Expected gain:** 300-600ms (eliminates DB round trips)

---

### 2.2 Consolidate Queries with PostgREST Joins
**Current:** Multiple sequential queries per page

**Optimize:** Single query with joins where possible
- Year page: Join years + subjects + counters in one query
- Subjects page: Join subjects + modules + counters
- Modules page: Join modules + activity check + counters

**Expected gain:** 300-500ms (reduced round trips)

---

## Phase 3: Streaming & Perceived Performance

### 3.1 Add Suspense Boundaries
**Wrap slow queries in Suspense so shell renders immediately:**

```tsx
// Module page - stream content sections
<Suspense fallback={<ModuleContentSkeleton />}>
  <ModuleContent moduleId={moduleId} />
</Suspense>

// Subjects page - stream subject list
<Suspense fallback={<SubjectsSkeleton />}>
  <SubjectsList yearId={yearId} />
</Suspense>
```

**Files to add loading.tsx:**
- `app/(main)/year/loading.tsx`
- `app/(main)/year/[yearId]/subjects/loading.tsx`
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/loading.tsx`
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/loading.tsx`

**Expected gain:** Perceived instant navigation (shell shows in <100ms)

---

### 3.2 Add Prefetch on Viewport Entry (Not Just Hover)
**Use `IntersectionObserver` to prefetch when link enters viewport**

**Component:** `components/PrefetchLink.tsx` - wrapper around Link

```tsx
// Prefetches when element is ~200px from viewport
<PrefetchLink href="/year/1/subjects">Year 1</PrefetchLink>
```

**Apply to:** YearGrid cards, SubjectAccordion subjects, ModuleListItem modules

**Expected gain:** Near-instant navigation for visible links

---

## Phase 4: Client-Side Navigation for Authenticated Views (Future)

### 4.1 Convert Protected Pages to Client-Side Data Fetching
**Pages:** `/account`, `/resources`, `/quiz/*`

**Pattern:**
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useSWR } from 'swr'

export function AccountPage() {
  const router = useRouter()
  const { data } = useSWR('/api/account', fetcher)
  
  const handleNav = (href) => {
    router.prefetch(href) // Instant
    router.push(href)
  }
}
```

**Expected gain:** 600-1000ms for authenticated flows

---

## Implementation Order

### Week 1: Phase 1 (Quick Wins)
1. Add `prefetch=true` to all Links
2. Change `force-dynamic` → `revalidate: 60` on public pages
3. Optimize middleware to skip auth on public routes

### Week 2: Phase 2 (Caching)
4. Create `lib/cache/queries.ts` with `unstable_cache`
5. Refactor pages to use cached queries
6. Consolidate queries with joins

### Week 3: Phase 3 (Streaming)
7. Add `loading.tsx` to all nested routes
8. Add Suspense boundaries for slow sections
9. Create `PrefetchLink` component

### Week 4: Phase 4 (Advanced)
10. Client-side navigation for auth pages
11. Service worker for offline prefetch
12. Performance monitoring

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Click → navigation start | ~1000ms | <200ms |
| Navigation → interactive | ~1500ms | <500ms |
| Time to First Byte (cached) | ~800ms | <100ms |
| Perceived load (with skeleton) | ~1000ms | <100ms |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stale data with revalidate | 60s cache + manual revalidate on content publish |
| Middleware auth bypass | Keep explicit checks in page components for protected data |
| Cache invalidation | Use `revalidatePath` on content updates |
| Increased memory | Limit cache to read-only reference data |

---

## Files Reference

### Links needing prefetch:
- `components/YearGrid.tsx:53` - Year card Link
- `components/SubjectAccordion.tsx:51, 71, 98` - Subject + module Links
- `components/ModuleListItem.tsx` - Module Link (need to read)
- `components/BackLink.tsx` - Back Link
- `components/NavRail.tsx` - Nav items
- `app/(main)/page.tsx:92, 99` - Start here, Search
- `app/(main)/year/page.tsx:79` - Search link
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/page.tsx:126` - Next module
- `app/(main)/year/[yearId]/subjects/[subjectId]/modules/[moduleId]/page.tsx:252, 262, 277, 285` - Next/prev/back Links

### Pages with force-dynamic:
- `app/(main)/year/page.tsx:14`
- `app/(main)/resources/page.tsx:12`
- `app/(main)/quiz/module/[moduleId]/page.tsx:10`
- `app/(main)/quiz/subject/[subjectId]/page.tsx` (check)
- `app/account/page.tsx:14` (keep)
- `app/account/profile/page.tsx:14` (keep)
- `app/account/roadmap/page.tsx:14` (keep)
- `app/admin/page.tsx:14` (keep)

### Middleware:
- `proxy.ts:119-133` - Supabase auth getUser() call