-- Per-module quiz progress tracking
-- Records when a user completes a quiz for a specific module

create table if not exists module_quiz_progress (
  device_id         text        not null,
  module_id         uuid        not null references modules(id) on delete cascade,
  completed_at      timestamptz not null default now(),
  score             int         not null,         -- correct answers count
  total_questions   int         not null,         -- total questions in that quiz
  seed              bigint      not null,         -- quiz seed for reproducibility
  primary key (device_id, module_id)
);

-- Fast lookup of all completed quizzes for a device
create index if not exists module_quiz_progress_device_idx
  on module_quiz_progress (device_id);

-- Optional: track individual question answers for detailed review
create table if not exists module_quiz_answers (
  device_id      text        not null,
  module_id      uuid        not null references modules(id) on delete cascade,
  question_idx   int         not null,           -- index in the quiz (0-based)
  given          text        not null,           -- user's answer
  correct        boolean     not null,           -- was it correct?
  answered_at    timestamptz not null default now(),
  primary key (device_id, module_id, question_idx)
);

create index if not exists module_quiz_answers_device_idx
  on module_quiz_answers (device_id);

alter table module_quiz_progress enable row level security;
alter table module_quiz_answers enable row level security;

-- Service role bypasses RLS (used by server-side API routes)
-- No anon policies: reads/writes go through service-role server client