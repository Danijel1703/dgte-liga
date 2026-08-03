import type { TMatch } from "../types";

export type DedupeCandidate = Pick<
  TMatch,
  | "id"
  | "group_id"
  | "player_one_id"
  | "player_two_id"
  | "status"
  | "winner_id"
  | "sets"
  | "created_at"
  | "round"
>;

export type DedupeResult = {
  idsToDelete: string[];
  duplicatePairCount: number;
  skippedAmbiguous: number;
};

function pairKey(match: DedupeCandidate): string {
  const a = match.player_one_id < match.player_two_id ? match.player_one_id : match.player_two_id;
  const b = match.player_one_id < match.player_two_id ? match.player_two_id : match.player_one_id;
  return `${match.group_id}|${a}|${b}`;
}

function hasResult(match: DedupeCandidate): boolean {
  if (match.status === "played" || match.status === "surrendered") return true;
  if (match.winner_id) return true;
  return (match.sets || []).some((s) => s.player_one_games > 0 || s.player_two_games > 0);
}

function createdAtMs(match: DedupeCandidate): number {
  return match.created_at ? new Date(match.created_at).getTime() : 0;
}

/**
 * For each unordered player pair in a group, keep one match and mark extras for soft-delete.
 * Never deletes matches that already have a result. If multiple copies have results, keeps all of them.
 */
export function findDuplicateMatchIdsToDelete(matches: DedupeCandidate[]): DedupeResult {
  const byPair = new Map<string, DedupeCandidate[]>();

  for (const match of matches) {
    if (!match.id) continue;
    const key = pairKey(match);
    const list = byPair.get(key);
    if (list) list.push(match);
    else byPair.set(key, [match]);
  }

  const idsToDelete: string[] = [];
  let duplicatePairCount = 0;
  let skippedAmbiguous = 0;

  for (const group of byPair.values()) {
    if (group.length < 2) continue;
    duplicatePairCount++;

    const withResult = group.filter(hasResult);
    const waiting = group.filter((m) => !hasResult(m));

    if (withResult.length >= 1) {
      // Keep every played/surrendered copy; only remove empty duplicates
      for (const m of waiting) {
        if (m.id) idsToDelete.push(m.id);
      }
      if (withResult.length > 1) skippedAmbiguous++;
      continue;
    }

    // All waiting: keep the oldest (first generation), delete the rest
    const sorted = [...waiting].sort((a, b) => createdAtMs(a) - createdAtMs(b));
    for (const m of sorted.slice(1)) {
      if (m.id) idsToDelete.push(m.id);
    }
  }

  return { idsToDelete, duplicatePairCount, skippedAmbiguous };
}

/** Exported for tests / UI labels */
export function matchHasResult(match: DedupeCandidate): boolean {
  return hasResult(match);
}
