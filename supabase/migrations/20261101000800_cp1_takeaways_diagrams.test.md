# Verification: CP1 Key Takeaways, diagrams and Try It order

**Not yet applied.** Apply by hand in the Supabase Studio SQL editor (or via
the Supabase connector), as `postgres`, like every other migration in this
repo. Do not tick a box until you have run the query and read real output.

Deploy the app first or together: the bodies reference
`/diagrams/cp1/lesson-N-*.svg`, which ship in `public/` with this branch. If
the SQL lands before the deploy, Lessons 1-6 show a broken image for up to the
deploy time (the reader caches sections for 60 seconds).

## Step 0 — before: the rows this migration expects

```sql
select m.sort_order as lesson, s.kind, s.sort_order, s.heading,
       s.body_md like '%/diagrams/cp1/%' as has_diagram
from sections s join modules m on m.id = s.module_id
where m.subject_id = '10000000-0001-0001-0001-000000000001' and m.sort_order between 1 and 6
order by 1, 3;
```

Expect 47 rows, no `Key Takeaways`, `has_diagram` false everywhere, and every
`Try It:` row (Lessons 2-6) at 999. If a row this migration keys on is
missing, the matching statement updates nothing: check step 2's counts.

Result: ☐

## Step 1 — apply

Run `20261101000800_cp1_takeaways_diagrams.sql` as one script.

Result: ☐ not yet run — date applied: __________

## Step 2 — six takeaways, six diagrams, the new order

```sql
select m.sort_order as lesson, s.sort_order, s.kind, s.heading,
       (regexp_match(s.body_md, '/diagrams/cp1/[a-z0-9-]+\.svg'))[1] as diagram
from sections s join modules m on m.id = s.module_id
where m.subject_id = '10000000-0001-0001-0001-000000000001' and m.sort_order between 1 and 6
order by 1, 2;
```

Expect 53 rows. In every lesson: the notes (content), then `Key Takeaways`
(content), then `Try It:` (content, Lessons 2-6), then Practice Exercises,
Worked Exam Solutions and Code Lab (activity), with no repeated
`sort_order` inside a lesson. Exactly one row per lesson has a `diagram`:
Program Logic Formulation, The Compilation Process, Standard Input: scanf(),
Loop Structures, What Is an Array?, Call by Value vs. Call by Reference.

Result: ☐

## Step 3 — gating did not move

```sql
select m.sort_order as lesson, s.kind, count(*)
from sections s join modules m on m.id = s.module_id
where m.subject_id = '10000000-0001-0001-0001-000000000001'
group by 1, 2 order by 1, 2;
```

Expect `activity = 3` for Lessons 1-7 (unchanged) and `content` one higher
than step 0 for Lessons 1-6 only. The free sample is still all of Lesson 1's
reviewers: open Lesson 1 signed out and confirm its three reviewers are
readable, then Lesson 2 and confirm its reviewers are locked and Try It sits
above them.

Result: ☐

## Step 4 — idempotent

Run the migration again, then step 2. Expect identical output: no second
image in any body, no extra rows.

Result: ☐

## Step 5 — it renders

Open Lessons 1-6 on a phone width (360px) in the light and the dark theme.
Each diagram fits the column with no sideways scroll, every label is
readable, and the Key Takeaways list sits under the notes.

Result: ☐

## Rollback

```sql
delete from sections where id in (
  'a1000001-0001-0001-0002-000000000001', 'a1000001-0001-0001-0002-000000000002',
  'a1000001-0001-0001-0002-000000000003', 'a1000001-0001-0001-0002-000000000004',
  'a1000001-0001-0001-0002-000000000005', 'a1000001-0001-0001-0002-000000000006');
update sections
set body_md = regexp_replace(body_md, '\n[^\n]*\n\n!\[[^\n]*\]\(/diagrams/cp1/[a-z0-9-]+\.svg\)\n$', '')
where body_md like '%/diagrams/cp1/%';
```

Then restore the order: in each of Lessons 1-6 put the reviewers straight
after the notes and set each `Try It:` row back to 999.
