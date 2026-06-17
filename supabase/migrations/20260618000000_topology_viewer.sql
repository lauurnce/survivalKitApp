-- supabase/migrations/20260618000000_topology_viewer.sql
alter table sections add column if not exists topology_data jsonb;
