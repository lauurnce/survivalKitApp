-- Add semester (1 or 2) and kind (major / minor) to subjects
alter table subjects
  add column if not exists semester int  not null default 1,
  add column if not exists kind     text not null default 'major'
    check (kind in ('major', 'minor'));

-- Index for quick per-semester queries
create index if not exists idx_subjects_year_sem
  on subjects(year_id, semester, sort_order);
