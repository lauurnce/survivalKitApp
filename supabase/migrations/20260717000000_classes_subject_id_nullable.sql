-- supabase/migrations/20260717000000_classes_subject_id_nullable.sql
-- Allows a class purchase to cover "all subjects for this year" (subject_id
-- IS NULL), mirroring the existing subscriptions.subject_id convention where
-- NULL already means "whole year." Idempotent: dropping a NOT NULL
-- constraint that's already dropped is a no-op in Postgres.
alter table classes alter column subject_id drop not null;
