-- Idempotency guard for the PayMongo webhook: each link is single-use, so a
-- replayed `link.payment.paid` event carries an already-seen paymongo_link_id.
-- A unique index makes the "skip if already processed" check race-safe.
create unique index if not exists subscriptions_paymongo_link_id_idx
  on subscriptions (paymongo_link_id);
