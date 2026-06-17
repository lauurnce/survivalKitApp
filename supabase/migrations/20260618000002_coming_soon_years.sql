alter table years
  add column if not exists coming_soon boolean not null default false;
