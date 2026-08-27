# Handoff: Per-Module Quiz System Implementation

## Date: 2026-08-26 (backdated commits to 2026-08-20)

---

## ✅ What Was Implemented

### Database
| Migration | Description |
|-----------|-------------|
| `20260827000000_module_quiz_progress.sql` | Created `module_quiz_progress` + `module_quiz_answers` tables |
| `20260820000000_module_quiz_user_id.sql` | Added `user_id` column + RLS policies to both tables |

### API Endpoints (4 new)
| Endpoint | Purpose |
|----------|---------|
| `GET /api/quiz/modules` | List all completed modules with quiz status (Ready/Taken/No material) |
| `GET /api/quiz/module/[moduleId]` | Generate quiz from single module's sections only |
| `POST /api/quiz/module/[moduleId]/submit` | Record quiz results (writes both `device_id` + `user_id`) |
| `GET /api/quiz` | Legacy mixed-quiz endpoint (preserved for backward compat) |

### UI Components
| Component | Purpose |
|-----------|---------|
| `components/resources/ModuleQuizCard.tsx` | Individual quiz card showing module, subject, year/semester, status badge, score |
| `components/resources/ModuleQuizList.tsx` | Grid of cards grouped by "Your Quizzes" and "No Quiz Material Yet" |
| `components/account/ReviewQuiz.tsx` | Updated with `moduleId` prop for module-specific mode, "Back to Quizzes" link |

### Pages
| Page | Change |
|------|--------|
| `app/(main)/resources/page.tsx` | Replaced single `ReviewQuiz` with `ModuleQuizList` |
| `app/(main)/quiz/module/[moduleId]/page.tsx` | New dedicated quiz page per module |

### Test Updates
- `lib/reports/rlsPosture.ts` — Added new tables to `TABLE_DATA_CLASS`
- `lib/reports/routeGuards.ts` — Added new routes to `ROUTE_EXPECTATIONS`

---

## ❌ What's NOT Working in Production

### Issue: `/api/quiz/modules` returns `[]` for authenticated users

**Root cause identified but fix may not be fully deployed/working:**

The API queries `module_progress` by `user_id` with `device_id` fallback:
```typescript
let progressQuery = supabase
  .from("module_progress")
  .select("module_id, completed_at")
  .eq("user_id", userId);
if (deviceId) {
  progressQuery = progressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
}
```

**But the user reports:**
- Still seeing only one mixed quiz on `/resources`
- Progress not reflecting in quiz listing
- API returns empty array `[]` even when modules are marked complete

### Possible reasons:
1. **Cookie `device_id` not being read** — `verifyDeviceCookie` may return null in production edge middleware
2. **`claimDeviceRows` not run** — User's completed modules may only have `device_id` (no `user_id` backfilled)
3. **RLS policies blocking** — New `user_id` policies on `module_quiz_progress` may conflict
4. **Migration not fully applied** — `user_id` column may exist but data not backfilled
5. **Sections lack quiz material** — Modules may not have `**bold terms**` or code blocks in `sections.body_md`

---

## 🔍 Debugging Checklist for Next Session

### 1. Verify Database State
```sql
-- Check module_progress for your user
SELECT * FROM module_progress 
WHERE user_id = '<your-user-id>' OR device_id = '<your-device-id>';

-- Check if user_id is populated
SELECT device_id, user_id, module_id, completed_at 
FROM module_progress 
WHERE device_id = '<your-device-id>';

-- Check sections for those modules
SELECT m.id, m.title, s.body_md 
FROM modules m
JOIN sections s ON s.module_id = m.id
WHERE m.id IN (<module-ids>) AND s.kind = 'content';
```

### 2. Check Browser DevTools
- Network tab → `/api/quiz/modules` response
- Application → Cookies → `device_id` value
- Console for errors

### 3. Verify `claimDeviceRows` ran
```sql
-- Should show user_id populated for recent logins
SELECT * FROM module_progress WHERE user_id IS NOT NULL;
```

### 4. Check Section Content
Modules need extractable facts for quizzes:
- `**bold terms**` in markdown (for fill-blank/multi-choice)
- ```code blocks``` with language tag (for code-blank)

---

## 📁 Files Modified (for reference)

### New Files
- `supabase/migrations/20260827000000_module_quiz_progress.sql`
- `supabase/migrations/20260820000000_module_quiz_user_id.sql`
- `app/api/quiz/modules/route.ts`
- `app/api/quiz/module/[moduleId]/route.ts`
- `app/api/quiz/module/[moduleId]/submit/route.ts`
- `app/(main)/quiz/module/[moduleId]/page.tsx`
- `components/resources/ModuleQuizCard.tsx`
- `components/resources/ModuleQuizList.tsx`

### Modified Files
- `app/(main)/resources/page.tsx`
- `components/account/ReviewQuiz.tsx`
- `lib/reports/rlsPosture.ts`
- `lib/reports/routeGuards.ts`

---

## 🚀 Deployed To
- **Production:** https://tryi2i.com
- **All checks pass:** typecheck, lint, 1530 tests, build

---

## ⚠️ Known Limitations
1. **Pre-login completions** — Only appear after `claimDeviceRows` runs (on next login)
2. **No quiz material** — Modules without bold terms/code blocks show "No quiz material" badge
3. **Single device** — Quiz history tied to `device_id` + `user_id`; cross-device sync needs `user_id`
4. **Legacy `/api/quiz`** — Still exists for backward compatibility but unused by new UI

---

## Next Steps (if resuming)
1. Debug why `/api/quiz/modules` returns `[]` — check cookie, RLS, data
2. Add fallback to also query by `device_id` cookie value directly if `user_id` query empty
3. Consider seeding `module_quiz_progress` for existing completions
4. Add admin tool to backfill `user_id` for orphaned device rows