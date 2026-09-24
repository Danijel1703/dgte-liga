-- ============================================================
-- DGTE Liga — Schema Migration 004 (sudionici kupa prije ždrijeba)
-- Run this in your Supabase SQL Editor
-- ============================================================
--
-- Players can be on a cup before they are dealt into groups. The draw
-- button reads this list and writes cup_group_member rows. Group membership
-- is still what earns the participation point.
-- ============================================================

CREATE TABLE IF NOT EXISTS cup_participant (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cup_id      uuid NOT NULL REFERENCES cup(id),
  user_id     text NOT NULL,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (cup_id, user_id)
);

CREATE INDEX IF NOT EXISTS cup_participant_cup_idx
  ON cup_participant (cup_id) WHERE is_deleted = false;

-- Match the other cup tables: the app uses the anon key with no RLS.
ALTER TABLE cup_participant DISABLE ROW LEVEL SECURITY;
