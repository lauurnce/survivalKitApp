-- ============================================================
-- Backfill seed: years 1–2 and the two subjects referenced by
-- 006 / 007 but never created by any migration in this repo.
--
-- Production was assembled by hand out of order, so these rows
-- already exist there with exactly these ids; ON CONFLICT (id)
-- DO NOTHING makes this migration a no-op against prod. On a
-- cold replay (CI's fresh postgres:16) they provide the FK
-- targets 006, 007 and 20260623000001 need.
-- ============================================================

insert into years (id, label, sort_order) values
  ('00000000-0000-0000-0000-000000000001', '1st Year', 1),
  ('00000000-0000-0000-0000-000000000002', '2nd Year', 2)
on conflict (id) do nothing;

-- Placeholder placement for cold replays only: prod keeps its own
-- year_id / semester / kind / sort_order because the id conflicts.
insert into subjects (id, year_id, semester, kind, title, slug, sort_order) values
  ('85eaf374-8001-43e1-81ec-b67b8c66466e',
   '00000000-0000-0000-0000-000000000002',
   1, 'major', 'Structured Programming (COBOL)',
   'structured-programming-cobol', 99),
  ('045d09d8-c0fb-441e-ad8f-52d7b5fe7e35',
   '00000000-0000-0000-0000-000000000002',
   1, 'major', 'World Literature',
   'world-literature', 99)
on conflict (id) do nothing;
