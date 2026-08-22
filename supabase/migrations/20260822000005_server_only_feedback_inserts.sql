-- Feedback creation goes through /api/feedback, where identity, ratings,
-- quality approval, coupon eligibility, deduplication, and rate limits are
-- computed server-side. Direct inserts could otherwise choose privileged
-- coupon and approval columns themselves.

drop policy if exists "authenticated users insert own feedback"
  on public.user_feedback;
drop policy if exists "anonymous users insert feedback"
  on public.user_feedback;
