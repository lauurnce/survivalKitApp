# User Feedback System — Design Spec

**Date:** 2026-07-18  
**Status:** Approved  
**Owner:** lauurnce

---

## Overview

A lightweight user feedback collection system that surfaces in modules, incentivizes quality feedback with discount coupons (₱100 off, ₱299→₱199), and provides admin visibility into user sentiment and actionable improvements.

**Goals:**
1. Capture feedback from all users (anonymous + registered) without friction
2. Incentivize account creation and quality submissions
3. Give admin a clear view of feature quality and common issues
4. Ship fast (minimal schema, auto-approval, no manual review overhead)

---

## User Flows

### Registered User Flow
1. User reads a module
2. After every 3–5 modules, feedback prompt appears
3. User rates the module (1–5 stars) and app (1–5 stars), optionally writes feedback
4. Submit
5. If feedback passes quality checks → immediately show coupon code `FEEDBACK-ABC123` (valid 30 days)
6. User can view all codes anytime in account page under "My Discount Codes"
7. At checkout, user enters code to apply ₱100 discount

### Anonymous User Flow
1. User reads a module (not logged in)
2. After every 3–5 modules, feedback prompt appears
3. User rates and submits (anonymous by default, checkbox available to toggle)
4. If feedback passes quality checks → show message: "Thanks for your feedback! Create an account to claim your ₱100 discount and track your progress"
5. Anonymous feedback is captured but no coupon code is generated/shown
6. If user later signs up and links device, they can see their feedback history (optional nice-to-have, not required for MVP)

---

## Database Schema

### `user_feedback` Table

```sql
id                    UUID PRIMARY KEY (default: gen_random_uuid())
device_id             UUID NOT NULL (references devices.id)
user_id               UUID NULLABLE (references auth.users.id, null = anonymous)
module_id             UUID NOT NULL (references modules.id)
app_rating            SMALLINT NOT NULL CHECK (app_rating >= 1 AND app_rating <= 5)
module_rating         SMALLINT NOT NULL CHECK (module_rating >= 1 AND module_rating <= 5)
feedback_text         TEXT (max 500 chars, default empty string)
is_anonymous          BOOLEAN NOT NULL (true if user_id is null, false otherwise)
is_quality_approved   BOOLEAN NOT NULL (default false, set by auto-approval logic)
coupon_code           VARCHAR(20) UNIQUE NULLABLE (format: FEEDBACK-XXXXXX)
coupon_expires_at     TIMESTAMP NULLABLE (now() + 30 days if approved, else null)
created_at            TIMESTAMP DEFAULT now()
updated_at            TIMESTAMP DEFAULT now()
```

**Indexes:**
- `(user_id, created_at DESC)` — for user's feedback history
- `(module_id, created_at DESC)` — for module feedback
- `(coupon_code)` — for coupon lookup at checkout
- `(is_quality_approved, created_at DESC)` — for admin dashboard filtering

**Row-Level Security (RLS):**
- Users can SELECT/INSERT their own feedback (based on `user_id` or `device_id` if anonymous)
- Admins can SELECT all feedback
- No one can UPDATE/DELETE feedback (immutable once submitted)

---

## Quality Approval Logic

Feedback auto-approves (sets `is_quality_approved = true` + generates coupon code) if:

1. **Length:** `LENGTH(feedback_text) >= 15` characters
   - OR `feedback_text IS NULL OR feedback_text = ''` (silent submission with just ratings is valid)
2. **Not spam:** No more than 3 repeated consecutive characters (e.g., "aaa" OK, "aaaa" not OK)
3. **Not gibberish:** Contains at least one letter (a–z or A–Z)

**Why these rules:**
- Filters low-effort one-word junk ("bad", "good")
- Allows silent feedback (just ratings, no text) — useful signal
- Allows specific short feedback ("The quiz was confusing") — actionable
- Allows positive feedback ("Helped me pass") — validating
- Blocks spam/repeated chars and pure symbols

**Implementation:**
- Check runs server-side on POST `/api/feedback`
- If passes, generate coupon code immediately
- If fails, feedback still saved but `is_quality_approved = false`, no code generated

---

## Coupon Code System

### Generation

When feedback auto-approves:
- Generate 6-char random code: `FEEDBACK-` + alphanumeric (base36 or hex)
- Example: `FEEDBACK-A7K2M9`
- Retry if collision (rare, but handle it)
- Set `coupon_expires_at = now() + 30 days`
- Store in feedback record

### Validation & Redemption

At checkout:
1. User enters coupon code
2. Query: `SELECT * FROM user_feedback WHERE coupon_code = ? AND coupon_expires_at > now()`
3. If found → apply ₱100 discount
4. Track usage: add `used_at` column (or check in PayMongo webhook if code is already redeemed)

### User View (Account Page)

Add section: "My Discount Codes"
- List all codes for logged-in user
- Columns: code, created date, expires date, status (active/expired/redeemed)
- Sortable by expiry date (soonest first)

---

## Frontend: Feedback Prompt

### Trigger Logic

Client-side tracking (localStorage):
- Track modules viewed in current session
- Count: increment after each module read
- Every 3–5 modules (randomized), trigger prompt
- Check `lastFeedbackPrompt` timestamp → don't show again if < 24 hours old
- User can always dismiss and won't see it again that day

### UI: Feedback Modal

**Form fields:**
- "How would you rate this module?" → 5-star selector
- "How would you rate the app overall?" → 5-star selector
- "Any feedback? (optional)" → textarea, max 500 chars
- Checkbox: "Submit anonymously" (pre-checked if not logged in, disabled if logged in)
- "Submit" button + "Cancel" button

**Styling:**
- Modal overlay, centered
- Simple, non-intrusive
- Dark/light mode aware

### Success States

**Registered user (feedback approved):**
```
✓ Thanks for your feedback!

Your coupon code:
[FEEDBACK-ABC123]  [Copy]

Valid for 30 days. Use at checkout to save ₱100.
```

**Registered user (feedback not approved):**
```
✓ Thanks for your feedback!

We appreciate all input — even if it doesn't earn a coupon this time.
[Close]
```

**Anonymous user (feedback approved):**
```
✓ Thanks for your feedback!

Create an account to claim your ₱100 discount code and track your progress.
[Sign Up]  [Close]
```

---

## Admin Dashboard

### Route
`/admin/feedback`

### Features

#### 1. Summary Stats (Top of Page)
- Total feedback submitted
- Average app rating (1–5)
- Average module rating (1–5)
- % approved feedback
- Total coupon codes generated
- Total coupon codes redeemed

#### 2. Feedback List (Main Content)

**Columns:**
| Date | Module | App ⭐ | Module ⭐ | User | Feedback | Approved | Code |
|------|--------|---------|-----------|------|----------|----------|------|
| Jul 18 | Data Structures | 5 | 4 | jasmine_@... | "Great examples" | ✓ | FEED-XYZ |
| Jul 17 | Networking | 2 | 2 | anon | "Confusing" | ✓ | - |

- Sortable: click column header to sort (date desc default)
- Paginated: 50 per page
- Feedback text truncated; click to expand/view full

#### 3. Filters (Sidebar or Top Bar)

- **By Rating:** dropdown (app rating, module rating, "all")
- **By Module:** searchable dropdown (all modules)
- **By Approval:** radio (approved, rejected, all)
- **By User Type:** radio (registered, anonymous, all)
- **By Date Range:** date picker (optional)
- **Search:** full-text search on feedback text + module name

#### 4. Actions per Feedback

- Click feedback text → modal with full text + meta
- Copy coupon code button (if code exists)
- "Marked as reviewed" checkbox (optional, client-side only, not persisted)

---

## API Endpoints

### 1. POST `/api/feedback`
**Submit feedback**

**Request:**
```json
{
  "device_id": "uuid",
  "user_id": "uuid (optional, null if anon)",
  "module_id": "uuid",
  "app_rating": 5,
  "module_rating": 4,
  "feedback_text": "Great examples, very clear!",
  "is_anonymous": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "coupon_code": "FEEDBACK-ABC123",
  "coupon_expires_at": "2026-08-18T10:30:00Z",
  "is_quality_approved": true,
  "message": "Thanks! Your coupon code is FEEDBACK-ABC123 (valid 30 days)"
}
```

**Response (200, not approved):**
```json
{
  "id": "uuid",
  "coupon_code": null,
  "is_quality_approved": false,
  "message": "Thanks for your feedback!"
}
```

### 2. GET `/api/feedback/user` (Authenticated)
**Get user's feedback history + discount codes**

**Response (200):**
```json
{
  "feedback": [
    {
      "id": "uuid",
      "module_id": "uuid",
      "module_name": "Data Structures",
      "app_rating": 5,
      "module_rating": 4,
      "feedback_text": "...",
      "created_at": "2026-07-18T...",
      "coupon_code": "FEEDBACK-ABC123",
      "coupon_expires_at": "2026-08-18T...",
      "used_at": null
    }
  ]
}
```

### 3. GET `/api/admin/feedback` (Admin Only)
**List all feedback with filters**

**Query params:**
```
?sort=created_at&order=desc
&filter_app_rating=4
&filter_module_id=uuid
&filter_approval=approved
&filter_user_type=registered
&search=confusing
&page=1
&limit=50
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "created_at": "...",
      "module_name": "Data Structures",
      "app_rating": 5,
      "module_rating": 4,
      "feedback_text": "...",
      "user_email": "user@example.com or null",
      "is_anonymous": false,
      "is_quality_approved": true,
      "coupon_code": "FEEDBACK-ABC123",
      "coupon_expires_at": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 347
  },
  "stats": {
    "total_feedback": 347,
    "avg_app_rating": 4.2,
    "avg_module_rating": 4.1,
    "pct_approved": 78,
    "total_codes_generated": 271,
    "total_codes_redeemed": 45
  }
}
```

### 4. POST `/api/checkout/validate-coupon` (Existing, Extend)
**Validate coupon at checkout**

**Request:**
```json
{
  "coupon_code": "FEEDBACK-ABC123"
}
```

**Response (200):**
```json
{
  "valid": true,
  "discount_amount": 100
}
```

**Response (400):**
```json
{
  "valid": false,
  "reason": "Coupon expired | Coupon not found | Coupon already used"
}
```

---

## Implementation Order

1. **Database:** Create `user_feedback` migration + RLS policies
2. **API:** POST `/api/feedback` (with auto-approval) + validation endpoint
3. **Frontend:** Feedback prompt modal (trigger logic + submission)
4. **Account Page:** Add "My Discount Codes" section
5. **Checkout:** Integrate coupon validation (extend existing)
6. **Admin Dashboard:** Build `/admin/feedback` page with filters + stats

---

## Edge Cases & Notes

- **Repeat submissions:** Users can submit multiple feedbacks (one per 3–5 module views). Each approved = new coupon.
- **Code collision:** If rare `FEEDBACK-XXXXXX` collision occurs, retry generation.
- **Module deletion:** Feedback stays in DB with module reference; admin sees "Deleted Module" gracefully.
- **Anonymous feedback quality:** Same auto-approval rules; anon users get success message but no code.
- **Device tracking:** If anon user later creates account, their device_id is now linked to user_id; can optionally show "Your past feedback" but not required for MVP.
- **Coupon usage limit:** Each code can only be used once (add `used_at` field or check count).
- **Testing:** Mock 3–5 module reads in tests to verify prompt triggers correctly.

---

## Success Metrics (Later)

- Feedback submission rate (% of users who submit)
- Quality approval rate (% of submissions that pass checks)
- Discount redemption rate (% of codes actually used at checkout)
- Avg rating trends (app vs module over time)
- Most common feedback themes (manual review for now)

---

## Timeline & Effort

- **Database + API:** 2–3 hours
- **Frontend prompt:** 2 hours
- **Account page section:** 1 hour
- **Checkout integration:** 1 hour
- **Admin dashboard:** 3–4 hours
- **Testing + QA:** 2 hours

**Total estimate:** 11–14 hours (doable in 1–2 dev sessions)

