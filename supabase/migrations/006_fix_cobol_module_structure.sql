-- Split COBOL "Study Guide" single module into 5 lesson modules.
-- Subject: Structured Programming (COBOL) — 85eaf374-8001-43e1-81ec-b67b8c66466e
-- Already applied directly to Supabase on 2026-06-16.

DO $$
DECLARE
  m2 uuid; m3 uuid; m4 uuid; m5 uuid;
  subj_id  uuid := '85eaf374-8001-43e1-81ec-b67b8c66466e';
  orig_mod uuid := 'ca0001b7-e250-4180-b925-62d66ecb38cf';
BEGIN
  UPDATE modules
  SET title = 'COBOL Overview, Program Structure, and Coding Form',
      slug  = 'cobol-overview-program-structure'
  WHERE id = orig_mod;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'COBOL Character Set and COBOL Words', 'cobol-character-set', 2)
  RETURNING id INTO m2;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Identification Division and Environment Division', 'identification-environment-division', 3)
  RETURNING id INTO m3;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Data Division, Data Fields, and PICTURE Clauses', 'data-division-picture-clauses', 4)
  RETURNING id INTO m4;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Procedure Division and COBOL Statements', 'procedure-division-statements', 5)
  RETURNING id INTO m5;

  UPDATE sections SET sort_order = 1 WHERE heading LIKE 'Lesson 1:%' AND module_id = orig_mod;
  UPDATE sections SET sort_order = 2 WHERE heading = 'Activity 1: COBOL Basics Review' AND module_id = orig_mod;

  UPDATE sections SET module_id = m2, sort_order = 1 WHERE heading LIKE 'Lesson 2:%' AND module_id = orig_mod;
  UPDATE sections SET module_id = m2, sort_order = 2 WHERE heading = 'Activity 2: Validate COBOL Names' AND module_id = orig_mod;
  UPDATE sections SET module_id = m2, sort_order = 3 WHERE heading = 'Activity 3: Average Grade Program Skeleton' AND module_id = orig_mod;

  UPDATE sections SET module_id = m3, sort_order = 1 WHERE heading LIKE 'Lesson 3:%' AND module_id = orig_mod;
  UPDATE sections SET module_id = m3, sort_order = 2 WHERE heading = 'Activity 4: Write Identification and Environment Snippets' AND module_id = orig_mod;

  UPDATE sections SET module_id = m4, sort_order = 1 WHERE heading LIKE 'Lesson 4:%' AND module_id = orig_mod;
  UPDATE sections SET module_id = m4, sort_order = 2 WHERE heading = 'Activity 5: Choose the Correct PIC Clause' AND module_id = orig_mod;
  UPDATE sections SET module_id = m4, sort_order = 3 WHERE heading = 'Activity 6: File and Working-Storage Declarations' AND module_id = orig_mod;

  UPDATE sections SET module_id = m5, sort_order = 1 WHERE heading LIKE 'Lesson 5:%' AND module_id = orig_mod;
  UPDATE sections SET module_id = m5, sort_order = 2 WHERE heading = 'Activity 7: File Processing Pattern' AND module_id = orig_mod;
  UPDATE sections SET module_id = m5, sort_order = 3 WHERE heading = 'Activity 8: Arithmetic Practice' AND module_id = orig_mod;
  UPDATE sections SET module_id = m5, sort_order = 4 WHERE heading = 'Activity 9: Grade Input Using ACCEPT and DISPLAY' AND module_id = orig_mod;
  UPDATE sections SET module_id = m5, sort_order = 5 WHERE heading = 'Activity 10: Payroll Exercise' AND module_id = orig_mod;

  DELETE FROM sections WHERE heading = 'Review Notes and Items Flagged for Human Review' AND module_id = orig_mod;
END $$;
