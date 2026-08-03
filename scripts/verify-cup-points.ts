/**
 * Verifies the cup scoring rules against the real scoresheet from the first
 * cup (Kup 1 — 2026). This is the gate on src/utils/cupPoints.ts: the numbers
 * below were counted by hand off the paper sheet.
 *
 * Run:  npm run verify:cup
 *
 * Uses jiti (already present as a transitive dep) so this needs no test runner
 * and no new dependency. tsconfig.app.json only includes src/, so this file is
 * not part of `npm run build`.
 */
import type { TCupGroup, TCupMatch, TCupStage } from "../src/types";
import { calculateCupPoints, cupGroupStandings } from "../src/utils/cupPoints";
import { buildCupGroupMatches, seedSemifinals } from "../src/utils/generateCupSchedule";

const CUP_ID = "cup-1";
const G1 = "skupina-1";
const G2 = "skupina-2";

// Skupina 1
const FRAN = "fran";
const PATRICK = "patrick";
const ALEN = "alen";
const IVAN = "ivan";
const LUKA = "luka";
// Skupina 2
const KRESO = "kreso";
const MARIJAN = "marijan";
const DAMJAN = "damjan";
const DANIJEL = "danijel";
const DINKO = "dinko";

const GROUP_ONE_IDS = [FRAN, PATRICK, ALEN, IVAN, LUKA];
const GROUP_TWO_IDS = [KRESO, MARIJAN, DAMJAN, DANIJEL, DINKO];

function member(cupGroupId: string, userId: string) {
  return { cup_group_id: cupGroupId, user_id: userId, is_deleted: false };
}

const groups: TCupGroup[] = [
  {
    id: G1,
    cup_id: CUP_ID,
    name: "Skupina 1",
    color: "hsl(210, 65%, 45%)",
    sort_order: 10,
    is_deleted: false,
    members: GROUP_ONE_IDS.map((id) => member(G1, id)),
  },
  {
    id: G2,
    cup_id: CUP_ID,
    name: "Skupina 2",
    color: "hsl(150, 65%, 40%)",
    sort_order: 20,
    is_deleted: false,
    members: GROUP_TWO_IDS.map((id) => member(G2, id)),
  },
];

function groupMatch(
  cupGroupId: string,
  playerOne: string,
  playerTwo: string,
  gamesOne: number,
  gamesTwo: number,
  winnerId: string
): TCupMatch {
  return {
    cup_id: CUP_ID,
    cup_group_id: cupGroupId,
    stage: "group",
    round: null,
    slot: null,
    player_one_id: playerOne,
    player_two_id: playerTwo,
    player_one_games: gamesOne,
    player_two_games: gamesTwo,
    winner_id: winnerId,
    status: "played",
    is_surrender: false,
    is_deleted: false,
  };
}

function knockoutMatch(
  stage: TCupStage,
  slot: number | null,
  playerOne: string,
  playerTwo: string,
  gamesOne: number | null,
  gamesTwo: number | null,
  winnerId: string | null
): TCupMatch {
  return {
    cup_id: CUP_ID,
    cup_group_id: null,
    stage,
    round: null,
    slot,
    player_one_id: playerOne,
    player_two_id: playerTwo,
    player_one_games: gamesOne,
    player_two_games: gamesTwo,
    winner_id: winnerId,
    status: winnerId ? "played" : "waiting",
    is_surrender: false,
    is_deleted: false,
  };
}

// --- Skupina 1, exactly as written on the sheet ---
const groupOneMatches: TCupMatch[] = [
  groupMatch(G1, IVAN, LUKA, 1, 4, LUKA),
  groupMatch(G1, PATRICK, ALEN, 1, 4, ALEN),
  groupMatch(G1, FRAN, PATRICK, 4, 2, FRAN),
  groupMatch(G1, ALEN, IVAN, 3, 4, IVAN),
  groupMatch(G1, LUKA, PATRICK, 4, 0, LUKA),
  groupMatch(G1, ALEN, FRAN, 4, 2, ALEN),
  groupMatch(G1, LUKA, ALEN, 4, 0, LUKA),
  groupMatch(G1, FRAN, IVAN, 2, 4, IVAN),
  groupMatch(G1, FRAN, LUKA, 0, 4, LUKA),
  groupMatch(G1, PATRICK, IVAN, 0, 4, IVAN),
];

// --- Skupina 2. Note Marijan–Damjan finished 4-4 and was decided by
// tie-break, which is representable only because winner_id is authoritative.
const groupTwoMatches: TCupMatch[] = [
  groupMatch(G2, KRESO, DAMJAN, 4, 2, KRESO),
  groupMatch(G2, DANIJEL, DINKO, 4, 2, DANIJEL),
  groupMatch(G2, KRESO, MARIJAN, 4, 2, KRESO),
  groupMatch(G2, DANIJEL, DAMJAN, 1, 4, DAMJAN),
  groupMatch(G2, DINKO, DAMJAN, 2, 4, DAMJAN),
  groupMatch(G2, MARIJAN, DINKO, 4, 1, MARIJAN),
  groupMatch(G2, DANIJEL, KRESO, 1, 4, KRESO),
  groupMatch(G2, KRESO, DINKO, 4, 0, KRESO),
  groupMatch(G2, MARIJAN, DAMJAN, 4, 4, DAMJAN),
  groupMatch(G2, DANIJEL, MARIJAN, 4, 3, DANIJEL),
];

const semifinals: TCupMatch[] = [
  knockoutMatch("semifinal", 1, LUKA, DAMJAN, 6, 2, LUKA),
  knockoutMatch("semifinal", 2, IVAN, KRESO, 6, 1, IVAN),
];

// The state on the paper sheet: pairings written down, no scores, no winner.
const undecidedFinals: TCupMatch[] = [
  knockoutMatch("final", null, LUKA, IVAN, null, null, null),
  knockoutMatch("third_place", null, DAMJAN, KRESO, null, null, null),
];

// The critical path: a winner with NO score recorded.
// Ivan won the final and Krešo the 3rd-place match, so the placements are
// Ivan 1st, Luka 2nd, Krešo 3rd, Damjan 4th.
const decidedFinals: TCupMatch[] = [
  knockoutMatch("final", null, LUKA, IVAN, null, null, IVAN),
  knockoutMatch("third_place", null, DAMJAN, KRESO, null, null, KRESO),
];

const groupStage = [...groupOneMatches, ...groupTwoMatches];

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`  FAIL  ${label}\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ok    ${label}`);
  }
}

function totals(matches: TCupMatch[]) {
  const rows = calculateCupPoints(groups, matches);
  return (userId: string) => rows.get(userId)?.total;
}

// ------------------------------------------------------------------
console.log("\nGroup win counts");
{
  const rows = calculateCupPoints(groups, groupStage);
  const wins = (id: string) => rows.get(id)?.groupWins;
  check("Luka", wins(LUKA), 4);
  check("Ivan", wins(IVAN), 3);
  check("Alen", wins(ALEN), 2);
  check("Fran", wins(FRAN), 1);
  check("Patrick", wins(PATRICK), 0);
  check("Krešo", wins(KRESO), 4);
  check("Damjan", wins(DAMJAN), 3);
  check("Danijel", wins(DANIJEL), 2);
  check("Marijan", wins(MARIJAN), 1);
  check("Dinko", wins(DINKO), 0);
  check(
    "4-4 tie-break counts for Damjan, not Marijan",
    rows.get(DAMJAN)?.groupWins === 3 && rows.get(MARIJAN)?.groupWins === 1,
    true
  );
}

console.log("\nGroup standings order");
{
  const all = [...groupStage, ...semifinals, ...decidedFinals];
  check(
    "Skupina 1",
    cupGroupStandings(groups[0], all).map((r) => r.userId),
    [LUKA, IVAN, ALEN, FRAN, PATRICK]
  );
  check(
    "Skupina 2",
    cupGroupStandings(groups[1], all).map((r) => r.userId),
    [KRESO, DAMJAN, DANIJEL, MARIJAN, DINKO]
  );
}

console.log("\nCross-seeded semifinals reproduce the real pairings");
{
  const all = [...groupStage];
  const pairs = seedSemifinals([
    { cupGroupId: G1, orderedUserIds: cupGroupStandings(groups[0], all).map((r) => r.userId) },
    { cupGroupId: G2, orderedUserIds: cupGroupStandings(groups[1], all).map((r) => r.userId) },
  ]);
  check("pairings", pairs, [
    [LUKA, DAMJAN],
    [KRESO, IVAN],
  ]);
}

console.log("\nMid-tournament: finals written down but not decided");
{
  const t = totals([...groupStage, ...semifinals, ...undecidedFinals]);
  // Nobody has a placement bonus yet, so points are participation + group wins.
  check("Luka", t(LUKA), 5);
  check("Ivan", t(IVAN), 4);
  check("Krešo", t(KRESO), 5);
  check("Damjan", t(DAMJAN), 4);
  const rows = calculateCupPoints(groups, [...groupStage, ...semifinals, ...undecidedFinals]);
  check(
    "no placements awarded",
    Array.from(rows.values()).every((r) => r.placement === null),
    true
  );
  check(
    "semifinal wins earn no per-win point (Luka 4 group wins + 1)",
    rows.get(LUKA)?.groupWins,
    4
  );
}

console.log("\nFinal totals — winners recorded with NO score");
{
  const all = [...groupStage, ...semifinals, ...decidedFinals];
  const t = totals(all);
  check("Ivan (1st)", t(IVAN), 11);
  check("Luka (2nd)", t(LUKA), 10);
  check("Krešo (3rd)", t(KRESO), 8);
  check("Damjan (4th)", t(DAMJAN), 4);
  check("Alen", t(ALEN), 3);
  check("Danijel", t(DANIJEL), 3);
  check("Fran", t(FRAN), 2);
  check("Marijan", t(MARIJAN), 2);
  check("Patrick", t(PATRICK), 1);
  check("Dinko", t(DINKO), 1);

  const rows = calculateCupPoints(groups, all);
  check(
    "placements",
    [
      rows.get(IVAN)?.placement,
      rows.get(LUKA)?.placement,
      rows.get(KRESO)?.placement,
      rows.get(DAMJAN)?.placement,
    ],
    [1, 2, 3, 4]
  );
  // Knockout wins must not count as per-win points. Ivan won two knockout
  // matches (semifinal + final) but his group-win count stays at 3.
  check("Ivan's knockout wins are excluded from groupWins", rows.get(IVAN)?.groupWins, 3);
  // The placement bonus outweighs a group win: Luka won more group matches
  // than Ivan (4 vs 3) yet finishes second on points.
  check("Luka has more group wins than Ivan", rows.get(LUKA)!.groupWins > rows.get(IVAN)!.groupWins, true);
  check("Ivan still finishes above Luka on points", t(IVAN)! > t(LUKA)!, true);
  // 4th place earns no bonus: Damjan is level with a player who only won
  // three group matches and never reached the knockout.
  check("Damjan (4th) gets no placement bonus", rows.get(DAMJAN)?.placementPoints, 0);
}

console.log("\nSoft-deleted matches award nothing");
{
  const deleted = groupStage.map((m) => ({ ...m, is_deleted: true }));
  const t = totals([...deleted, ...semifinals, ...decidedFinals]);
  check("Ivan keeps only participation + placement", t(IVAN), 8);
  check("Patrick keeps only participation", t(PATRICK), 1);
}

console.log("\nFixture generation");
{
  const fixtures = buildCupGroupMatches(CUP_ID, [
    { cupGroupId: G1, userIds: GROUP_ONE_IDS },
    { cupGroupId: G2, userIds: GROUP_TWO_IDS },
  ]);
  check("total fixtures", fixtures.length, 20);
  check("per group", fixtures.filter((m) => m.cup_group_id === G1).length, 10);
  check(
    "every pair appears exactly once",
    new Set(
      fixtures.map((m) =>
        [m.cup_group_id, m.player_one_id, m.player_two_id].sort().join("|")
      )
    ).size,
    20
  );
  check("no byes leaked in", fixtures.some((m) => !m.player_one_id || !m.player_two_id), false);
  check("rounds are 1-indexed", Math.min(...fixtures.map((m) => m.round!)), 1);
  check("five rounds per group", Math.max(...fixtures.map((m) => m.round!)), 5);
  check("scores start empty", fixtures.every((m) => m.player_one_games === null), true);
}

console.log(
  failures === 0
    ? "\nAll cup scoring checks passed.\n"
    : `\n${failures} check(s) FAILED.\n`
);
process.exit(failures === 0 ? 0 : 1);
