-- =============================================================================
-- Soft-delete duplicate matches for a month (keeps finished matches intact)
-- Run in: Supabase Dashboard → SQL Editor
-- =============================================================================
--
-- How to use:
--   1. Set the month window below (defaults to July 2026).
--   2. Run STEP 1 (preview) and check the rows.
--   3. Run STEP 2 (update) only if the preview looks correct.
--
-- Rules:
--   - Same group + same unordered player pair = duplicate
--   - NEVER soft-deletes matches that are played / surrendered / have a winner
--     / have any games entered in sets
--   - If all copies are waiting: keeps the oldest, soft-deletes the rest
--   - If one copy has a result: keeps it, soft-deletes empty duplicates
--   - If multiple copies have results: keeps all of them (manual review)
-- =============================================================================

-- >>> Set month here <<<
-- July 2026:
--   start: 2026-07-01
--   end:   2026-08-01  (exclusive)

-- -----------------------------------------------------------------------------
-- STEP 1 — PREVIEW (safe, read-only)
-- -----------------------------------------------------------------------------
WITH month_matches AS (
  SELECT *
  FROM match
  WHERE COALESCE(is_deleted, false) = false
    AND created_at >= TIMESTAMPTZ '2026-07-01'
    AND created_at <  TIMESTAMPTZ '2026-08-01'
),
annotated AS (
  SELECT
    m.*,
    (
      m.status IN ('played', 'surrendered')
      OR m.winner_id IS NOT NULL
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(m.sets, '[]'::jsonb)) s
        WHERE COALESCE((s->>'player_one_games')::int, 0) > 0
           OR COALESCE((s->>'player_two_games')::int, 0) > 0
      )
    ) AS has_result
  FROM month_matches m
),
ranked AS (
  SELECT
    a.*,
    ROW_NUMBER() OVER (
      PARTITION BY
        a.group_id,
        LEAST(a.player_one_id, a.player_two_id),
        GREATEST(a.player_one_id, a.player_two_id)
      ORDER BY
        CASE WHEN a.has_result THEN 0 ELSE 1 END,
        a.created_at ASC NULLS LAST,
        a.id ASC
    ) AS keep_rank,
    COUNT(*) OVER (
      PARTITION BY
        a.group_id,
        LEAST(a.player_one_id, a.player_two_id),
        GREATEST(a.player_one_id, a.player_two_id)
    ) AS pair_count
  FROM annotated a
)
SELECT
  id,
  group_id,
  player_one_id,
  player_two_id,
  round,
  status,
  winner_id,
  has_result,
  keep_rank,
  pair_count,
  created_at,
  'WILL SOFT-DELETE' AS action
FROM ranked
WHERE pair_count > 1
  AND keep_rank > 1
  AND has_result = false
ORDER BY group_id, player_one_id, player_two_id, created_at;


-- -----------------------------------------------------------------------------
-- STEP 2 — APPLY (soft-delete). Uncomment and run after preview looks good.
-- -----------------------------------------------------------------------------
/*
WITH month_matches AS (
  SELECT *
  FROM match
  WHERE COALESCE(is_deleted, false) = false
    AND created_at >= TIMESTAMPTZ '2026-07-01'
    AND created_at <  TIMESTAMPTZ '2026-08-01'
),
annotated AS (
  SELECT
    m.*,
    (
      m.status IN ('played', 'surrendered')
      OR m.winner_id IS NOT NULL
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(m.sets, '[]'::jsonb)) s
        WHERE COALESCE((s->>'player_one_games')::int, 0) > 0
           OR COALESCE((s->>'player_two_games')::int, 0) > 0
      )
    ) AS has_result
  FROM month_matches m
),
ranked AS (
  SELECT
    a.*,
    ROW_NUMBER() OVER (
      PARTITION BY
        a.group_id,
        LEAST(a.player_one_id, a.player_two_id),
        GREATEST(a.player_one_id, a.player_two_id)
      ORDER BY
        CASE WHEN a.has_result THEN 0 ELSE 1 END,
        a.created_at ASC NULLS LAST,
        a.id ASC
    ) AS keep_rank,
    COUNT(*) OVER (
      PARTITION BY
        a.group_id,
        LEAST(a.player_one_id, a.player_two_id),
        GREATEST(a.player_one_id, a.player_two_id)
    ) AS pair_count
  FROM annotated a
),
to_delete AS (
  SELECT id
  FROM ranked
  WHERE pair_count > 1
    AND keep_rank > 1
    AND has_result = false
)
UPDATE match
SET is_deleted = true
WHERE id IN (SELECT id FROM to_delete)
RETURNING id, group_id, player_one_id, player_two_id, status, round, created_at;
*/
