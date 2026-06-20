create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  device_id text not null,
  source text not null check (source in ('coming_soon', 'paywall')),
  willing_to_pay text check (willing_to_pay in ('yes', 'no', 'maybe')),
  needs_capstone boolean,
  device_type text not null check (device_type in ('mobile', 'desktop')),
  created_at timestamptz not null default now(),
  unique (email, source)
);

alter table public.waitlist enable row level security;

create policy "service role only" on public.waitlist
  using (false)
  with check (false);
