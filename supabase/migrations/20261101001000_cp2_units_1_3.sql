-- Computer Programming 2, Lessons 1-3: Arrays in Depth (the old Unit 1,
-- refocused), Strings and Character Arrays, and Pointers.
--
-- Mirrors the repo source of truth onto production:
--   supabase/seeds/cp2_modules_sections.sql   Lesson 1
--   supabase/seeds/cp2_units_2_3.sql          Lessons 2 and 3
--   supabase/seeds/cp2_exam_prep_module.sql   Exam Prep sort order
--
-- 1. Modules: Unit 1 is retitled "Lesson 1: Arrays in Depth"; Lessons 2 and
--    3 are new modules with fixed ids; Exam Prep moves to sort_order 99 so it
--    stays last after every numbered lesson.
-- 2. Lesson 1: the 11 original Unit 1 rows are rewritten in place under their
--    production ids (read 2026-10-31), so no id changes and nothing is
--    deleted, plus one new Key Takeaways row.
-- 3-4. Lessons 2 and 3: new rows with fixed ids.
--
-- Every section is upserted by id, so a second run changes nothing.
--
-- Gating: notes, Key Takeaways and Try It are kind = 'content' (free to every
-- reader). Practice Exercises, Worked Exam Solutions and Code Lab, plus
-- Lesson 1's extra Output Tracing Drills, are kind = 'activity' (reviewers).
-- Lesson 1 is still the first module, so its four reviewers stay the free
-- sample (lib/freeSample.ts) and the reviewers of Lessons 2-3 are paid.
--
-- Deploy the app first or together: the bodies reference
-- /diagrams/cp2/lesson-N-*.svg, which ship in public/ with this branch.
--
-- Not applied by this commit; see the .test.md for the run book.

-- 1. Modules -------------------------------------------------------------

insert into public.modules (id, subject_id, title, slug, sort_order)
values
  ('a3000001-0001-0002-0001-000000000001', '10000000-0001-0002-0001-000000000001', 'Lesson 1: Arrays in Depth', 'lesson-1-arrays-in-depth', 1),
  ('a3000001-0001-0002-0001-000000000002', '10000000-0001-0002-0001-000000000001', 'Lesson 2: Strings and Character Arrays', 'lesson-2-strings-and-character-arrays', 2),
  ('a3000001-0001-0002-0001-000000000003', '10000000-0001-0002-0001-000000000001', 'Lesson 3: Pointers', 'lesson-3-pointers', 3)
on conflict (id) do update set
  title      = excluded.title,
  slug       = excluded.slug,
  sort_order = excluded.sort_order
where public.modules.subject_id = excluded.subject_id;

update public.modules
set sort_order = 99
where id = 'a3000001-0001-0002-0001-0000000000e1'
  and subject_id = '10000000-0001-0002-0001-000000000001'
  and sort_order is distinct from 99;
