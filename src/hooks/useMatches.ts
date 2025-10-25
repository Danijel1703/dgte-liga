import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import type { TGroup, TMatch, TUser } from "../types.d";
import { useLoader } from "../providers/Loader";
import { getMonthRange } from "../utils/dateUtils";
import dayjs, { Dayjs } from "dayjs";
import { orderBy } from "lodash-es";

type JoinedMatch = TMatch & {
  player_one: TUser;
  player_two: TUser;
  group: TGroup;
};

export function useMatches(
  selectedMonth?: Dayjs | null,
  showOnlyMine?: boolean,
  userId?: string
) {
  const [matches, setMatches] = useState<JoinedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { setLoading: setGlobalLoading } = useLoader();

  const fetchMatches = async () => {
    setLoading(true);
    setGlobalLoading(true);

    try {
      const { data: matchesData, error } = await supabase
        .from("match")
        .select(
          `
          *,
          player_one:player_one_id (*),
          player_two:player_two_id (*),
          group:group_id (*)
        `
        )
        .eq("is_deleted", false);

      if (error) throw error;

      if (matchesData) {
        let filteredMatches = matchesData as JoinedMatch[];

        // Filter by user if showOnlyMine is true
        if (showOnlyMine && userId) {
          filteredMatches = filteredMatches.filter((match) =>
            [match.player_one_id, match.player_two_id].includes(userId)
          );
        }

        // Filter by selected month if provided
        if (selectedMonth) {
          const { start, end } = getMonthRange(selectedMonth);
          filteredMatches = filteredMatches.filter((match) => {
            const matchDate = dayjs(match.created_at);
            return matchDate.isBetween(start, end, "day", "[]");
          });
        }

        const sortedMatches = orderBy(filteredMatches, "group.name");
        setMatches(sortedMatches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedMonth, showOnlyMine, userId]);

  const createMatch = async (matchData: Partial<TMatch>) => {
    const { data, error } = await supabase
      .from("match")
      .insert([matchData])
      .select()
      .single();

    if (error) throw error;
    await fetchMatches(); // Refresh the list
    return data;
  };

  const updateMatch = async (id: string, updates: Partial<TMatch>) => {
    const { data, error } = await supabase
      .from("match")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchMatches(); // Refresh the list
    return data;
  };

  const deleteMatch = async (id: string) => {
    const { error } = await supabase
      .from("match")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw error;
    await fetchMatches(); // Refresh the list
  };

  const deleteAllMatches = async () => {
    const { error } = await supabase.from("match").update({ is_deleted: true });

    if (error) throw error;
    await fetchMatches(); // Refresh the list
  };

  return {
    matches,
    loading,
    fetchMatches,
    createMatch,
    updateMatch,
    deleteMatch,
    deleteAllMatches,
  };
}
