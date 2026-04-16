-- 014_parent_connections_unique.sql
-- Fix: /api/invite-parent upserts on student_user_id, but the original
-- migration (001) didn't add a unique constraint there, so the upsert
-- throws "no unique or exclusion constraint matching the ON CONFLICT
-- specification". This enforces one-parent-per-student at the DB level,
-- matching the code's intent.

ALTER TABLE parent_connections
  ADD CONSTRAINT parent_connections_student_user_id_key
  UNIQUE (student_user_id);
