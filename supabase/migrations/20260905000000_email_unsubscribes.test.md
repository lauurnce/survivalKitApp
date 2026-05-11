<!-- supabase/migrations/20260905000000_email_unsubscribes.test.md -->
# email_unsubscribes

- Run the migration twice → second run is a no-op (no error).
- Insert a row for a user → `unsubscribed_at` defaults to now(), `source` to 'link'.
- Insert a second row for the same user_id → 23505 (primary key). The app
  upserts with `ignoreDuplicates`, so the first timestamp is kept.
- Insert with source 'bogus' → check constraint violation.
- `select` as anon and as authenticated → permission denied / zero rows
  (RLS on, no policies, grants revoked).
- Delete the referenced auth.users row → its email_unsubscribes row disappears
  (cascade).
- End to end: open an unsubscribe link (GET) → page renders, no row written;
  press the button (POST) → one row with source 'link'; a mail client
  one-click POST with body `List-Unsubscribe=One-Click` → source 'one_click'.
