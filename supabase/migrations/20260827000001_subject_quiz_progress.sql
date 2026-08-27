-- ============================================================
-- Subject Quiz Progress
-- Tracks quiz attempts per subject (aggregating multiple modules)
-- ============================================================

create table if not exists subject_quiz_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject_id   uuid not null references subjects(id) on delete cascade,
  score        int not null,
  total_questions int not null,
  seed         bigint not null,
  completed_at timestamptz not null default now(),
  unique(user_id, subject_id, seed)
);

create table if not exists subject_quiz_answers (
  id            uuid primary key default gen_random_uuid(),
  progress_id   uuid not null references subject_quiz_progress(id) on delete cascade,
  question_index int not null,
  given         text not null,
  correct       boolean not null,
  module_id     uuid not null references modules(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- Indexes for fast lookups
create index if not exists idx_subject_quiz_progress_user
  on subject_quiz_progress(user_id, completed_at desc);

create index if not exists idx_subject_quiz_progress_subject
  on subject_quiz_progress(subject_id);

create index if not exists idx_subject_quiz_answers_progress
  on subject_quiz_answers(progress_id);

-- RLS: users can only see their own progress
alter table subject_quiz_progress enable row level security;
alter table subject_quiz_answers enable row level security;

create policy "user_select_own_subject_quiz_progress"
  on subject_quiz_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "user_insert_own_subject_quiz_progress"
  on subject_quiz_progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_select_own_subject_quiz_answers"
  on subject_quiz_answers for select to authenticated
  using (exists (
    select 1 from subject_quiz_progress p
    where p.id = subject_quiz_answers.progress_id
    and p.user_id = auth.uid()
  ));

create policy "user_insert_own_subject_quiz_answers"
  on subject_quiz_answers for insert to authenticated
  with check (exists (
    select 1 from subject_quiz_progress p
    where p.id = subject_quiz_answers.progress_id
    and p.user_id = auth.uid()
  ));

-- Service role bypasses RLS for admin operations