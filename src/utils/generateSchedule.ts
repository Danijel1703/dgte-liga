import type { TGroup, TGroupMember, TMatch } from "../types";
import { supabase } from "./supabase";
import dayjs from "dayjs";

/**
 * Round-robin scheduling using the "circle method".
 *
 * For N participants (padded to even with a BYE sentinel if odd):
 *   - Fix participant[0] in place.
 *   - Rotate participants[1..N-1] one position each round.
 *   - Each round, pair top-half vs reversed bottom-half.
 *
 * Returns an array of rounds, where each round is an array of [indexA, indexB] pairs.
 * A pair containing the BYE index (-1) is a bye and should be skipped.
 */
function buildRoundRobinRounds(playerCount: number): [number, number][][] {
  const participants: number[] = [];
  for (let i = 0; i < playerCount; i++) participants.push(i);

  // If odd, add a BYE placeholder
  if (participants.length % 2 !== 0) participants.push(-1);

  const n = participants.length;
  const totalRounds = n - 1;
  const rounds: [number, number][][] = [];

  // Working copy (we'll rotate indices 1..n-1)
  const list = [...participants];

  for (let round = 0; round < totalRounds; round++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      pairs.push([home, away]);
    }
    rounds.push(pairs);

    // Rotate: keep list[0] fixed, rotate list[1..n-1] by one position to the right
    const last = list[n - 1];
    for (let i = n - 1; i > 1; i--) {
      list[i] = list[i - 1];
    }
    list[1] = last;
  }

  return rounds;
}

export const generateSchedule = async (): Promise<TMatch[]> => {
  // Calculate the start and end of the current month
  const currentMonth = dayjs();
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  // Load groups with active members and joined user info
  const { data } = await supabase
    .from("group")
    .select(
      `
      *,
      members:group_member!inner (
        *,
        user:user_id (*)
      )
    `
    )
    .eq("is_deleted", false)
    .eq("members.is_deleted", false)
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  const matches: TMatch[] = [];

  if (!data) return matches;

  // -------------------------------------------------------------------
  // CRITICAL FIX: Client-side de-duplication to prevent duplicate group processing
  const uniqueGroups = Array.from(
    new Map((data as TGroup[]).map((group) => [group.id, group])).values()
  );
  // -------------------------------------------------------------------

  for (const group of uniqueGroups) {
    const members = (group.members as TGroupMember[]) || [];
    if (members.length < 2) continue;

    const rounds = buildRoundRobinRounds(members.length);

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
      const pairs = rounds[roundIndex];
      for (const [idxA, idxB] of pairs) {
        // Skip bye matches (player index === -1)
        if (idxA === -1 || idxB === -1) continue;

        const playerOne = members[idxA];
        const playerTwo = members[idxB];

        const match: TMatch = {
          player_one_id: playerOne.user_id,
          player_two_id: playerTwo.user_id,
          sets: [
            { set_number: 1, player_one_games: 0, player_two_games: 0 },
            { set_number: 2, player_one_games: 0, player_two_games: 0 },
            { set_number: 3, player_one_games: 0, player_two_games: 0 },
          ],
          winner_id: null,
          status: "waiting",
          group_id: group.id!,
          is_surrender: false,
          is_deleted: false,
          round: roundIndex + 1, // 1-indexed round/week number
        };

        matches.push(match);
      }
    }
  }

  return matches;
};
