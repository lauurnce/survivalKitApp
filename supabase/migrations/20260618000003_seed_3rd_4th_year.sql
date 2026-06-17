insert into years (id, label, sort_order, coming_soon) values
  ('00000000-0000-0000-0000-000000000003', '3rd Year', 3, true),
  ('00000000-0000-0000-0000-000000000004', '4th Year', 4, true)
on conflict (id) do nothing;
