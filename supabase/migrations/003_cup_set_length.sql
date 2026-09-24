-- ============================================================
-- DGTE Liga — Schema Migration 003 (duljina seta na kupu)
-- Run this in your Supabase SQL Editor
-- ============================================================
--
-- How many games a cup set is played to. The first cup was 4 in the groups
-- and 6 in the playoff; those stay the column defaults so existing rows do
-- not change. Newer cups set both (often 6 and 6) from the create form.
-- A level score at that number is a tie-break — the app stores the winner
-- explicitly, same as a 4:4 group match on the first cup.
-- ============================================================

ALTER TABLE cup
  ADD COLUMN IF NOT EXISTS group_games integer NOT NULL DEFAULT 4
    CHECK (group_games BETWEEN 1 AND 15),
  ADD COLUMN IF NOT EXISTS knockout_games integer NOT NULL DEFAULT 6
    CHECK (knockout_games BETWEEN 1 AND 15);
