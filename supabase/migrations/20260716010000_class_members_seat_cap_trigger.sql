-- supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql
-- Closes the seat_cap race condition: app/api/class/join/route.ts does a
-- count-then-insert, which is inherently racy under concurrent requests
-- (two requests can both read count < seat_cap and both insert, overshooting
-- the cap). The application-level check stays in place for the common case
-- (fast, clean 409 without round-tripping through a failed insert), but this
-- trigger is the actual enforcement backstop.
--
-- Idempotent: safe to run against the live DB or a fresh one.

create or replace function enforce_class_members_seat_cap()
returns trigger as $$
declare
  cap int;
  current_count int;
begin
  -- Lock the parent classes row for the duration of this transaction so that
  -- two concurrent inserts for the same class_id serialize on this trigger
  -- instead of both reading a stale count. The second transaction blocks on
  -- this SELECT ... FOR UPDATE until the first commits (or rolls back), at
  -- which point it re-reads a count that already includes the first insert.
  select seat_cap into cap
  from classes
  where id = new.class_id
  for update;

  select count(*) into current_count
  from class_members
  where class_id = new.class_id;

  if current_count >= cap then
    raise exception 'class % is at seat_cap (%)', new.class_id, cap
      using errcode = 'P0001', hint = 'class_seat_cap_exceeded';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists class_members_seat_cap_trigger on class_members;
create trigger class_members_seat_cap_trigger
  before insert on class_members
  for each row
  execute function enforce_class_members_seat_cap();
