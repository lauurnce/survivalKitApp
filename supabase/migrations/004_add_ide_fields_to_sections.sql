-- Attach an interactive playground to a section.
-- ide_language NULL  => plain content section (current behaviour)
-- ide_language set   => render a Playground with the given language + starter code
alter table sections add column if not exists ide_language text
  check (ide_language in ('python', 'sql', 'java', 'c'));
alter table sections add column if not exists starter_code text;
