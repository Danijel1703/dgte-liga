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

export type TCupGroupStandingSeed = {
  cupGroupId: string;
  orderedUserIds: string[];
};

/**
 * Cross-seeded semifinal pairings: winner of group A vs runner-up of group B,
 * and winner of group B vs runner-up of group A.
 *
 * This is a suggestion, not a constraint — the result modal lets an admin
 * change both players of any knockout match, which matters when transcribing
 * a historical scoresheet.
 */
export function seedSemifinals(
  standingsByGroup: TCupGroupStandingSeed[]
): Array<[string, string]> {
  if (standingsByGroup.length !== 2) {
    throw new Error(
      "Eliminacijska faza podržava točno dvije skupine. Trenutno ih je " +
        standingsByGroup.length +
        "."
    );
  }

  const [a, b] = standingsByGroup;
  if (a.orderedUserIds.length < 2 || b.orderedUserIds.length < 2) {
    throw new Error("Svaka skupina mora imati barem dva igrača u poretku.");
  }

  return [
    [a.orderedUserIds[0], b.orderedUserIds[1]],
    [b.orderedUserIds[0], a.orderedUserIds[1]],
  ];
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
