import type { TCupMatch } from "../types";
import { buildRoundRobinRounds } from "./roundRobin";

export type TCupGroupSeed = {
  cupGroupId: string;
  userIds: string[];
};

/**
 * Round-robin fixtures for every group of a cup.
 *
 * Pure and synchronous, unlike `generateSchedule()` which fetches its own
 * groups from Supabase — the caller owns the insert.
 *
 * A 5-player group pads to 6, giving 5 rounds of 3 pairs, of which one pair per
 * round is a bye: 10 real fixtures per group.
 */
export function buildCupGroupMatches(
  cupId: string,
  groups: TCupGroupSeed[]
): TCupMatch[] {
  const matches: TCupMatch[] = [];

  for (const group of groups) {
    const userIds = group.userIds;
    if (userIds.length < 2) continue;

    const rounds = buildRoundRobinRounds(userIds.length);

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
      for (const [idxA, idxB] of rounds[roundIndex]) {
        // Skip byes (player index === -1)
        if (idxA === -1 || idxB === -1) continue;

        matches.push({
          cup_id: cupId,
          cup_group_id: group.cupGroupId,
          stage: "group",
          round: roundIndex + 1,
          slot: null,
          player_one_id: userIds[idxA],
          player_two_id: userIds[idxB],
          player_one_games: null,
          player_two_games: null,
          winner_id: null,
          status: "waiting",
          is_surrender: false,
          is_deleted: false,
        });
      }
    }
  }

  return matches;
}

/** One player already ordered inside their group (wins, game difference, games for). */
export type TCupStandingPlayer = {
  userId: string;
  groupWins: number;
  gameDifference: number;
  gamesFor: number;
};

export type TCupGroupStandingSeed = {
  cupGroupId: string;
  name: string;
  /** Lower comes first on the cup page, and wins a tie between runner-ups. */
  sortOrder: number;
  ordered: TCupStandingPlayer[];
};

export type TPlayoffSlot = {
  userId: string;
  /** Why this player is here, e.g. "nositelj 1, pobjednik · Skupina A". */
  note: string;
};

export type TPlayoffPlan = {
  summary: string;
  semifinals: Array<[TPlayoffSlot, TPlayoffSlot]>;
};

type TRankedPlayer = TCupStandingPlayer & {
  groupName: string;
  groupSortOrder: number;
};

/**
 * Who fills the four playoff places.
 *
 * Two groups keep the original cross-seed: winner of A vs runner-up of B and
 * the reverse. That is the first cup's draw and must not move.
 *
 * Three groups: the three winners are seeds 1–3 (ranked on their group
 * record) and the best runner-up is seed 4, even when that runner-up's
 * record is better than a weak group winner. Four groups: the four winners,
 * ranked the same way. One group: the top four on that table.
 *
 * Seeds then play 1 vs 4 and 2 vs 3. Across groups the record is wins, then
 * game difference, then games won — the same order as a group table. A tie
 * goes to the group earlier on the page.
 */
export function playoffRule(groupCount: number): string {
  switch (groupCount) {
    case 1:
      return "Jedna skupina: prva četiri na tablici idu u polufinale (1. protiv 4., 2. protiv 3.). Poraženi igraju za 3. mjesto.";
    case 2:
      return "Dvije skupine: pobjednik jedne igra protiv drugoplasiranog druge. Poraženi u polufinalu igraju za 3. mjesto.";
    case 3:
      return "Tri skupine: u polufinale idu tri pobjednika (nositelji 1–3) i najbolji drugoplasirani (nositelj 4). Poredak je po pobjedama, razlici gemova i osvojenim gemovima. Polufinale je 1. protiv 4. i 2. protiv 3. Poraženi igraju za 3. mjesto. Ostali ostaju na bodovima iz skupine.";
    case 4:
      return "Četiri skupine: u polufinale idu četiri pobjednika, poredani po pobjedama, razlici gemova i osvojenim gemovima (1. protiv 4., 2. protiv 3.). Poraženi igraju za 3. mjesto.";
    default:
      if (groupCount > 4) {
        return "Playoff prima četiri igrača. S pet ili više skupina završnica se ne može sama složiti.";
      }
      return "Dodaj skupine, pa generiraj raspored.";
  }
}

function compareGroupRecord(a: TRankedPlayer, b: TRankedPlayer): number {
  return (
    b.groupWins - a.groupWins ||
    b.gameDifference - a.gameDifference ||
    b.gamesFor - a.gamesFor ||
    a.groupSortOrder - b.groupSortOrder ||
    a.userId.localeCompare(b.userId)
  );
}

function playersAtPlace(
  groups: TCupGroupStandingSeed[],
  placeIndex: number
): TRankedPlayer[] {
  const rows: TRankedPlayer[] = [];
  for (const group of groups) {
    const player = group.ordered[placeIndex];
    if (!player) continue;
    rows.push({
      ...player,
      groupName: group.name,
      groupSortOrder: group.sortOrder,
    });
  }
  return rows.sort(compareGroupRecord);
}

function pairSeeds(seeds: TPlayoffSlot[], summary: string): TPlayoffPlan {
  if (seeds.length !== 4 || seeds.some((s) => !s.userId)) {
    throw new Error("Playoff treba točno četiri igrača.");
  }
  const ids = seeds.map((s) => s.userId);
  if (new Set(ids).size !== 4) {
    throw new Error("Isti igrač ne može dva puta u playoff.");
  }
  return {
    summary,
    semifinals: [
      [seeds[0], seeds[3]],
      [seeds[1], seeds[2]],
    ],
  };
}

export function planPlayoff(standingsByGroup: TCupGroupStandingSeed[]): TPlayoffPlan {
  const groups = [...standingsByGroup].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.cupGroupId.localeCompare(b.cupGroupId)
  );

  if (groups.length === 0) {
    throw new Error("Nema skupina za playoff.");
  }
  if (groups.length > 4) {
    throw new Error(playoffRule(groups.length));
  }

  if (groups.length === 2) {
    const [a, b] = groups;
    if (a.ordered.length < 2 || b.ordered.length < 2) {
      throw new Error("Svaka skupina mora imati barem dva igrača u poretku.");
    }
    return {
      summary: playoffRule(2),
      semifinals: [
        [
          { userId: a.ordered[0].userId, note: `pobjednik · ${a.name}` },
          { userId: b.ordered[1].userId, note: `drugoplasirani · ${b.name}` },
        ],
        [
          { userId: b.ordered[0].userId, note: `pobjednik · ${b.name}` },
          { userId: a.ordered[1].userId, note: `drugoplasirani · ${a.name}` },
        ],
      ],
    };
  }

  if (groups.length === 1) {
    const group = groups[0];
    if (group.ordered.length < 4) {
      throw new Error("Jedna skupina mora imati barem četiri igrača za polufinale.");
    }
    return pairSeeds(
      group.ordered.slice(0, 4).map((player, index) => ({
        userId: player.userId,
        note: `nositelj ${index + 1} · ${group.name}`,
      })),
      playoffRule(1)
    );
  }

  const winners = playersAtPlace(groups, 0);
  if (winners.length !== groups.length) {
    throw new Error("Svaka skupina mora imati pobjednika u poretku.");
  }

  const seeds: TPlayoffSlot[] = winners.map((player, index) => ({
    userId: player.userId,
    note: `nositelj ${index + 1}, pobjednik · ${player.groupName}`,
  }));

  if (groups.length === 3) {
    const taken = new Set(seeds.map((s) => s.userId));
    const bestSecond = playersAtPlace(groups, 1).find((player) => !taken.has(player.userId));
    if (!bestSecond) {
      throw new Error("Za tri skupine treba barem jedan drugoplasirani.");
    }
    seeds.push({
      userId: bestSecond.userId,
      note: `nositelj 4, najbolji drugoplasirani · ${bestSecond.groupName}`,
    });
  }

  return pairSeeds(seeds, playoffRule(groups.length));
}

/**
 * Semifinal pairings for the playoff.
 *
 * A suggestion, not a constraint — the result modal lets an admin change both
 * players of any knockout match, which matters when transcribing a historical
 * scoresheet.
 */
export function seedSemifinals(
  standingsByGroup: TCupGroupStandingSeed[]
): Array<[string, string]> {
  return planPlayoff(standingsByGroup).semifinals.map(
    (pair) => [pair[0].userId, pair[1].userId] as [string, string]
  );
}

/**
 * The knockout skeleton: two semifinals with concrete players, plus an empty
 * final and 3rd-place match whose players are filled in once the semifinals
 * resolve.
 */
export function buildKnockoutSkeleton(
  cupId: string,
  semifinalPairs: Array<[string, string]>
): TCupMatch[] {
  const base = {
    cup_id: cupId,
    cup_group_id: null,
    round: null,
    player_one_games: null,
    player_two_games: null,
    winner_id: null,
    status: "waiting" as const,
    is_surrender: false,
    is_deleted: false,
  };

  const semifinals: TCupMatch[] = semifinalPairs.map((pair, index) => ({
    ...base,
    stage: "semifinal",
    slot: index + 1,
    player_one_id: pair[0],
    player_two_id: pair[1],
  }));

  return [
    ...semifinals,
    { ...base, stage: "final", slot: null, player_one_id: null, player_two_id: null },
    {
      ...base,
      stage: "third_place",
      slot: null,
      player_one_id: null,
      player_two_id: null,
    },
  ];
}
