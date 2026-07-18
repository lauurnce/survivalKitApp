-- One feedback per user per module (authenticated rows), one per device per
-- module (anonymous rows). Enforced in the DB so no API race can farm coupons.
-- Idempotent: safe to run against live DB or fresh one.

-- Pre-dedupe any rows inserted before the constraint existed: keep the
-- earliest submission (its coupon may already be redeemed), drop later ones.
delete from user_feedback a
using user_feedback b
where a.user_id is not null and b.user_id is not null
  and a.user_id = b.user_id
  and a.module_id = b.module_id
  and (a.created_at > b.created_at
       or (a.created_at = b.created_at and a.id > b.id));

delete from user_feedback a
using user_feedback b
where a.user_id is null and b.user_id is null
  and a.device_id = b.device_id
  and a.module_id = b.module_id
  and (a.created_at > b.created_at
       or (a.created_at = b.created_at and a.id > b.id));

create unique index if not exists user_feedback_user_module_uniq
  on user_feedback (user_id, module_id) where user_id is not null;

create unique index if not exists user_feedback_device_module_anon_uniq
  on user_feedback (device_id, module_id) where user_id is null;
