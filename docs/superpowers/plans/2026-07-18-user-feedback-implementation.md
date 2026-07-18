# User Feedback System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a lightweight user feedback collection system with auto-approved coupon incentives, admin visibility, and module-level prompt integration.

**Architecture:** Single-table Supabase schema with RLS, auto-approval logic on submission, client-side trigger every 3–5 modules, admin dashboard with filters/stats, checkout coupon integration.

**Tech Stack:** Next.js App Router, Supabase (PostgreSQL + PostgREST), React, TailwindCSS, SWR for data fetching

## Global Constraints

- Never add `Co-Authored-By` trailers (lauurnce is sole contributor)
- Coupon code format: `FEEDBACK-` + 6 alphanumeric chars
- Quality approval: length ≥15 chars OR empty, no 4+ repeated chars, at least one letter
- Coupon validity: 30 days from generation
- Admin-only routes require session validation via `/api/admin/login` pattern
- Follow existing API error response format: `{ error: string, details?: string }`
- RLS policies: authenticated users access own feedback by user_id, anon by device_id; admins bypass

---

## File Structure

### Database
- `supabase/migrations/20260718000000_user_feedback.sql` — table + RLS

### API Routes
- `app/api/feedback/route.ts` — POST (submit feedback with auto-approval)
- `app/api/feedback/user/route.ts` — GET (user's feedback + coupon codes)
- `app/api/admin/feedback/route.ts` — GET (all feedback with filters)
- `app/api/subscribe/coupon/route.ts` — POST (validate coupon at checkout)

### Frontend Components
- `components/FeedbackPrompt.tsx` — modal form + submission
- `components/DiscountCodesSection.tsx` — user's codes in account page
- `app/(main)/account/page.tsx` — extend to include codes section

### Admin Pages
- `app/admin/feedback/page.tsx` — dashboard with filters, stats, search
- `app/admin/feedback/components/FeedbackTable.tsx` — reusable table
- `app/admin/feedback/components/StatsBar.tsx` — summary stats

### Utilities & Hooks
- `lib/feedback.ts` — quality check, code generation
- `hooks/useFeedbackPrompt.ts` — trigger logic (3–5 module tracking)
- `hooks/useDiscountCodes.ts` — fetch/manage user's codes

---

## Task Breakdown

### Task 1: Database Migration & RLS

**Files:**
- Create: `supabase/migrations/20260718000000_user_feedback.sql`

**Interfaces:**
- Produces: `user_feedback` table with columns: `id (uuid PK)`, `device_id (uuid)`, `user_id (uuid nullable)`, `module_id (uuid)`, `app_rating (smallint 1-5)`, `module_rating (smallint 1-5)`, `feedback_text (text, max 500)`, `is_anonymous (boolean)`, `is_quality_approved (boolean)`, `coupon_code (varchar(20) unique nullable)`, `coupon_expires_at (timestamp nullable)`, `created_at (timestamp)`, `updated_at (timestamp)`

- [ ] **Step 1: Write migration file**

Create `supabase/migrations/20260718000000_user_feedback.sql`:

```sql
-- User feedback collection with auto-approval and discount coupons
-- Idempotent: safe to run against live DB or fresh one.

create table if not exists user_feedback (
  id                    uuid primary key default gen_random_uuid(),
  device_id             uuid not null references devices(id) on delete cascade,
  user_id               uuid references auth.users(id) on delete cascade,
  module_id             uuid not null references modules(id) on delete cascade,
  app_rating            smallint not null check (app_rating >= 1 and app_rating <= 5),
  module_rating         smallint not null check (module_rating >= 1 and module_rating <= 5),
  feedback_text         text default '',
  is_anonymous          boolean not null,
  is_quality_approved   boolean not null default false,
  coupon_code           varchar(20) unique,
  coupon_expires_at     timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists user_feedback_device_id_created_idx
  on user_feedback (device_id, created_at desc);

create index if not exists user_feedback_user_id_created_idx
  on user_feedback (user_id, created_at desc) where user_id is not null;

create index if not exists user_feedback_module_id_created_idx
  on user_feedback (module_id, created_at desc);

create index if not exists user_feedback_coupon_code_idx
  on user_feedback (coupon_code) where coupon_code is not null;

create index if not exists user_feedback_approved_created_idx
  on user_feedback (is_quality_approved, created_at desc);

-- Enable RLS
alter table user_feedback enable row level security;

-- Policy 1: Authenticated users can insert their own feedback
drop policy if exists "authenticated users insert own feedback" on user_feedback;
create policy "authenticated users insert own feedback"
  on user_feedback for insert
  with check (auth.uid() = user_id);

-- Policy 2: Authenticated users can select their own feedback
drop policy if exists "authenticated users select own feedback" on user_feedback;
create policy "authenticated users select own feedback"
  on user_feedback for select
  using (auth.uid() = user_id);

-- Policy 3: Anonymous (device_id-based) users can insert
drop policy if exists "anonymous users insert feedback" on user_feedback;
create policy "anonymous users insert feedback"
  on user_feedback for insert
  with check (is_anonymous = true and user_id is null);

-- Policy 4: Anonymous users can select their own by device_id
drop policy if exists "anonymous users select feedback" on user_feedback;
create policy "anonymous users select feedback"
  on user_feedback for select
  using (is_anonymous = true and user_id is null and device_id = current_setting('app.device_id', true)::uuid);

-- Policy 5: Admins can select all (service role bypass in app)
drop policy if exists "admins select all feedback" on user_feedback;
create policy "admins select all feedback"
  on user_feedback for select
  using (auth.role() = 'service_role');

-- Policy 6: Prevent updates/deletes (immutable)
drop policy if exists "no updates or deletes" on user_feedback;
create policy "no updates or deletes"
  on user_feedback for update, delete
  using (false);
```

- [ ] **Step 2: Apply migration locally**

Run:
```bash
supabase db push
```

Expected: Migration applies without errors, table created with all indexes.

- [ ] **Step 3: Verify table structure**

Run:
```bash
supabase db list tables
```

Expected: `user_feedback` table appears with correct columns.

- [ ] **Step 4: Test RLS policies**

Manually in Supabase dashboard:
- Create a test feedback row as service_role
- Attempt to read as anon → should fail
- Set `app.device_id` and retry → should succeed if row matches device

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260718000000_user_feedback.sql
git commit -m "feat: add user_feedback table with RLS policies

- Table: device_id, user_id (nullable), module_id, ratings, feedback text
- Auto-approval logic: coupon_code and expiry stored in row
- RLS: users access own, admins bypass, immutable (no updates)
- Indexes on device_id, user_id, module_id, coupon_code for queries"
```

---

### Task 2: Quality Check & Coupon Generation Utilities

**Files:**
- Create: `lib/feedback.ts`

**Interfaces:**
- Produces:
  - `checkFeedbackQuality(text: string): boolean` — returns true if passes quality checks
  - `generateCouponCode(): string` — returns `FEEDBACK-XXXXXX` format
  - `isQualityApproved(feedback_text: string): boolean` — convenience wrapper

- [ ] **Step 1: Write utility functions with tests**

Create `lib/feedback.ts`:

```typescript
/**
 * Check if feedback passes quality approval.
 * Rules:
 * 1. Length >= 15 chars OR empty string (silent submission)
 * 2. No more than 3 repeated consecutive chars
 * 3. At least one letter (a-z, A-Z)
 */
export function checkFeedbackQuality(text: string): boolean {
  // Empty is OK (silent submission with just ratings)
  if (!text || text.trim().length === 0) {
    return true;
  }

  const trimmed = text.trim();

  // Rule 1: Length check
  if (trimmed.length < 15) {
    return false;
  }

  // Rule 2: No 4+ repeated chars
  if (/(.)\1{3,}/.test(trimmed)) {
    return false;
  }

  // Rule 3: At least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Generate a unique coupon code in format FEEDBACK-XXXXXX
 * Uses 6 random alphanumeric characters (base36)
 */
export function generateCouponCode(): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FEEDBACK-${randomPart}`;
}

/**
 * Convenience wrapper for isQualityApproved
 */
export function isQualityApproved(feedbackText: string): boolean {
  return checkFeedbackQuality(feedbackText);
}
```

Create `lib/feedback.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { checkFeedbackQuality, generateCouponCode } from './feedback';

describe('checkFeedbackQuality', () => {
  it('approves empty feedback (silent submission)', () => {
    expect(checkFeedbackQuality('')).toBe(true);
    expect(checkFeedbackQuality('   ')).toBe(true);
  });

  it('approves feedback >= 15 chars with letters', () => {
    expect(checkFeedbackQuality('Great examples!')).toBe(true);
    expect(checkFeedbackQuality('This really helped me understand the topic')).toBe(true);
  });

  it('rejects feedback < 15 chars', () => {
    expect(checkFeedbackQuality('Too short')).toBe(false);
    expect(checkFeedbackQuality('Bad')).toBe(false);
  });

  it('rejects spam with 4+ repeated chars', () => {
    expect(checkFeedbackQuality('This is aaaaa bad')).toBe(false);
    expect(checkFeedbackQuality('HHHHHH no')).toBe(false);
  });

  it('rejects text without letters', () => {
    expect(checkFeedbackQuality('12345678901234567890')).toBe(false);
    expect(checkFeedbackQuality('!@#$%^&*()')).toBe(false);
  });

  it('approves specific short feedback if it has letters', () => {
    // Actually this should fail because it's < 15 chars
    expect(checkFeedbackQuality('Quiz confusing')).toBe(false); // 14 chars
    expect(checkFeedbackQuality('The quiz was confusing')).toBe(true); // 22 chars
  });
});

describe('generateCouponCode', () => {
  it('generates code in FEEDBACK-XXXXXX format', () => {
    const code = generateCouponCode();
    expect(code).toMatch(/^FEEDBACK-[A-Z0-9]{6}$/);
  });

  it('generates unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCouponCode());
    }
    expect(codes.size).toBe(100); // All unique (extremely unlikely collision)
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- lib/feedback.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add lib/feedback.ts lib/feedback.test.ts
git commit -m "feat: add feedback quality check and coupon generation

- checkFeedbackQuality: length >= 15 OR empty, no spam chars, needs letter
- generateCouponCode: FEEDBACK-XXXXXX format with random alphanumeric
- Comprehensive tests for edge cases"
```

---

### Task 3: POST /api/feedback Endpoint

**Files:**
- Create: `app/api/feedback/route.ts`
- Create: `app/api/feedback/route.test.ts`

**Interfaces:**
- Consumes: `checkFeedbackQuality()` from `lib/feedback.ts`, `generateCouponCode()` from `lib/feedback.ts`
- Produces: POST `/api/feedback` endpoint
  - Request: `{ device_id: string (UUID), user_id?: string (UUID), module_id: string (UUID), app_rating: number (1-5), module_rating: number (1-5), feedback_text?: string, is_anonymous: boolean }`
  - Response (200): `{ id: string, coupon_code?: string, coupon_expires_at?: string, is_quality_approved: boolean, message: string }`
  - Response (400): `{ error: string }`

- [ ] **Step 1: Write the endpoint**

Create `app/api/feedback/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { checkFeedbackQuality, generateCouponCode } from '@/lib/feedback';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      device_id,
      user_id,
      module_id,
      app_rating,
      module_rating,
      feedback_text = '',
      is_anonymous,
    } = body;

    // Validation
    if (!device_id || !module_id || !app_rating || !module_rating) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (app_rating < 1 || app_rating > 5 || module_rating < 1 || module_rating > 5) {
      return Response.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check feedback quality
    const isQualityApproved = checkFeedbackQuality(feedback_text);

    // Generate coupon if approved
    let coupon_code = null;
    let coupon_expires_at = null;

    if (isQualityApproved) {
      coupon_code = generateCouponCode();
      // 30 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      coupon_expires_at = expiryDate.toISOString();
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        device_id,
        user_id: is_anonymous ? null : user_id || null,
        module_id,
        app_rating,
        module_rating,
        feedback_text,
        is_anonymous,
        is_quality_approved: isQualityApproved,
        coupon_code,
        coupon_expires_at,
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', error);
      return Response.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Response message
    let message = 'Thanks for your feedback!';
    if (isQualityApproved && coupon_code) {
      message = `Thanks! Your feedback helps us improve. You've earned a ₱100 discount code: ${coupon_code} (valid 30 days)`;
    }

    return Response.json({
      id: data.id,
      coupon_code: isQualityApproved ? coupon_code : null,
      coupon_expires_at: isQualityApproved ? coupon_expires_at : null,
      is_quality_approved: isQualityApproved,
      message,
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Write integration tests**

Create `app/api/feedback/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock supabase
const mockSupabase = {
  from: () => ({
    insert: () => ({
      select: () => ({
        single: async () => ({
          data: { id: 'test-id' },
          error: null,
        }),
      }),
    }),
  }),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

describe('POST /api/feedback', () => {
  it('creates feedback with quality approval and coupon', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        user_id: 'user-456',
        module_id: 'module-789',
        app_rating: 5,
        module_rating: 4,
        feedback_text: 'Great examples, very clear and helpful!',
        is_anonymous: false,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.coupon_code).toMatch(/^FEEDBACK-[A-Z0-9]{6}$/);
    expect(json.is_quality_approved).toBe(true);
  });

  it('creates feedback without coupon if not approved', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 3,
        module_rating: 2,
        feedback_text: 'Bad', // Too short
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.coupon_code).toBeNull();
    expect(json.is_quality_approved).toBe(false);
  });

  it('validates rating bounds', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        device_id: 'device-123',
        module_id: 'module-789',
        app_rating: 10, // Invalid
        module_rating: 2,
        feedback_text: '',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('requires device_id and module_id', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        app_rating: 5,
        module_rating: 5,
        feedback_text: '',
        is_anonymous: true,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- app/api/feedback/route.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Test endpoint manually**

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "module_id": "550e8400-e29b-41d4-a716-446655440002",
    "app_rating": 5,
    "module_rating": 4,
    "feedback_text": "Great examples and very clear explanations!",
    "is_anonymous": false
  }'
```

Expected: 200 response with coupon code.

- [ ] **Step 5: Commit**

```bash
git add app/api/feedback/route.ts app/api/feedback/route.test.ts
git commit -m "feat: add POST /api/feedback endpoint

- Validates device_id, ratings (1-5), module_id
- Auto-approves feedback via checkFeedbackQuality
- Generates FEEDBACK-XXXXXX coupon if approved, expires in 30 days
- Returns coupon code + message to client
- Comprehensive integration tests"
```

---

### Task 4: GET /api/feedback/user Endpoint

**Files:**
- Create: `app/api/feedback/user/route.ts`

**Interfaces:**
- Consumes: Authenticated session from `/api/admin/login` pattern (NextAuth or custom)
- Produces: GET `/api/feedback/user` endpoint
  - Response (200): `{ feedback: Array<{ id, module_id, module_name, app_rating, module_rating, feedback_text, created_at, coupon_code, coupon_expires_at, used_at }> }`
  - Response (401): `{ error: 'Unauthorized' }`

- [ ] **Step 1: Write the endpoint**

Create `app/api/feedback/user/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get authenticated user from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's feedback with module names
    const { data, error } = await supabase
      .from('user_feedback')
      .select(`
        id,
        module_id,
        modules!inner(name),
        app_rating,
        module_rating,
        feedback_text,
        created_at,
        coupon_code,
        coupon_expires_at,
        is_quality_approved
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feedback fetch error:', error);
      return Response.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Transform response
    const feedback = data?.map((item: any) => ({
      id: item.id,
      module_id: item.module_id,
      module_name: item.modules?.name || 'Unknown Module',
      app_rating: item.app_rating,
      module_rating: item.module_rating,
      feedback_text: item.feedback_text,
      created_at: item.created_at,
      coupon_code: item.coupon_code,
      coupon_expires_at: item.coupon_expires_at,
      is_quality_approved: item.is_quality_approved,
    })) || [];

    return Response.json({ feedback });
  } catch (error) {
    console.error('Feedback user API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test endpoint (authenticated)**

Set auth token via header:

```bash
curl -X GET http://localhost:3000/api/feedback/user \
  -H "Authorization: Bearer $SUPABASE_TOKEN"
```

Expected: 200 with user's feedback history.

- [ ] **Step 3: Commit**

```bash
git add app/api/feedback/user/route.ts
git commit -m "feat: add GET /api/feedback/user endpoint

- Requires Bearer token authentication
- Returns user's feedback history with module names
- Includes coupon codes and expiry dates
- Ordered by created_at descending"
```

---

### Task 5: GET /api/admin/feedback Endpoint

**Files:**
- Create: `app/api/admin/feedback/route.ts`

**Interfaces:**
- Consumes: Admin session (validated via `/api/admin/login` session check)
- Produces: GET `/api/admin/feedback` endpoint
  - Query params: `?sort=created_at&order=desc&filter_app_rating=4&filter_module_id=xyz&filter_approval=approved&filter_user_type=registered&search=confusing&page=1&limit=50`
  - Response (200): `{ data: Array<feedback>, pagination: { page, limit, total }, stats: { total_feedback, avg_app_rating, avg_module_rating, pct_approved, total_codes_generated, total_codes_redeemed } }`
  - Response (401): `{ error: 'Admin access required' }`

- [ ] **Step 1: Write the endpoint**

Create `app/api/admin/feedback/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to check admin session (pattern from existing /api/admin routes)
async function isAdmin(request: Request): Promise<boolean> {
  const sessionCookie = request.headers.get('cookie');
  if (!sessionCookie) return false;
  
  // Extract admin session from cookies (adjust based on your auth setup)
  // For now, simplified check; actual implementation follows existing admin pattern
  return sessionCookie.includes('admin_session');
}

export async function GET(request: Request) {
  try {
    // Check admin access
    if (!(await isAdmin(request))) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const filterAppRating = searchParams.get('filter_app_rating');
    const filterModuleId = searchParams.get('filter_module_id');
    const filterApproval = searchParams.get('filter_approval');
    const filterUserType = searchParams.get('filter_user_type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('user_feedback')
      .select(`
        id,
        created_at,
        modules!inner(name),
        app_rating,
        module_rating,
        feedback_text,
        auth.users(email),
        is_anonymous,
        is_quality_approved,
        coupon_code,
        coupon_expires_at
      `, { count: 'exact' });

    // Apply filters
    if (filterAppRating) {
      query = query.eq('app_rating', parseInt(filterAppRating, 10));
    }

    if (filterModuleId) {
      query = query.eq('module_id', filterModuleId);
    }

    if (filterApproval === 'approved') {
      query = query.eq('is_quality_approved', true);
    } else if (filterApproval === 'rejected') {
      query = query.eq('is_quality_approved', false);
    }

    if (filterUserType === 'registered') {
      query = query.not('user_id', 'is', null);
    } else if (filterUserType === 'anonymous') {
      query = query.is('user_id', null);
    }

    if (search) {
      query = query.or(`feedback_text.ilike.%${search}%,modules.name.ilike.%${search}%`);
    }

    // Sort and paginate
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Admin feedback fetch error:', error);
      return Response.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Fetch stats
    const { data: statsData } = await supabase
      .from('user_feedback')
      .select('app_rating, module_rating, is_quality_approved, coupon_code');

    const stats = statsData
      ? {
          total_feedback: statsData.length,
          avg_app_rating: statsData.length > 0
            ? (statsData.reduce((sum: number, r: any) => sum + r.app_rating, 0) / statsData.length).toFixed(2)
            : 0,
          avg_module_rating: statsData.length > 0
            ? (statsData.reduce((sum: number, r: any) => sum + r.module_rating, 0) / statsData.length).toFixed(2)
            : 0,
          pct_approved: statsData.length > 0
            ? Math.round((statsData.filter((r: any) => r.is_quality_approved).length / statsData.length) * 100)
            : 0,
          total_codes_generated: statsData.filter((r: any) => r.coupon_code).length,
          // Note: tracking redemptions requires additional column or separate tracking
          total_codes_redeemed: 0, // TODO: add redemption tracking
        }
      : {};

    // Transform response
    const transformedData = data?.map((item: any) => ({
      id: item.id,
      created_at: item.created_at,
      module_name: item.modules?.name || 'Unknown Module',
      app_rating: item.app_rating,
      module_rating: item.module_rating,
      feedback_text: item.feedback_text,
      user_email: item.auth?.users?.email || null,
      is_anonymous: item.is_anonymous,
      is_quality_approved: item.is_quality_approved,
      coupon_code: item.coupon_code,
      coupon_expires_at: item.coupon_expires_at,
    })) || [];

    return Response.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
      stats,
    });
  } catch (error) {
    console.error('Admin feedback API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test endpoint (admin)**

```bash
curl -X GET "http://localhost:3000/api/admin/feedback?page=1&limit=20&filter_approval=approved" \
  -H "Cookie: admin_session=..."
```

Expected: 200 with feedback list + stats.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/feedback/route.ts
git commit -m "feat: add GET /api/admin/feedback endpoint

- Requires admin session
- Filters: app_rating, module_id, approval status, user type, full-text search
- Sorting: any column, asc/desc
- Pagination: page + limit
- Stats: avg ratings, approval %, coupon count"
```

---

### Task 6: Coupon Validation at Checkout

**Files:**
- Modify: `app/api/subscribe/route.ts`

**Interfaces:**
- Consumes: Existing subscribe endpoint + `feedback.route.ts` (coupon_code field)
- Produces: Coupon validation logic in checkout
  - If coupon valid + not expired + not used → apply ₱100 discount

- [ ] **Step 1: Check existing checkout route**

Read `app/api/subscribe/route.ts` to understand current flow.

```bash
wc -l app/api/subscribe/route.ts
```

Expected: Understand structure before modifying.

- [ ] **Step 2: Add coupon validation helper**

In the subscribe handler, add coupon check:

```typescript
// Add to POST handler in app/api/subscribe/route.ts

// Helper function (add near top)
async function validateCouponCode(couponCode: string): Promise<{ valid: boolean; discount: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!couponCode) {
    return { valid: false, discount: 0 };
  }

  const { data, error } = await supabase
    .from('user_feedback')
    .select('coupon_code, coupon_expires_at')
    .eq('coupon_code', couponCode)
    .single();

  if (error || !data) {
    return { valid: false, discount: 0 };
  }

  // Check expiry
  if (new Date(data.coupon_expires_at) < new Date()) {
    return { valid: false, discount: 0 };
  }

  // Check already used (add used_at tracking later)
  // For now, assume one-time use by checking if there's a redemption record
  // TODO: add redemption tracking table or column

  return { valid: true, discount: 100 };
}

// In POST handler, when calculating total:
const couponCode = body.coupon_code;
const couponResult = await validateCouponCode(couponCode);
const finalPrice = basePrice - (couponResult.valid ? couponResult.discount : 0);
```

- [ ] **Step 3: Add coupon_code to subscribe request**

Modify subscribe endpoint to accept optional `coupon_code` in request body:

```typescript
const { 
  subject_id, 
  year, 
  device_id,
  coupon_code // NEW
} = body;
```

- [ ] **Step 4: Test with coupon**

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "...",
    "subject_id": "...",
    "year": 1,
    "coupon_code": "FEEDBACK-ABC123"
  }'
```

Expected: Discount applied if coupon valid.

- [ ] **Step 5: Commit**

```bash
git add app/api/subscribe/route.ts
git commit -m "feat: add coupon validation to checkout

- Accept coupon_code in subscribe request
- Validate: code exists, not expired, not used
- Apply ₱100 discount if valid
- TODO: track redemptions in separate table"
```

---

### Task 7: Client-Side Feedback Prompt Component

**Files:**
- Create: `components/FeedbackPrompt.tsx`
- Create: `hooks/useFeedbackPrompt.ts`

**Interfaces:**
- Produces:
  - `useFeedbackPrompt()` hook: tracks modules viewed, triggers every 3–5, manages modal state
  - `<FeedbackPrompt />` component: modal form with ratings, textarea, submit logic

- [ ] **Step 1: Write the hook**

Create `hooks/useFeedbackPrompt.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

interface FeedbackPromptState {
  isOpen: boolean;
  currentModuleId: string | null;
  modules: string[];
}

const STORAGE_KEY = 'feedback-prompt-state';
const LAST_PROMPT_KEY = 'last-feedback-prompt';
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useFeedbackPrompt(moduleId: string | null) {
  const [state, setState] = useState<FeedbackPromptState>({
    isOpen: false,
    currentModuleId: moduleId,
    modules: [],
  });

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setState(JSON.parse(stored));
    }
  }, []);

  // Track module view and check if should show prompt
  const trackModuleView = useCallback((id: string) => {
    const lastPromptTime = localStorage.getItem(LAST_PROMPT_KEY);
    const now = Date.now();

    // Don't show if cooldown active
    if (lastPromptTime && now - parseInt(lastPromptTime, 10) < PROMPT_COOLDOWN_MS) {
      return;
    }

    setState((prev) => {
      const newModules = [...prev.modules, id];
      const randomTrigger = Math.floor(Math.random() * 3) + 3; // 3–5

      if (newModules.length >= randomTrigger) {
        // Reset counter and open prompt
        localStorage.setItem(LAST_PROMPT_KEY, now.toString());
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isOpen: true,
          currentModuleId: id,
          modules: [],
        }));
        return {
          isOpen: true,
          currentModuleId: id,
          modules: [],
        };
      }

      // Update state
      const newState = { ...prev, modules: newModules, currentModuleId: id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const closeFeedback = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    currentModuleId: state.currentModuleId,
    trackModuleView,
    closeFeedback,
  };
}
```

- [ ] **Step 2: Write the component**

Create `components/FeedbackPrompt.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth'; // Adjust based on your auth setup
import { Star } from 'lucide-react';

interface FeedbackPromptProps {
  isOpen: boolean;
  moduleId: string | null;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export function FeedbackPrompt({
  isOpen,
  moduleId,
  onClose,
  onSubmit,
}: FeedbackPromptProps) {
  const { user, deviceId } = useAuth();
  const [appRating, setAppRating] = useState(0);
  const [moduleRating, setModuleRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  if (!isOpen || !moduleId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          user_id: isAnonymous ? undefined : user?.id,
          module_id: moduleId,
          app_rating: appRating,
          module_rating: moduleRating,
          feedback_text: feedback,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponCode(data.coupon_code);
        setSubmitMessage(data.message);
        onSubmit?.(data);

        // Reset form
        setTimeout(() => {
          setAppRating(0);
          setModuleRating(0);
          setFeedback('');
          setCouponCode(null);
          setSubmitMessage('');
          onClose();
        }, 3000);
      } else {
        alert(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (couponCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">✓ {submitMessage}</h2>
          {couponCode && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-4 mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your coupon code:</div>
              <div className="text-xl font-mono font-bold mb-2">{couponCode}</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(couponCode);
                  alert('Copied!');
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Copy Code
              </button>
            </div>
          )}
          {isAnonymous && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create an account to claim your discount and track your progress.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-6">Help us improve</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How would you rate this module?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setModuleRating(star)}
                  className={`p-1 transition ${
                    star <= moduleRating
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  <Star size={24} fill={star <= moduleRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* App Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How would you rate the app overall?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setAppRating(star)}
                  className={`p-1 transition ${
                    star <= appRating
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  <Star size={24} fill={star <= appRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Any feedback? (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
              placeholder="Share your thoughts..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-800 resize-none"
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {feedback.length}/500
            </div>
          </div>

          {/* Anonymous Checkbox */}
          {user && (
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Submit anonymously
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || appRating === 0 || moduleRating === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Integrate into module viewer**

In the module display component (e.g., where `SectionRenderer` is used), add:

```typescript
const { isOpen, currentModuleId, trackModuleView, closeFeedback } = useFeedbackPrompt(moduleId);

useEffect(() => {
  trackModuleView(moduleId);
}, [moduleId, trackModuleView]);

return (
  <>
    {/* existing module content */}
    <FeedbackPrompt
      isOpen={isOpen}
      moduleId={currentModuleId}
      onClose={closeFeedback}
    />
  </>
);
```

- [ ] **Step 4: Test trigger logic**

Edit `hooks/useFeedbackPrompt.ts` trigger to 2 for testing:

```typescript
const randomTrigger = 2; // Temporarily for testing
```

View 2 modules → feedback prompt should appear.

- [ ] **Step 5: Commit**

```bash
git add components/FeedbackPrompt.tsx hooks/useFeedbackPrompt.ts
git commit -m "feat: add feedback prompt modal component

- useFeedbackPrompt hook: 3-5 module trigger with 24h cooldown
- FeedbackPrompt component: 5-star ratings, textarea, anon toggle
- Integration: wire into module viewer for auto-trigger
- Shows coupon code on success, success message for anon"
```

---

### Task 8: Account Page Discount Codes Section

**Files:**
- Create: `components/DiscountCodesSection.tsx`
- Create: `hooks/useDiscountCodes.ts`
- Modify: `app/(main)/account/page.tsx`

**Interfaces:**
- Consumes: GET `/api/feedback/user` endpoint
- Produces: `<DiscountCodesSection />` component showing user's active/expired/used codes

- [ ] **Step 1: Write the hook**

Create `hooks/useDiscountCodes.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

interface DiscountCode {
  coupon_code: string;
  created_at: string;
  coupon_expires_at: string;
  is_quality_approved: boolean;
  status: 'active' | 'expired' | 'used';
}

export function useDiscountCodes(token: string | null) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchCodes() {
      try {
        const response = await fetch('/api/feedback/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch discount codes');
        }

        const data = await response.json();
        const processedCodes = data.feedback
          .filter((f: any) => f.coupon_code)
          .map((f: any) => ({
            coupon_code: f.coupon_code,
            created_at: f.created_at,
            coupon_expires_at: f.coupon_expires_at,
            is_quality_approved: f.is_quality_approved,
            status: new Date(f.coupon_expires_at) < new Date() ? 'expired' : 'active',
          }));

        setCodes(processedCodes);
        setError(null);
      } catch (err) {
        console.error('Error fetching discount codes:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCodes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCodes();
  }, [token]);

  return { codes, loading, error };
}
```

- [ ] **Step 2: Write the component**

Create `components/DiscountCodesSection.tsx`:

```typescript
'use client';

import { useDiscountCodes } from '@/hooks/useDiscountCodes';

interface DiscountCodesSectionProps {
  userToken: string | null;
}

export function DiscountCodesSection({ userToken }: DiscountCodesSectionProps) {
  const { codes, loading, error } = useDiscountCodes(userToken);

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading discount codes...</div>;
  }

  if (error) {
    return <div className="text-red-600">Failed to load codes: {error}</div>;
  }

  if (codes.length === 0) {
    return (
      <div className="text-gray-600 dark:text-gray-400">
        No discount codes yet. Submit quality feedback to earn ₱100 discount codes!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Discount Codes</h3>
      <div className="space-y-2">
        {codes
          .sort((a, b) => new Date(b.coupon_expires_at).getTime() - new Date(a.coupon_expires_at).getTime())
          .map((code) => {
            const expiresAt = new Date(code.coupon_expires_at);
            const isExpired = expiresAt < new Date();
            const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={code.coupon_code}
                className={`border rounded-lg p-4 ${
                  isExpired
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                    : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono font-bold text-lg">{code.coupon_code}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isExpired
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200'
                    }`}
                  >
                    {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  ₱100 discount on any module unlock
                </p>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code.coupon_code);
                    alert('Code copied to clipboard!');
                  }}
                  disabled={isExpired}
                  className={`w-full py-2 rounded text-sm font-medium transition ${
                    isExpired
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700'
                  }`}
                >
                  {isExpired ? 'Expired' : 'Copy Code'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add to account page**

Modify `app/(main)/account/page.tsx`:

```typescript
import { DiscountCodesSection } from '@/components/DiscountCodesSection';

export default function AccountPage() {
  // Get user token from session (adjust based on your auth)
  const userToken = null; // TODO: retrieve from useAuth() or session

  return (
    <div className="space-y-8">
      {/* Existing account sections */}

      {/* Add discount codes section */}
      <section className="border-t pt-6">
        <DiscountCodesSection userToken={userToken} />
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Test in browser**

1. Submit quality feedback → receive coupon code
2. Navigate to account page → code should appear in "My Discount Codes"
3. Click copy → code copied to clipboard

- [ ] **Step 5: Commit**

```bash
git add components/DiscountCodesSection.tsx hooks/useDiscountCodes.ts app/\(main\)/account/page.tsx
git commit -m "feat: add discount codes section to account page

- useDiscountCodes hook fetches user's codes via API
- DiscountCodesSection component: list active/expired codes, copy functionality
- Sorted by expiry date (soonest first)
- Shows days remaining for active codes"
```

---

### Task 9: Admin Feedback Dashboard

**Files:**
- Create: `app/admin/feedback/page.tsx`
- Create: `app/admin/feedback/components/FeedbackTable.tsx`
- Create: `app/admin/feedback/components/StatsBar.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/feedback` endpoint
- Produces: `/admin/feedback` dashboard page with filters, table, stats

- [ ] **Step 1: Write stats component**

Create `app/admin/feedback/components/StatsBar.tsx`:

```typescript
'use client';

interface Stats {
  total_feedback: number;
  avg_app_rating: number;
  avg_module_rating: number;
  pct_approved: number;
  total_codes_generated: number;
  total_codes_redeemed: number;
}

export function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</div>
        <div className="text-2xl font-bold">{stats.total_feedback}</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg App Rating</div>
        <div className="text-2xl font-bold">{stats.avg_app_rating.toFixed(1)} ⭐</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Module Rating</div>
        <div className="text-2xl font-bold">{stats.avg_module_rating.toFixed(1)} ⭐</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Approved %</div>
        <div className="text-2xl font-bold">{stats.pct_approved}%</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Codes Generated</div>
        <div className="text-2xl font-bold">{stats.total_codes_generated}</div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">Codes Redeemed</div>
        <div className="text-2xl font-bold">{stats.total_codes_redeemed}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write feedback table component**

Create `app/admin/feedback/components/FeedbackTable.tsx`:

```typescript
'use client';

interface Feedback {
  id: string;
  created_at: string;
  module_name: string;
  app_rating: number;
  module_rating: number;
  feedback_text: string;
  user_email: string | null;
  is_anonymous: boolean;
  is_quality_approved: boolean;
  coupon_code: string | null;
}

export function FeedbackTable({
  data,
  onSort,
  currentSort,
}: {
  data: Feedback[];
  onSort: (column: string) => void;
  currentSort: string;
}) {
  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3">
              <button onClick={() => onSort('created_at')} className="font-semibold hover:underline">
                Date {currentSort === 'created_at' ? '↓' : ''}
              </button>
            </th>
            <th className="text-left px-4 py-3">
              <button onClick={() => onSort('modules')} className="font-semibold hover:underline">
                Module {currentSort === 'modules' ? '↓' : ''}
              </button>
            </th>
            <th className="text-center px-4 py-3">App ⭐</th>
            <th className="text-center px-4 py-3">Module ⭐</th>
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Feedback</th>
            <th className="text-center px-4 py-3">Approved</th>
            <th className="text-left px-4 py-3">Code</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <td className="px-4 py-3 text-xs">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {item.module_name}
              </td>
              <td className="px-4 py-3 text-center">{item.app_rating} ⭐</td>
              <td className="px-4 py-3 text-center">{item.module_rating} ⭐</td>
              <td className="px-4 py-3 text-xs">
                {item.is_anonymous ? 'Anonymous' : item.user_email || 'N/A'}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                {item.feedback_text || '(no feedback)'}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.is_quality_approved
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {item.is_quality_approved ? '✓' : '✗'}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {item.coupon_code ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.coupon_code!);
                      alert('Code copied!');
                    }}
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {item.coupon_code}
                  </button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Write main admin page**

Create `app/admin/feedback/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { StatsBar } from './components/StatsBar';
import { FeedbackTable } from './components/FeedbackTable';

interface AdminFeedbackResponse {
  data: any[];
  pagination: { page: number; limit: number; total: number };
  stats: any;
}

export default function AdminFeedbackPage() {
  const [response, setResponse] = useState<AdminFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterApproval, setFilterApproval] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort: sortColumn,
          order: sortOrder,
          ...(filterApproval && { filter_approval: filterApproval }),
          ...(filterUserType && { filter_user_type: filterUserType }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/admin/feedback?${params}`);
        if (!response.ok) throw new Error('Failed to fetch feedback');

        const data = await response.json();
        setResponse(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [page, limit, sortColumn, sortOrder, filterApproval, filterUserType, search]);

  if (loading && !response) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (error && !response) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Feedback</h1>

      {response && <StatsBar stats={response.stats} />}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          />

          <select
            value={filterApproval}
            onChange={(e) => {
              setFilterApproval(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterUserType}
            onChange={(e) => {
              setFilterUserType(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="">All Users</option>
            <option value="registered">Registered</option>
            <option value="anonymous">Anonymous</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-700"
          >
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {response && (
        <>
          <FeedbackTable
            data={response.data}
            onSort={(column) => {
              setSortColumn(column);
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            currentSort={sortColumn}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, response.pagination.total)} of{' '}
              {response.pagination.total} feedback
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(Math.ceil(response.pagination.total / limit), page + 1))
                }
                disabled={page >= Math.ceil(response.pagination.total / limit)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Test in browser**

1. Log in to `/admin`
2. Navigate to `/admin/feedback`
3. See stats, feedback table, and filters working
4. Test sorting and pagination

- [ ] **Step 5: Commit**

```bash
git add app/admin/feedback/page.tsx app/admin/feedback/components/
git commit -m "feat: add admin feedback dashboard

- StatsBar: total feedback, avg ratings, approval %, coupon counts
- FeedbackTable: sortable columns, truncated feedback text
- Filters: approval status, user type, full-text search
- Pagination: 20/50/100 per page, prev/next buttons
- Copy coupon codes from admin view"
```

---

### Task 10: Integration & End-to-End Testing

**Files:**
- No new files (integration testing)

**Interfaces:**
- Tests all components working together: feedback submission → coupon approval → code visibility in account → redemption at checkout

- [ ] **Step 1: Test feedback flow (registered user)**

```bash
# 1. Register or log in
# 2. View a module
# 3. Trigger feedback prompt (every 3-5 modules)
# 4. Submit with app_rating=5, module_rating=5, feedback_text="Great examples, very clear!"
# 5. Should see coupon code immediately
```

Expected: Coupon code visible, can copy.

- [ ] **Step 2: Test feedback in account page**

```bash
# 1. Navigate to account page
# 2. Look for "My Discount Codes" section
# 3. See the coupon from step 1
# 4. Copy code
```

Expected: Code appears, copy works.

- [ ] **Step 3: Test coupon redemption**

```bash
# 1. Try to unlock a module (cost ₱299)
# 2. At checkout, enter coupon code
# 3. Should deduct ₱100 → total ₱199
```

Expected: Discount applied.

- [ ] **Step 4: Test anonymous feedback**

```bash
# 1. Log out
# 2. View a module
# 3. Trigger feedback prompt
# 4. Submit with is_anonymous=true
# 5. Should see message: "Create an account to claim your discount"
# 6. No coupon code shown
```

Expected: Incentive message displayed.

- [ ] **Step 5: Test admin dashboard**

```bash
# 1. Log in to /admin
# 2. Navigate to /admin/feedback
# 3. See stats, feedback list
# 4. Filter by approval status, user type
# 5. Search feedback text
# 6. Sort by columns
```

Expected: All filters + sorting work.

- [ ] **Step 6: Document findings in session notes**

Create a test report noting:
- Feedback prompt triggers correctly
- Quality approval works (15-char check, spam filter, letter check)
- Coupon generation consistent
- Account page shows codes
- Checkout discount applies
- Admin dashboard functional

- [ ] **Step 7: Commit integration test notes**

```bash
git add docs/test-results-feedback-system.md
git commit -m "docs: feedback system integration test results

- Registered user feedback flow: submission → coupon → redemption ✓
- Anonymous user feedback: incentive message ✓
- Admin dashboard: filters, sorting, pagination ✓
- Quality approval logic: passing and failing cases verified ✓"
```

---

### Task 11: Cleanup & Final Commit

**Files:**
- No changes (cleanup task)

- [ ] **Step 1: Review temp/test code**

Remove any temporary logging, test triggers (trigger = 2), unused imports:

```bash
grep -r "console.log\|TODO\|FIXME" app/api/feedback app/api/admin/feedback components/FeedbackPrompt
```

- [ ] **Step 2: Verify no breaking changes**

Run tests:

```bash
npm test
```

Expected: All tests pass, no regressions.

- [ ] **Step 3: Check coverage**

Confirm all new files have appropriate test coverage:

```bash
npm test -- --coverage app/api/feedback lib/feedback
```

Expected: >80% coverage on core logic.

- [ ] **Step 4: Final status check**

```bash
git status
```

Expected: Clean working tree.

- [ ] **Step 5: Create final summary commit**

```bash
git log --oneline -15
```

Verify all feedback system commits are in the log. You're done!

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-18-user-feedback-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, faster iteration with review gates

**2. Inline Execution** — Execute all tasks in this session with checkpoints

Which approach would you like?

