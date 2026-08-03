-- ============================================================
-- DGTE Liga — Schema Migration 002 (Kup)
-- Run this in your Supabase SQL Editor
-- ============================================================
--
-- Cups are stored in their own tables rather than reusing group/match,
-- because Rankings.tsx selects `match` with no filters at all and
-- Groups.tsx / Matches.tsx / MatchHistory.tsx are barely filtered — a
-- discriminator column would silently fold cup results into league points.
--
-- Cup matches also have a genuinely different shape: a single set (not
-- 2 + tie-break), a different game target per stage (4 in groups, 6 in
-- knockout), an OPTIONAL score, and a bracket stage.
-- ============================================================

-- Table: cup
-- One row per cup event (a one-off tournament).
CREATE TABLE IF NOT EXISTS cup (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  played_on   date,
  status      text NOT NULL DEFAULT 'group_stage'
                CHECK (status IN ('group_stage', 'knockout', 'finished')),
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Table: cup_group
-- A "Skupina" inside one cup (Skupina 1, Skupina 2, ...).
CREATE TABLE IF NOT EXISTS cup_group (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cup_id      uuid NOT NULL REFERENCES cup(id),
  name        text NOT NULL,
  color       text NOT NULL DEFAULT 'hsl(210, 65%, 45%)',
  sort_order  integer NOT NULL DEFAULT 10,
  is_deleted  boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Table: cup_group_member
-- Membership in a cup_group IS participation — this is what earns the
-- +1 participation point. There is deliberately no separate roster table:
-- a participant with no group is a meaningless state in this format.
CREATE TABLE IF NOT EXISTS cup_group_member (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cup_group_id  uuid NOT NULL REFERENCES cup_group(id),
  user_id       text NOT NULL,
  is_deleted    boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  -- Stops a double roster entry from double-counting the participation point
  UNIQUE (cup_group_id, user_id)
);

-- Table: cup_match
-- Group-stage AND knockout matches. `stage` is the discriminator.
--
-- player_one_games / player_two_games are NULLABLE: NULL means "no score
-- recorded", which is a legal state for knockout matches (the admin may
-- know only who won). This is why flat columns are used instead of the
-- league's `sets` jsonb — with an array, "no score" and "0-0" would be
-- indistinguishable.
--
-- winner_id is explicit and AUTHORITATIVE, never derived from the score.
-- That is what makes both a score-less final and a tied group match
-- decided by tie-break representable.
CREATE TABLE IF NOT EXISTS cup_match (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cup_id            uuid NOT NULL REFERENCES cup(id),
  cup_group_id      uuid REFERENCES cup_group(id),   -- NULL for knockout
  stage             text NOT NULL
                      CHECK (stage IN ('group', 'semifinal', 'final', 'third_place')),
  round             integer,   -- round-robin round number, NULL for knockout
  slot              integer,   -- 1|2 for semifinals, NULL otherwise
  player_one_id     text,      -- NULL = a knockout slot still to be filled
  player_two_id     text,
  player_one_games  integer,   -- NULL = no score recorded
  player_two_games  integer,
  winner_id         text,
  status            text NOT NULL DEFAULT 'waiting'
                      CHECK (status IN ('waiting', 'played', 'surrendered')),
  is_surrender      boolean NOT NULL DEFAULT false,
  is_deleted        boolean NOT NULL DEFAULT false,
  created_at        timestamptz DEFAULT now(),

  CONSTRAINT cup_match_distinct_players CHECK (
    player_one_id IS NULL OR player_two_id IS NULL OR player_one_id <> player_two_id
  ),
  -- Prevents a winner who never played the match, which would silently mint points
  CONSTRAINT cup_match_winner_is_a_player CHECK (
    winner_id IS NULL OR winner_id = player_one_id OR winner_id = player_two_id
  ),
  -- Group matches belong to a cup_group; knockout matches never do
  CONSTRAINT cup_match_group_stage_shape CHECK (
    (stage = 'group') = (cup_group_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS cup_group_cup_idx
  ON cup_group (cup_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS cup_group_member_group_idx
  ON cup_group_member (cup_group_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS cup_match_cup_idx
  ON cup_match (cup_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS cup_match_cup_group_idx
  ON cup_match (cup_group_id) WHERE is_deleted = false;

-- One live fixture per unordered player pair per cup group. Prevents the
-- duplicate-schedule problem that scripts/dedupe-july-2026.sql exists to
-- clean up for the league.
CREATE UNIQUE INDEX IF NOT EXISTS cup_match_group_pair_uq
  ON cup_match (
    cup_group_id,
    LEAST(player_one_id, player_two_id),
    GREATEST(player_one_id, player_two_id)
  )
  WHERE is_deleted = false
    AND stage = 'group'
    AND player_one_id IS NOT NULL
    AND player_two_id IS NOT NULL;

-- At most one live final and one live 3rd-place match per cup. This is what
-- makes placement derivation deterministic — with two final rows, placement
-- would depend on row order.
CREATE UNIQUE INDEX IF NOT EXISTS cup_match_single_final_uq
  ON cup_match (cup_id) WHERE is_deleted = false AND stage = 'final';
CREATE UNIQUE INDEX IF NOT EXISTS cup_match_single_third_uq
  ON cup_match (cup_id) WHERE is_deleted = false AND stage = 'third_place';

-- Semifinal slots are unique per cup
CREATE UNIQUE INDEX IF NOT EXISTS cup_match_slot_uq
  ON cup_match (cup_id, stage, slot)
  WHERE is_deleted = false AND slot IS NOT NULL;

-- ============================================================
-- NOTE: no FK from *.user_id -> "user"(user_id), matching membership_payment
-- in 001 (the core tables were created by hand in the dashboard, so the PK
-- type is not guaranteed). If "user".user_id is a text PRIMARY KEY, add:
--   ALTER TABLE cup_group_member
--     ADD CONSTRAINT cup_group_member_user_fk
--     FOREIGN KEY (user_id) REFERENCES "user"(user_id);
--
-- NOTE: 001 enables no RLS policies. Verify in the dashboard that these four
-- tables end up with the same read/write posture as `match`. If `match` has
-- RLS disabled and these default to enabled, every cup query silently
-- returns [] — check this before debugging the app code.
-- ============================================================
