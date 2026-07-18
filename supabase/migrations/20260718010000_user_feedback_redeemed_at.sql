-- Add atomic coupon redemption tracking to prevent reuse
-- Idempotent: safe to run against live DB or fresh one.

alter table user_feedback
add column if not exists redeemed_at timestamptz;

-- Index on redeemed_at for efficient queries of non-redeemed coupons
create index if not exists user_feedback_redeemed_at_idx
  on user_feedback (redeemed_at) where redeemed_at is null and coupon_code is not null;

-- Composite index for atomic lookup: coupon_code + redeemed_at
create index if not exists user_feedback_coupon_redeemed_idx
  on user_feedback (coupon_code, redeemed_at) where coupon_code is not null;
