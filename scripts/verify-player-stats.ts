/**
 * Verifies src/utils/playerStats.ts.
 *
 * Part 1 uses hand-built fixtures for the cases that are easy to get wrong:
 * surrenders carrying no score, the tie-break being excluded from gems,
 * comebacks, bagels and streaks.
 *
 * Part 2 (optional, needs network) recomputes against the live database and
 * cross-checks the aggregate totals independently.
 *
 * Run:  npm run verify:stats
 *       npm run verify:stats -- --live
 */
import type { TMatch, TUser } from "../src/types";
import {
  buildLeaderboard,
  computeAllPlayerStats,
  computeHeadToHead,
  computeLeagueRecords,
  computePlayerStats,
  computeRivalries,
  findNemesisAndFavourite,
  hasScore,
} from "../src/utils/playerStats";

const A = "player-a";
const B = "player-b";
const C = "player-c";

let fails = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) console.log(`  ok    ${label}`);
  else {
    fails++;
    console.error(
      `  FAIL  ${label}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`
    );
  }
}

let seq = 0;
function match(
  playerOne: string,
  playerTwo: string,
  sets: Array<[number, number]>,
  winnerId: string | null,
  opts?: { surrender?: boolean; deleted?: boolean; date?: string }
): TMatch {
  seq++;
  return {
    id: `m${seq}`,
    player_one_id: playerOne,
    player_two_id: playerTwo,
    sets: sets.map(([a, b], i) => ({
      set_number: i + 1,
      player_one_games: a,
      player_two_games: b,
    })),
    winner_id: winnerId,
    status: winnerId ? (opts?.surrender ? "surrendered" : "played") : "waiting",
    group_id: "g1",
    is_surrender: !!opts?.surrender,
    is_deleted: !!opts?.deleted,
    created_at: opts?.date ?? `2026-0${((seq - 1) % 9) + 1}-01T10:00:00Z`,
  };
}

const EMPTY: Array<[number, number]> = [
  [0, 0],
  [0, 0],
  [0, 0],
];

// ------------------------------------------------------------------------
console.log("\nSurrenders count for W/L but never for score metrics");
{
  const ms = [
    // A beats B on a surrender — no score recorded at all
    match(A, B, EMPTY, A, { surrender: true }),
    // B beats A on a surrender
    match(A, B, EMPTY, B, { surrender: true }),
  ];
  check("hasScore is false for a surrender", ms.map(hasScore), [false, false]);
  const a = computePlayerStats(A, ms);
  check("matchesPlayed counts surrenders", a.matchesPlayed, 2);
  check("wins", a.wins, 1);
  check("losses", a.losses, 1);
  check("surrendersReceived (opponent gave up)", a.surrendersReceived, 1);
  check("surrendersGiven (A gave up)", a.surrendersGiven, 1);
  check("scoredMatches excludes surrenders", a.scoredMatches, 0);
  check("no sets counted", [a.setsWon, a.setsLost], [0, 0]);
  check("no games counted", [a.gamesWon, a.gamesLost], [0, 0]);
  check("no tie-breaks counted", a.tieBreaksPlayed, 0);
  check("no straight-set win credited", a.straightSetWins, 0);
}

console.log("\nTie-break decides the match but is excluded from gems");
{
  // A wins 6-4, loses 3-6, wins the tie-break 10-8
  const ms = [match(A, B, [[6, 4], [3, 6], [10, 8]], A)];
  const a = computePlayerStats(A, ms);
  const b = computePlayerStats(B, ms);
  check("A games (tie-break excluded)", [a.gamesWon, a.gamesLost], [9, 10]);
  check("A game difference is negative despite winning", a.gameDifference, -1);
  check("B games are the mirror", [b.gamesWon, b.gamesLost], [10, 9]);
  check("A sets won/lost counts only sets 1-2", [a.setsWon, a.setsLost], [1, 1]);
  check("tie-break played", [a.tieBreaksPlayed, b.tieBreaksPlayed], [1, 1]);
  check("tie-break won by A", [a.tieBreaksWon, b.tieBreaksWon], [1, 0]);
  check("A tie-break win rate", a.tieBreakWinRate, 1);
  check("B tie-break win rate", b.tieBreakWinRate, 0);
  check("not a straight-set win", a.straightSetWins, 0);
}

console.log("\nStraight-set win (unplayed tie-break must not count)");
{
  const ms = [match(A, B, [[6, 2], [6, 3], [0, 0]], A)];
  const a = computePlayerStats(A, ms);
  check("tie-break not counted as played", a.tieBreaksPlayed, 0);
  check("straight-set win credited", a.straightSetWins, 1);
  check("games", [a.gamesWon, a.gamesLost], [12, 5]);
  check("biggest win margin", a.biggestWinMargin, 7);
}

console.log("\nComeback vs collapse");
{
  // A loses set 1, wins the match  -> comeback for A, collapse for B
  const ms = [match(A, B, [[3, 6], [6, 4], [10, 7]], A)];
  const a = computePlayerStats(A, ms);
  const b = computePlayerStats(B, ms);
  check("A first sets won/lost", [a.firstSetsWon, a.firstSetsLost], [0, 1]);
  check("A comeback win", a.comebackWins, 1);
  check("A no collapse", a.collapses, 0);
  check("B first sets won/lost", [b.firstSetsWon, b.firstSetsLost], [1, 0]);
  check("B collapse", b.collapses, 1);
  check("B no comeback", b.comebackWins, 0);
}

console.log("\nBagels, from both sides");
{
  const ms = [match(A, B, [[6, 0], [6, 1], [0, 0]], A)];
  const a = computePlayerStats(A, ms);
  const b = computePlayerStats(B, ms);
  check("A gave a bagel", [a.bagelsGiven, a.bagelsTaken], [1, 0]);
  check("B took a bagel", [b.bagelsGiven, b.bagelsTaken], [0, 1]);
}
{
  // An unplayed set is 0-0 and must never register as a bagel either way
  const ms = [match(A, B, EMPTY, A, { surrender: true })];
  const a = computePlayerStats(A, ms);
  check("0-0 is not a bagel", [a.bagelsGiven, a.bagelsTaken], [0, 0]);
}

console.log("\nStreaks and form");
{
  seq = 0;
  const ms = [
    match(A, B, [[6, 1], [6, 2], [0, 0]], A, { date: "2026-01-01T10:00:00Z" }),
    match(A, B, [[6, 2], [6, 3], [0, 0]], A, { date: "2026-02-01T10:00:00Z" }),
    match(A, B, [[6, 4], [6, 4], [0, 0]], A, { date: "2026-03-01T10:00:00Z" }),
    match(A, B, [[2, 6], [3, 6], [0, 0]], B, { date: "2026-04-01T10:00:00Z" }),
    match(A, B, [[1, 6], [2, 6], [0, 0]], B, { date: "2026-05-01T10:00:00Z" }),
    match(A, B, [[6, 3], [6, 3], [0, 0]], A, { date: "2026-06-01T10:00:00Z" }),
  ];
  const a = computePlayerStats(A, ms);
  check("longest win streak", a.longestWinStreak, 3);
  check("longest loss streak", a.longestLossStreak, 2);
  check("current streak (won the latest)", a.currentStreak, 1);
  check("form, newest first", a.form, ["W", "L", "L", "W", "W"]);
  check("months active", a.monthsActive, 6);

  const b = computePlayerStats(B, ms);
  check("B current streak is negative", b.currentStreak, -1);
  check("B form mirrors A", b.form, ["L", "W", "W", "L", "L"]);
}

console.log("\nSoft-deleted and undecided matches are ignored");
{
  seq = 0;
  const ms = [
    match(A, B, [[6, 0], [6, 0], [0, 0]], A, { deleted: true }),
    match(A, B, EMPTY, null),
    match(A, B, [[6, 1], [6, 1], [0, 0]], A),
  ];
  const a = computePlayerStats(A, ms);
  check("only the live decided match counts", a.matchesPlayed, 1);
  // The deleted match held two 6-0 sets; the live one has none, so a correct
  // implementation reports zero bagels here.
  check("bagels from the deleted match are excluded", a.bagelsGiven, 0);
  check("games from the live match only", [a.gamesWon, a.gamesLost], [12, 2]);
}

console.log("\nHead-to-head");
{
  seq = 0;
  const ms = [
    match(A, B, [[6, 1], [6, 1], [0, 0]], A, { date: "2026-01-01T10:00:00Z" }),
    match(B, A, [[6, 2], [6, 2], [0, 0]], B, { date: "2026-02-01T10:00:00Z" }),
    match(A, B, [[6, 3], [6, 3], [0, 0]], A, { date: "2026-03-01T10:00:00Z" }),
    match(A, C, [[1, 6], [1, 6], [0, 0]], C, { date: "2026-04-01T10:00:00Z" }),
    match(A, C, [[2, 6], [2, 6], [0, 0]], C, { date: "2026-05-01T10:00:00Z" }),
  ];
  const h2h = computeHeadToHead(A, ms);
  check("opponents sorted by meetings", h2h.map((r) => r.opponentId), [B, C]);
  check("vs B record", [h2h[0].meetings, h2h[0].wins, h2h[0].losses], [3, 2, 1]);
  check("vs C record", [h2h[1].meetings, h2h[1].wins, h2h[1].losses], [2, 0, 2]);
  // A was player_two in the middle match, so this also proves the game totals
  // are oriented per-player rather than per-column: 12+4+12 for, 2+12+6 against.
  check("games orientation survives swapped sides", [h2h[0].gamesWon, h2h[0].gamesLost], [28, 20]);
  check("last meeting date", h2h[0].lastMeetingAt, "2026-03-01T10:00:00Z");

  const { favourite, nemesis } = findNemesisAndFavourite(h2h);
  check("favourite opponent", favourite?.opponentId, B);
  check("nemesis", nemesis?.opponentId, C);

  const rivalries = computeRivalries(ms);
  check("top rivalry is the 3-meeting pair", rivalries[0].meetings, 3);
  check("rivalry wins split correctly", [rivalries[0].playerOneWins, rivalries[0].playerTwoWins].sort(), [1, 2]);
}

console.log("\nA single meeting is not a rivalry");
{
  seq = 0;
  const ms = [match(A, B, [[6, 1], [6, 1], [0, 0]], A)];
  const { favourite, nemesis } = findNemesisAndFavourite(computeHeadToHead(A, ms));
  check("no favourite from one meeting", favourite, null);
  check("no nemesis from one meeting", nemesis, null);
}

console.log("\nLeaderboards guard small samples");
{
  seq = 0;
  const users: TUser[] = [A, B, C].map((id) => ({
    user_id: id, first_name: id, last_name: "X", avatar: "", email: "", phone: "",
    is_admin: false, is_viewer: false, is_deleted: false, paid: true,
  }));
  const ms = [
    // C wins their only tie-break -> 100%, but on a sample of 1
    match(C, A, [[6, 4], [4, 6], [10, 8]], C),
    // B plays four tie-breaks and wins three -> 75% on a real sample
    match(B, A, [[6, 4], [4, 6], [10, 8]], B),
    match(B, A, [[6, 4], [4, 6], [10, 8]], B),
    match(B, A, [[6, 4], [4, 6], [10, 8]], B),
    match(B, A, [[6, 4], [4, 6], [8, 10]], A),
  ];
  const stats = computeAllPlayerStats(users, ms);

  const unguarded = buildLeaderboard(stats, "tieBreakWinRate", { limit: 3 });
  check("without a guard, the 1-of-1 player tops the board", unguarded[0].userId, C);

  // A was the opponent in all five tie-breaks and won one, so A legitimately
  // clears minSample with a 1-of-5 rate and ranks below B. Only C (1 of 1) is cut.
  const guarded = buildLeaderboard(stats, "tieBreakWinRate", { limit: 3, minSample: 3 });
  check("with minSample the 1-of-1 player is excluded", guarded.some((e) => e.userId === C), false);
  check("B ranks above A on rate", guarded.map((e) => e.userId), [B, A]);
  check("rate board reports its denominator", guarded[0].outOf, 4);

  const counts = buildLeaderboard(stats, "tieBreaksWon", { limit: 3 });
  check("count board ranks B first", counts[0].userId, B);
  check("zero-value players omitted", counts.every((e) => e.value > 0), true);
}

console.log("\nLeague records");
{
  seq = 0;
  const ms = [
    match(A, B, [[6, 0], [6, 1], [0, 0]], A),          // bagel, straight sets
    match(A, B, [[3, 6], [6, 4], [10, 7]], A),          // comeback + tie-break
    match(A, B, EMPTY, B, { surrender: true }),          // surrender, no score
    match(A, B, EMPTY, null),                            // waiting
    match(A, B, [[6, 1], [6, 1], [0, 0]], A, { deleted: true }), // ignored
  ];
  const r = computeLeagueRecords(ms);
  check("totalMatches excludes deleted", r.totalMatches, 4);
  check("decidedMatches", r.decidedMatches, 3);
  check("scoredMatches", r.scoredMatches, 2);
  check("surrenderedMatches", r.surrenderedMatches, 1);
  check("waitingMatches", r.waitingMatches, 1);
  check("tieBreakMatches", r.tieBreakMatches, 1);
  check("comebackMatches", r.comebackMatches, 1);
  check("bagelSets", r.bagelSets, 1);
  check("totalGames (tie-break excluded)", r.totalGames, 6 + 0 + 6 + 1 + 3 + 6 + 6 + 4);
  check("distinctPairings", r.distinctPairings, 1);
  check("surrenderRate", Math.round(r.surrenderRate * 100), 33);
  check("tieBreakRate", r.tieBreakRate, 0.5);
  check("mostLopsided margin", r.mostLopsided?.margin, 11);
}

// ------------------------------------------------------------------------
if (process.argv.includes("--live")) {
  console.log("\nLIVE cross-check against the real database");
  const { readFileSync } = await import("node:fs");
  const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const url = /VITE_SUPABASE_URL\s*=\s*(.+)/.exec(env)![1].trim().replace(/^["']|["']$/g, "");
  const key = /VITE_SUPABASE_ANON_KEY\s*=\s*(.+)/.exec(env)![1].trim().replace(/^["']|["']$/g, "");
  const h = { apikey: key, Authorization: `Bearer ${key}` };

  const [mRes, uRes] = await Promise.all([
    fetch(`${url}/rest/v1/match?select=*&is_deleted=eq.false`, { headers: h }),
    fetch(`${url}/rest/v1/user?select=*`, { headers: h }),
  ]);
  const liveMatches = (await mRes.json()) as TMatch[];
  const liveUsers = (await uRes.json()) as TUser[];

  const records = computeLeagueRecords(liveMatches);
  // Leaderboard view: departed and viewer accounts hidden.
  const visible = computeAllPlayerStats(liveUsers, liveMatches);
  // Every participant, including 18 departed players. Only this set can satisfy
  // the conservation properties, since a match needs both sides counted.
  const stats = computeAllPlayerStats(liveUsers, liveMatches, { includeInactive: true });

  // Independent recomputation straight off the raw rows
  const decided = liveMatches.filter((m) => m.winner_id);
  const scored = decided.filter((m) => !m.is_surrender);
  const rawTieBreaks = scored.filter((m) =>
    (m.sets ?? []).some((s) => s?.set_number === 3 && (s.player_one_games > 0 || s.player_two_games > 0))
  ).length;
  const rawPairs = new Set(
    decided.map((m) => [m.player_one_id, m.player_two_id].sort().join("|"))
  ).size;

  check("decidedMatches matches raw count", records.decidedMatches, decided.length);
  check("scoredMatches matches raw count", records.scoredMatches, scored.length);
  check("tieBreakMatches matches raw count", records.tieBreakMatches, rawTieBreaks);
  check("distinctPairings matches raw count", records.distinctPairings, rawPairs);

  // Every player's wins must sum to the number of decided matches
  const summedWins = [...stats.values()].reduce((a, s) => a + s.wins, 0);
  check("wins across all players sum to decided matches", summedWins, decided.length);
  // ...and every decided match produces exactly one loss too
  const summedLosses = [...stats.values()].reduce((a, s) => a + s.losses, 0);
  check("losses also sum to decided matches", summedLosses, decided.length);

  // Games won across all players must equal games lost across all players
  const gw = [...stats.values()].reduce((a, s) => a + s.gamesWon, 0);
  const gl = [...stats.values()].reduce((a, s) => a + s.gamesLost, 0);
  check("total games won equals total games lost", gw, gl);
  check("total games equals league record", gw, records.totalGames);

  // Tie-breaks: each tie-break match yields exactly one winner and one player
  const tbPlayed = [...stats.values()].reduce((a, s) => a + s.tieBreaksPlayed, 0);
  const tbWon = [...stats.values()].reduce((a, s) => a + s.tieBreaksWon, 0);
  check("tie-breaks played summed = 2 per match", tbPlayed, rawTieBreaks * 2);
  check("tie-breaks won summed = 1 per match", tbWon, rawTieBreaks);

  // Comebacks on one side are collapses on the other
  const comebacks = [...stats.values()].reduce((a, s) => a + s.comebackWins, 0);
  const collapses = [...stats.values()].reduce((a, s) => a + s.collapses, 0);
  check("comebacks equal collapses", comebacks, collapses);
  check("comebacks match league record", comebacks, records.comebackMatches);

  // Bagels given by someone are bagels taken by someone else
  const bg = [...stats.values()].reduce((a, s) => a + s.bagelsGiven, 0);
  const bt = [...stats.values()].reduce((a, s) => a + s.bagelsTaken, 0);
  check("bagels given equal bagels taken", bg, bt);
  check("bagels match league record", bg, records.bagelSets);

  // Surrenders given by one player are received by the other
  const sg = [...stats.values()].reduce((a, s) => a + s.surrendersGiven, 0);
  const sr = [...stats.values()].reduce((a, s) => a + s.surrendersReceived, 0);
  check("surrenders given equal surrenders received", sg, sr);
  check("surrenders match league record", sg, records.surrenderedMatches);

  // Head-to-head must reconcile with each player's own totals
  let h2hMismatch = 0;
  for (const [userId, s] of stats) {
    const h2h = computeHeadToHead(userId, liveMatches);
    const w = h2h.reduce((a, r) => a + r.wins, 0);
    const l = h2h.reduce((a, r) => a + r.losses, 0);
    if (w !== s.wins || l !== s.losses) h2hMismatch++;
  }
  check("every player's H2H reconciles with their W/L", h2hMismatch, 0);

  // The default (leaderboard) view must hide departed players — and must
  // therefore NOT satisfy conservation. Asserting both directions keeps the
  // distinction from silently regressing either way.
  const departed = liveUsers.filter((u) => u.is_deleted || u.is_viewer);
  check(
    "departed players are hidden from the leaderboard view",
    departed.some((u) => visible.has(u.user_id)),
    false
  );
  check(
    "leaderboard view is smaller than the full participant set",
    visible.size < stats.size,
    true
  );
  const visibleWins = [...visible.values()].reduce((a, s) => a + s.wins, 0);
  check(
    "leaderboard wins fall short of league total (departed players hold the rest)",
    visibleWins < records.decidedMatches,
    true
  );

  console.log(`\n  league snapshot: ${records.decidedMatches} decided, ${records.scoredMatches} scored,`);
  console.log(`  ${records.surrenderedMatches} surrendered (${(records.surrenderRate * 100).toFixed(1)}%),`);
  console.log(`  ${records.tieBreakMatches} tie-breaks (${(records.tieBreakRate * 100).toFixed(1)}% of scored),`);
  console.log(`  ${records.comebackMatches} comebacks, ${records.bagelSets} bagels,`);
  console.log(`  ${records.distinctPairings} pairings over ${records.monthsCovered} months,`);
  console.log(`  ${visible.size} active players shown of ${stats.size} who ever played,`);
  console.log(`  ${records.totalGames} games played.`);
}

console.log(
  fails === 0 ? "\nAll player-stats checks passed.\n" : `\n${fails} check(s) FAILED.\n`
);
process.exit(fails === 0 ? 0 : 1);
