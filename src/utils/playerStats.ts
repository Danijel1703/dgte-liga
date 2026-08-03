import type { TMatch, TSet, TUser } from "../types";

/**
 * League statistics, derived from `match` rows.
 *
 * Two data facts drive the whole design, both verified against the live
 * database:
 *
 * 1. About a fifth of decided matches are surrenders, and those rows carry NO
 *    score at all (every set is 0-0). They count toward wins and losses but
 *    must be excluded from every set-, game- and tie-break-based metric, or
 *    all those rates get silently diluted.
 * 2. Set 3 is the tie-break, played to 10 rather than 6. It decides the match
 *    but is excluded from game (gem) totals, matching the league's existing
 *    convention in Rankings.tsx and Groups.tsx.
 *
 * Cup matches are deliberately not handled here: a cup match is a single set to
 * 4 (6 in the knockout), so pooling it with league sets would make every
 * set-based number meaningless. See cupPoints.ts.
 */

/** Set 3 is the tie-break — it decides the match but never counts toward gems. */
export const TIEBREAK_SET_NUMBER = 3;
export const LEAGUE_POINTS_PER_WIN = 3;

/** Minimum meetings before a head-to-head record is treated as meaningful. */
export const MIN_MEETINGS_FOR_RIVALRY = 2;

export type TFormResult = "W" | "L";

export type TPlayerStats = {
  userId: string;
  // ---- match level (includes surrenders) ----
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  surrendersGiven: number;
  surrendersReceived: number;
  /** Most recent results first. */
  form: TFormResult[];
  longestWinStreak: number;
  longestLossStreak: number;
  /** Positive = winning run, negative = losing run, 0 = no matches. */
  currentStreak: number;
  // ---- score level (surrenders excluded) ----
  scoredMatches: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
  firstSetsWon: number;
  firstSetsLost: number;
  /** Won the match after losing the first set. */
  comebackWins: number;
  /** Lost the match after winning the first set. */
  collapses: number;
  /** Won without needing the tie-break. */
  straightSetWins: number;
  tieBreaksPlayed: number;
  tieBreaksWon: number;
  tieBreakWinRate: number;
  /** 6-0 sets handed out / conceded. Only possible outdoors — the indoor
   *  format starts at 2:2 — so treat as a floor, not an exact count. */
  bagelsGiven: number;
  bagelsTaken: number;
  /** Largest game margin in a single won match. */
  biggestWinMargin: number;
  monthsActive: number;
};

export type THeadToHead = {
  opponentId: string;
  meetings: number;
  wins: number;
  losses: number;
  gamesWon: number;
  gamesLost: number;
  /** Most recent first. */
  lastMeetingAt: string | null;
};

export type TRivalry = {
  playerOneId: string;
  playerTwoId: string;
  meetings: number;
  playerOneWins: number;
  playerTwoWins: number;
};

// ------------------------------------------------------------------ helpers

/** A match counts toward wins/losses only once it has a winner. */
export function isDecided(match: TMatch): boolean {
  return !match.is_deleted && !!match.winner_id;
}

/**
 * A match carries usable score data only if it is decided, not a surrender,
 * and actually has games recorded. Surrendered rows are all 0-0.
 */
export function hasScore(match: TMatch): boolean {
  if (!isDecided(match) || match.is_surrender) return false;
  return (match.sets ?? []).some(
    (s) => s && (s.player_one_games > 0 || s.player_two_games > 0)
  );
}

function setsOf(match: TMatch): TSet[] {
  return (match.sets ?? []).filter(Boolean);
}

/** Sets 1 and 2 only — the tie-break never counts toward gems. */
function gameSetsOf(match: TMatch): TSet[] {
  return setsOf(match).filter((s) => s.set_number !== TIEBREAK_SET_NUMBER);
}

function tieBreakOf(match: TMatch): TSet | undefined {
  const tb = setsOf(match).find((s) => s.set_number === TIEBREAK_SET_NUMBER);
  if (!tb) return undefined;
  return tb.player_one_games > 0 || tb.player_two_games > 0 ? tb : undefined;
}

/** Winner of one set, or null if it was not played or ended level. */
function setWinnerId(match: TMatch, set: TSet | undefined): string | null {
  if (!set) return null;
  if (set.player_one_games === set.player_two_games) return null;
  return set.player_one_games > set.player_two_games
    ? match.player_one_id
    : match.player_two_id;
}

export function opponentOf(match: TMatch, userId: string): string | null {
  if (match.player_one_id === userId) return match.player_two_id;
  if (match.player_two_id === userId) return match.player_one_id;
  return null;
}

function playedIn(match: TMatch, userId: string): boolean {
  return match.player_one_id === userId || match.player_two_id === userId;
}

/** Chronological, oldest first. Rows without a date sort last. */
function byDate(a: TMatch, b: TMatch): number {
  return (a.created_at ?? "").localeCompare(b.created_at ?? "");
}

// ------------------------------------------------------------- player stats

export function computePlayerStats(
  userId: string,
  matches: TMatch[],
  options?: { formLength?: number }
): TPlayerStats {
  const formLength = options?.formLength ?? 5;

  const decided = matches
    .filter((m) => isDecided(m) && playedIn(m, userId))
    .sort(byDate);

  const stats: TPlayerStats = {
    userId,
    matchesPlayed: decided.length,
    wins: 0,
    losses: 0,
    winRate: 0,
    points: 0,
    surrendersGiven: 0,
    surrendersReceived: 0,
    form: [],
    longestWinStreak: 0,
    longestLossStreak: 0,
    currentStreak: 0,
    scoredMatches: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    gameDifference: 0,
    firstSetsWon: 0,
    firstSetsLost: 0,
    comebackWins: 0,
    collapses: 0,
    straightSetWins: 0,
    tieBreaksPlayed: 0,
    tieBreaksWon: 0,
    tieBreakWinRate: 0,
    bagelsGiven: 0,
    bagelsTaken: 0,
    biggestWinMargin: 0,
    monthsActive: 0,
  };

  const months = new Set<string>();
  let winRun = 0;
  let lossRun = 0;

  for (const match of decided) {
    const isPlayerOne = match.player_one_id === userId;
    const won = match.winner_id === userId;

    if (match.created_at) months.add(match.created_at.slice(0, 7));

    if (won) {
      stats.wins++;
      winRun++;
      lossRun = 0;
      stats.longestWinStreak = Math.max(stats.longestWinStreak, winRun);
      if (match.is_surrender) stats.surrendersReceived++;
    } else {
      stats.losses++;
      lossRun++;
      winRun = 0;
      stats.longestLossStreak = Math.max(stats.longestLossStreak, lossRun);
      if (match.is_surrender) stats.surrendersGiven++;
    }

    if (!hasScore(match)) continue;
    stats.scoredMatches++;

    // Sets
    for (const set of gameSetsOf(match)) {
      const winner = setWinnerId(match, set);
      if (winner === userId) stats.setsWon++;
      else if (winner) stats.setsLost++;

      const mine = isPlayerOne ? set.player_one_games : set.player_two_games;
      const theirs = isPlayerOne ? set.player_two_games : set.player_one_games;
      stats.gamesWon += mine;
      stats.gamesLost += theirs;
      // A 6-0 only exists as a real scoreline when the set was actually played
      if (mine + theirs > 0) {
        if (theirs === 0) stats.bagelsGiven++;
        if (mine === 0) stats.bagelsTaken++;
      }
    }

    // First set, comebacks and collapses
    const firstSet = setsOf(match).find((s) => s.set_number === 1);
    const firstSetWinner = setWinnerId(match, firstSet);
    if (firstSetWinner === userId) {
      stats.firstSetsWon++;
      if (!won) stats.collapses++;
    } else if (firstSetWinner) {
      stats.firstSetsLost++;
      if (won) stats.comebackWins++;
    }

    // Tie-break
    const tieBreak = tieBreakOf(match);
    if (tieBreak) {
      stats.tieBreaksPlayed++;
      if (setWinnerId(match, tieBreak) === userId) stats.tieBreaksWon++;
    } else if (won) {
      stats.straightSetWins++;
    }

    if (won) {
      const margin = gameSetsOf(match).reduce((acc, set) => {
        const mine = isPlayerOne ? set.player_one_games : set.player_two_games;
        const theirs = isPlayerOne ? set.player_two_games : set.player_one_games;
        return acc + (mine - theirs);
      }, 0);
      stats.biggestWinMargin = Math.max(stats.biggestWinMargin, margin);
    }
  }

  stats.gameDifference = stats.gamesWon - stats.gamesLost;
  stats.points = stats.wins * LEAGUE_POINTS_PER_WIN;
  stats.winRate = stats.matchesPlayed > 0 ? stats.wins / stats.matchesPlayed : 0;
  stats.tieBreakWinRate =
    stats.tieBreaksPlayed > 0 ? stats.tieBreaksWon / stats.tieBreaksPlayed : 0;
  stats.monthsActive = months.size;
  stats.currentStreak = winRun > 0 ? winRun : -lossRun;
  stats.form = decided
    .slice(-formLength)
    .reverse()
    .map((m) => (m.winner_id === userId ? "W" : "L"));

  return stats;
}

/**
 * One entry per player who has at least one decided match.
 *
 * Departed (soft-deleted) and viewer accounts are excluded by default, which is
 * what leaderboards want. Be aware of the consequence: a departed player's
 * matches still count toward their opponents' records — you did play that
 * match — so summing a leaderboard column will NOT reproduce the league-wide
 * total. In this league 18 former players hold a substantial share of the
 * history, so the difference is large, not rounding.
 *
 * Pass `includeInactive` to get every participant, which is what makes the
 * conservation properties (wins == losses == decided matches) hold.
 */
export function computeAllPlayerStats(
  users: TUser[],
  matches: TMatch[],
  options?: { includeInactive?: boolean }
): Map<string, TPlayerStats> {
  const includeInactive = options?.includeInactive ?? false;
  const out = new Map<string, TPlayerStats>();
  for (const user of users) {
    if (!includeInactive && (user.is_deleted || user.is_viewer)) continue;
    const stats = computePlayerStats(user.user_id, matches);
    if (stats.matchesPlayed > 0) out.set(user.user_id, stats);
  }
  return out;
}

// --------------------------------------------------------- head-to-head

/** Every opponent this player has met, most-played first. */
export function computeHeadToHead(
  userId: string,
  matches: TMatch[]
): THeadToHead[] {
  const byOpponent = new Map<string, THeadToHead>();

  for (const match of matches) {
    if (!isDecided(match) || !playedIn(match, userId)) continue;
    const opponentId = opponentOf(match, userId);
    if (!opponentId) continue;

    let row = byOpponent.get(opponentId);
    if (!row) {
      row = {
        opponentId,
        meetings: 0,
        wins: 0,
        losses: 0,
        gamesWon: 0,
        gamesLost: 0,
        lastMeetingAt: null,
      };
      byOpponent.set(opponentId, row);
    }

    row.meetings++;
    if (match.winner_id === userId) row.wins++;
    else row.losses++;

    if (
      match.created_at &&
      (!row.lastMeetingAt || match.created_at > row.lastMeetingAt)
    ) {
      row.lastMeetingAt = match.created_at;
    }

    if (!hasScore(match)) continue;
    const isPlayerOne = match.player_one_id === userId;
    for (const set of gameSetsOf(match)) {
      row.gamesWon += isPlayerOne ? set.player_one_games : set.player_two_games;
      row.gamesLost += isPlayerOne ? set.player_two_games : set.player_one_games;
    }
  }

  return [...byOpponent.values()].sort(
    (a, b) => b.meetings - a.meetings || b.wins - a.wins
  );
}

/**
 * The opponent this player beats most / loses to most, restricted to pairings
 * met at least `MIN_MEETINGS_FOR_RIVALRY` times — most pairings in this league
 * have met exactly once, and a 1-0 record is not a "best opponent".
 */
export function findNemesisAndFavourite(h2h: THeadToHead[]): {
  favourite: THeadToHead | null;
  nemesis: THeadToHead | null;
} {
  const eligible = h2h.filter((r) => r.meetings >= MIN_MEETINGS_FOR_RIVALRY);
  const favourite =
    [...eligible]
      .filter((r) => r.wins > r.losses)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses)[0] ?? null;
  const nemesis =
    [...eligible]
      .filter((r) => r.losses > r.wins)
      .sort((a, b) => b.losses - a.losses || a.wins - b.wins)[0] ?? null;
  return { favourite, nemesis };
}

/** Most-contested pairings across the whole league. */
export function computeRivalries(matches: TMatch[]): TRivalry[] {
  const byPair = new Map<string, TRivalry>();

  for (const match of matches) {
    if (!isDecided(match)) continue;
    const [a, b] = [match.player_one_id, match.player_two_id].sort();
    const key = `${a}|${b}`;

    let row = byPair.get(key);
    if (!row) {
      row = { playerOneId: a, playerTwoId: b, meetings: 0, playerOneWins: 0, playerTwoWins: 0 };
      byPair.set(key, row);
    }
    row.meetings++;
    if (match.winner_id === a) row.playerOneWins++;
    else if (match.winner_id === b) row.playerTwoWins++;
  }

  return [...byPair.values()].sort((x, y) => y.meetings - x.meetings);
}

// ------------------------------------------------------------- leaderboards

export type TLeaderboardKey =
  | "wins"
  | "winRate"
  | "gameDifference"
  | "tieBreaksWon"
  | "tieBreakWinRate"
  | "firstSetsWon"
  | "comebackWins"
  | "straightSetWins"
  | "bagelsGiven"
  | "longestWinStreak"
  | "surrendersGiven"
  | "matchesPlayed";

export type TLeaderboardEntry = {
  userId: string;
  value: number;
  /** Denominator for rate-based boards, e.g. tie-breaks played. */
  outOf?: number;
};

/**
 * Ranks players by one metric, descending.
 *
 * `minSample` guards the rate-based boards: a player who won their only
 * tie-break is not the best tie-break player in the league.
 */
export function buildLeaderboard(
  stats: Map<string, TPlayerStats>,
  key: TLeaderboardKey,
  options?: { limit?: number; minSample?: number }
): TLeaderboardEntry[] {
  const limit = options?.limit ?? 5;
  const minSample = options?.minSample ?? 0;

  const entries: TLeaderboardEntry[] = [];
  for (const s of stats.values()) {
    let value: number;
    let outOf: number | undefined;
    let sample: number;

    switch (key) {
      case "tieBreakWinRate":
        value = s.tieBreakWinRate;
        outOf = s.tieBreaksPlayed;
        sample = s.tieBreaksPlayed;
        break;
      case "winRate":
        value = s.winRate;
        outOf = s.matchesPlayed;
        sample = s.matchesPlayed;
        break;
      case "tieBreaksWon":
        value = s.tieBreaksWon;
        outOf = s.tieBreaksPlayed;
        sample = s.tieBreaksPlayed;
        break;
      case "firstSetsWon":
        value = s.firstSetsWon;
        outOf = s.firstSetsWon + s.firstSetsLost;
        sample = s.scoredMatches;
        break;
      default:
        value = s[key];
        sample = s.matchesPlayed;
    }

    if (sample < minSample) continue;
    if (value <= 0) continue;
    entries.push({ userId: s.userId, value, outOf });
  }

  return entries
    .sort((a, b) => b.value - a.value || (b.outOf ?? 0) - (a.outOf ?? 0))
    .slice(0, limit);
}

// ------------------------------------------------------------ league records

export type TLeagueRecords = {
  totalMatches: number;
  decidedMatches: number;
  scoredMatches: number;
  surrenderedMatches: number;
  waitingMatches: number;
  tieBreakMatches: number;
  comebackMatches: number;
  bagelSets: number;
  totalGames: number;
  distinctPairings: number;
  monthsCovered: number;
  surrenderRate: number;
  tieBreakRate: number;
  /** Highest combined games in a single match. */
  longestMatch: { matchId: string; games: number } | null;
  /** Largest game margin in a single match. */
  mostLopsided: { matchId: string; margin: number } | null;
};

export function computeLeagueRecords(matches: TMatch[]): TLeagueRecords {
  const live = matches.filter((m) => !m.is_deleted);
  const decided = live.filter(isDecided);
  const scored = decided.filter(hasScore);

  const pairings = new Set<string>();
  const months = new Set<string>();
  let tieBreakMatches = 0;
  let comebackMatches = 0;
  let bagelSets = 0;
  let totalGames = 0;
  let longestMatch: TLeagueRecords["longestMatch"] = null;
  let mostLopsided: TLeagueRecords["mostLopsided"] = null;

  for (const match of decided) {
    pairings.add([match.player_one_id, match.player_two_id].sort().join("|"));
    if (match.created_at) months.add(match.created_at.slice(0, 7));
  }

  for (const match of scored) {
    if (tieBreakOf(match)) tieBreakMatches++;

    const firstSetWinner = setWinnerId(
      match,
      setsOf(match).find((s) => s.set_number === 1)
    );
    if (firstSetWinner && firstSetWinner !== match.winner_id) comebackMatches++;

    let games = 0;
    let p1 = 0;
    for (const set of gameSetsOf(match)) {
      const sum = set.player_one_games + set.player_two_games;
      if (sum > 0 && (set.player_one_games === 0 || set.player_two_games === 0)) {
        bagelSets++;
      }
      games += sum;
      p1 += set.player_one_games - set.player_two_games;
    }
    totalGames += games;

    if (match.id && (!longestMatch || games > longestMatch.games)) {
      longestMatch = { matchId: match.id, games };
    }
    const margin = Math.abs(p1);
    if (match.id && (!mostLopsided || margin > mostLopsided.margin)) {
      mostLopsided = { matchId: match.id, margin };
    }
  }

  return {
    totalMatches: live.length,
    decidedMatches: decided.length,
    scoredMatches: scored.length,
    surrenderedMatches: decided.filter((m) => m.is_surrender).length,
    waitingMatches: live.length - decided.length,
    tieBreakMatches,
    comebackMatches,
    bagelSets,
    totalGames,
    distinctPairings: pairings.size,
    monthsCovered: months.size,
    surrenderRate:
      decided.length > 0
        ? decided.filter((m) => m.is_surrender).length / decided.length
        : 0,
    tieBreakRate: scored.length > 0 ? tieBreakMatches / scored.length : 0,
    longestMatch,
    mostLopsided,
  };
}
