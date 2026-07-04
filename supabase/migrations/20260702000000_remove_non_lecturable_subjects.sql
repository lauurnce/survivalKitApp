-- ============================================================
-- Remove non-lecturable subjects
-- ============================================================
-- IT Electives 1-4, Capstone Project 1/2, and Practicum are
-- school-specific electives / project / OJT requirements, not
-- standard lecturable curriculum. They carry no modules,
-- subscriptions, or payments and are being removed from the app.
--
-- FK behavior on delete:
--   modules.subject_id       -> CASCADE   (none exist)
--   subscriptions.subject_id -> CASCADE   (none exist)
--   payments.subject_id      -> NO ACTION (none exist)
--   events.subject_id        -> SET NULL  (analytics rows kept,
--                                          subject_id nulled)
--
-- Deleted by live id (slugs diverged between repo seeds and the
-- live DB — e.g. capstone-project vs capstone-project-1/2).
-- ============================================================

DELETE FROM subjects WHERE id IN (
  '30000000-0003-0001-0001-000000000004', -- IT Elective 1
  '30000000-0003-0002-0001-000000000005', -- IT Elective 2
  '40000000-0004-0001-0001-000000000004', -- IT Elective 3
  '40000000-0004-0001-0001-000000000005', -- IT Elective 4
  'd5860b96-a17c-4883-a407-b6e576fa3542', -- Capstone Project 1
  '40000000-0004-0001-0001-000000000006', -- Capstone Project 2
  'a6c0d68f-7265-4231-a9c4-b57e4b1714fc'  -- Practicum
);
