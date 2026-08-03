import type { TCupGroup, TCupMatch } from "../types";

/**
 * Cup points formula.
 *
 *   +1 for participating (being in a cup group)
 *   +1 per GROUP-STAGE win
 *   placement bonus: 1st +7, 2nd +5, 3rd +3, 4th and below +0
 *
 * Knockout wins deliberately earn no per-win point — they pay out through the
 * placement bonus instead. This matters: on the first real cup Krešo won 4
 * group matches and finished 4th (5 points), while Damjan won 3 group matches
 * and finished 3rd (7 points). Counting knockout wins would break that order.
 */
export const CUP_PARTICIPATION_POINTS = 1;
export const CUP_POINTS_PER_GROUP_WIN = 1;
export const CUP_PLACEMENT_POINTS: Record<TCupPlacement, number> = {
  1: 7,
  2: 5,
  3: 3,
  4: 0,
};

export type TCupPlacement = 1 | 2 | 3 | 4;

export type TCupPointRow = {
  userId: string;
  cupGroupId: string;
  participation: number;
  groupWins: number;
  groupMatchesPlayed: number;
  gamesFor: number;
  gamesAgainst: number;
  gameDifference: number;
  /** null until the match that decides this placement has a winner. */
  placement: TCupPlacement | null;
  placementPoints: number;
  total: number;
};

export type TCupBracketOutcome = {
  first: string | null;
  second: string | null;
  third: string | null;
  fourth: string | null;
  isFinalDecided: boolean;
  isThirdPlaceDecided: boolean;
  placementByUserId: Record<string, TCupPlacement>;
};

/** True for every stage except the round-robin group phase. */
export function isKnockoutStage(stage: TCupMatch["stage"]): boolean {
  return stage !== "group";
}

/**
 * The authoritative winner of a single cup match.
 *
 * `winner_id` is always trusted first — it is the only thing that can express
 * a score-less knockout result or a tied group match decided by tie-break.
 * The score is a fallback for rows where a winner was somehow not recorded.
 */
export function resolveCupMatchWinnerId(match: TCupMatch): string | null {
  if (match.is_deleted) return null;
  if (match.winner_id) return match.winner_id;

  const one = match.player_one_games;
  const two = match.player_two_games;
  if (one === null || two === null) return null;
  if (one > two) return match.player_one_id;
  if (two > one) return match.player_two_id;
  return null;
}

/** The player of `match` who is not `userId`, or null if userId isn't in it. */
export function cupOpponentOf(match: TCupMatch, userId: string): string | null {
  if (match.player_one_id === userId) return match.player_two_id;
  if (match.player_two_id === userId) return match.player_one_id;
  return null;
}

/**
 * Placements derived from the knockout rows alone — no score required.
 *
 *   1st = final winner,       2nd = final loser
 *   3rd = third-place winner, 4th = third-place loser
 *
 * Semifinal rows are never consulted for placement; they only supply pairings.
 * A player stays unplaced (and so earns no bonus) until the match that decides
 * their placement has a winner, so points only ever grow as results land.
 */
export function deriveCupBracketOutcome(matches: TCupMatch[]): TCupBracketOutcome {
  const live = matches.filter((m) => !m.is_deleted);
  const final = live.find((m) => m.stage === "final");
  const thirdPlace = live.find((m) => m.stage === "third_place");

  const finalWinner = final ? resolveCupMatchWinnerId(final) : null;
  const thirdWinner = thirdPlace ? resolveCupMatchWinnerId(thirdPlace) : null;

  const first = finalWinner;
  const second = final && finalWinner ? cupOpponentOf(final, finalWinner) : null;
  const third = thirdWinner;
  const fourth =
    thirdPlace && thirdWinner ? cupOpponentOf(thirdPlace, thirdWinner) : null;

  const placementByUserId: Record<string, TCupPlacement> = {};
  const ordered: Array<[string | null, TCupPlacement]> = [
    [first, 1],
    [second, 2],
    [third, 3],
    [fourth, 4],
  ];
  for (const [userId, placement] of ordered) {
    // Best placement wins if bad data ever lists someone twice
    if (userId && placementByUserId[userId] === undefined) {
      placementByUserId[userId] = placement;
    }
  }

  return {
    first,
    second,
    third,
    fourth,
    isFinalDecided: finalWinner !== null,
    isThirdPlaceDecided: thirdWinner !== null,
    placementByUserId,
  };
}

/**
 * Points for every participant of one cup.
 *
 * Deleted rows are filtered here rather than trusted to the caller's query:
 * Rankings.tsx already demonstrates that query-level `is_deleted` filters get
 * forgotten, and a forgotten filter should degrade to "correct" rather than
 * "silently inflated".
 */
export function calculateCupPoints(
  groups: TCupGroup[],
  matches: TCupMatch[]
): Map<string, TCupPointRow> {
  const liveMatches = matches.filter((m) => !m.is_deleted);
  const groupMatches = liveMatches.filter((m) => m.stage === "group");
  const outcome = deriveCupBracketOutcome(liveMatches);

  const rows = new Map<string, TCupPointRow>();

  for (const group of groups) {
    if (group.is_deleted) continue;
    for (const member of group.members || []) {
      if (member.is_deleted) continue;
      if (rows.has(member.user_id)) continue;

      const mine = groupMatches.filter(
        (m) =>
          m.player_one_id === member.user_id || m.player_two_id === member.user_id
      );

      let groupWins = 0;
      let groupMatchesPlayed = 0;
      let gamesFor = 0;
      let gamesAgainst = 0;

      for (const match of mine) {
        const winnerId = resolveCupMatchWinnerId(match);
        if (winnerId) groupMatchesPlayed += 1;
        if (winnerId === member.user_id) groupWins += 1;

        // Knockout games are excluded entirely: those scores are optional and
        // played to a different target (6 vs 4), so mixing them into group
        // standings would make the game difference meaningless.
        const one = match.player_one_games;
        const two = match.player_two_games;
        if (one === null || two === null) continue;
        const isPlayerOne = match.player_one_id === member.user_id;
        gamesFor += isPlayerOne ? one : two;
        gamesAgainst += isPlayerOne ? two : one;
      }

      const placement = outcome.placementByUserId[member.user_id] ?? null;
      const placementPoints = placement ? CUP_PLACEMENT_POINTS[placement] : 0;

      rows.set(member.user_id, {
        userId: member.user_id,
        cupGroupId: group.id!,
        participation: CUP_PARTICIPATION_POINTS,
        groupWins,
        groupMatchesPlayed,
        gamesFor,
        gamesAgainst,
        gameDifference: gamesFor - gamesAgainst,
        placement,
        placementPoints,
        total:
          CUP_PARTICIPATION_POINTS +
          groupWins * CUP_POINTS_PER_GROUP_WIN +
          placementPoints,
      });
    }
  }

  return rows;
}

/** Flat userId -> total map, for the rankings page. */
export function calculateCupPointsByUserId(
  groups: TCupGroup[],
  matches: TCupMatch[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const row of calculateCupPoints(groups, matches).values()) {
    totals[row.userId] = row.total;
  }
  return totals;
}

/** Adds several cups' totals together. Missing users count as 0. */
export function sumCupPointsAcrossCups(
  maps: Array<Record<string, number>>
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const map of maps) {
    for (const [userId, points] of Object.entries(map)) {
      totals[userId] = (totals[userId] ?? 0) + points;
    }
  }
  return totals;
}

/**
 * Standings inside one cup group: group wins desc, then game difference,
 * then games won.
 */
export function cupGroupStandings(
  group: TCupGroup,
  matches: TCupMatch[]
): TCupPointRow[] {
  const all = calculateCupPoints([group], matches);
  return Array.from(all.values())
    .filter((row) => row.cupGroupId === group.id)
    .sort(
      (a, b) =>
        b.groupWins - a.groupWins ||
        b.gameDifference - a.gameDifference ||
        b.gamesFor - a.gamesFor
    );
}

/** True once the final has a winner. */
export function isCupFinished(matches: TCupMatch[]): boolean {
  return deriveCupBracketOutcome(matches).isFinalDecided;
}
