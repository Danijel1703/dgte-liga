import type { TGroup, TGroupMember, TMatch } from "../types";
import { supabase } from "./supabase";
import { buildRoundRobinRounds } from "./roundRobin";
import dayjs from "dayjs";

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

  const groupIds = uniqueGroups.map((g) => g.id).filter(Boolean) as string[];
  if (groupIds.length > 0) {
    const { count } = await supabase
      .from("match")
      .select("id", { count: "exact", head: true })
      .in("group_id", groupIds)
      .eq("is_deleted", false);

    if ((count ?? 0) > 0) {
      throw new Error(
        "Raspored za ovaj mjesec već postoji. Ukloni duplikate ili obriši postojeće mečeve prije ponovnog generiranja."
      );
    }
  }

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
