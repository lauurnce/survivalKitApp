-- Split World Literature "Study Guide" single module into 9 regional modules.
-- Subject: World Literature — 045d09d8-c0fb-441e-ad8f-52d7b5fe7e35
-- Already applied directly to Supabase on 2026-06-16.

DO $$
DECLARE
  m2 uuid; m3 uuid; m4 uuid; m5 uuid;
  m6 uuid; m7 uuid; m8 uuid; m9 uuid;
  subj_id  uuid := '045d09d8-c0fb-441e-ad8f-52d7b5fe7e35';
  orig_mod uuid := '39ce91b6-99dc-420b-a95a-6677555dec6f';
BEGIN
  UPDATE modules
  SET title = 'Introduction to World Literature',
      slug  = 'introduction-to-world-literature'
  WHERE id = orig_mod;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'European and Russian Literature', 'european-russian-literature', 2)
  RETURNING id INTO m2;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Anglo-American Literature', 'anglo-american-literature', 3)
  RETURNING id INTO m3;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'East Asian Literature', 'east-asian-literature', 4)
  RETURNING id INTO m4;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Latin American Literature', 'latin-american-literature', 5)
  RETURNING id INTO m5;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Middle Eastern Literature', 'middle-eastern-literature', 6)
  RETURNING id INTO m6;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'African Literature', 'african-literature', 7)
  RETURNING id INTO m7;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Southeast Asian Literature', 'southeast-asian-literature', 8)
  RETURNING id INTO m8;

  INSERT INTO modules (subject_id, title, slug, sort_order)
    VALUES (subj_id, 'Cross-Module Review', 'cross-module-review', 9)
  RETURNING id INTO m9;

  UPDATE sections SET sort_order = 1 WHERE heading = 'Introduction to World Literature' AND module_id = orig_mod;
  UPDATE sections SET sort_order = 2 WHERE heading = 'Activity: Reading World Literature Critically' AND module_id = orig_mod;

  UPDATE sections SET module_id = m2, sort_order = 1 WHERE heading = 'Literature from the Global North: European Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m2, sort_order = 2 WHERE heading = 'Russian Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m2, sort_order = 3 WHERE heading = 'Activity: Russian Literature Essay' AND module_id = orig_mod;

  UPDATE sections SET module_id = m3, sort_order = 1 WHERE heading = 'Anglo-American Literature: The Beat Generation' AND module_id = orig_mod;
  UPDATE sections SET module_id = m3, sort_order = 2 WHERE heading = 'Activity: Beat Literature Reflection' AND module_id = orig_mod;

  UPDATE sections SET module_id = m4, sort_order = 1 WHERE heading = 'East Asian Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m4, sort_order = 2 WHERE heading = 'Activity: Translation and Global Readership Essay' AND module_id = orig_mod;

  UPDATE sections SET module_id = m5, sort_order = 1 WHERE heading = 'Literature from the Global South: Latin American Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m5, sort_order = 2 WHERE heading = 'Activity: Latin American Literature Analysis' AND module_id = orig_mod;

  UPDATE sections SET module_id = m6, sort_order = 1 WHERE heading = 'Middle Eastern Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m6, sort_order = 2 WHERE heading = 'Activity: Fiction, History, and Form' AND module_id = orig_mod;

  UPDATE sections SET module_id = m7, sort_order = 1 WHERE heading = 'African Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m7, sort_order = 2 WHERE heading = 'Activity: African Literature and Social Justice' AND module_id = orig_mod;

  UPDATE sections SET module_id = m8, sort_order = 1 WHERE heading = 'Southeast Asian Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m8, sort_order = 2 WHERE heading = 'Activity: Southeast Asian Literature Analysis' AND module_id = orig_mod;

  UPDATE sections SET module_id = m9, sort_order = 1 WHERE heading = 'Cross-Module Review: Major Themes in World Literature' AND module_id = orig_mod;
  UPDATE sections SET module_id = m9, sort_order = 2 WHERE heading = 'Final Integrative Activity' AND module_id = orig_mod;
END $$;
