-- Profiles: user-editable personal info shown on the My Account page.
-- Applied to live 2026-07-06 (migration name: profiles).
-- Pathway and gender lists must stay in sync with lib/profile.ts.

create table if not exists profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name  text not null check (char_length(last_name) between 1 and 60),
  age        int check (age between 13 and 100),
  gender     text check (gender in ('Male','Female','Non-binary','Prefer not to say')),
  university text check (char_length(university) <= 120),
  major      text check (char_length(major) <= 120),
  pathways   text[] not null default '{}' check (
    pathways <@ array[
      'Data',
      'AI / Machine Learning',
      'UI/UX Design',
      'Frontend',
      'Backend',
      'Full Stack',
      'Cybersecurity',
      'Networking',
      'Cloud Computing',
      'DevOps',
      'Mobile Development',
      'Game Development',
      'QA / Testing',
      'Database Administration',
      'IT Support',
      'Tech Entrepreneurship'
    ]::text[]
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "user reads own profile" on profiles;
create policy "user reads own profile" on profiles
  for select using (user_id = auth.uid());

drop policy if exists "user inserts own profile" on profiles;
create policy "user inserts own profile" on profiles
  for insert with check (user_id = auth.uid());

drop policy if exists "user updates own profile" on profiles;
create policy "user updates own profile" on profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
