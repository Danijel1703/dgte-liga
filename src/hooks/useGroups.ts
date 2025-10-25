import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import type { TGroup } from "../types.d";
import { useLoader } from "../providers/Loader";
import { getMonthRange } from "../utils/dateUtils";
import dayjs, { Dayjs } from "dayjs";

export function useGroups(selectedMonth?: Dayjs | null) {
  const [groups, setGroups] = useState<TGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { setLoading: setGlobalLoading } = useLoader();

  const fetchGroups = async () => {
    setLoading(true);
    setGlobalLoading(true);

    try {
      let query = supabase
        .from("group")
        .select(
          `
          *,
          members:group_member (
            *,
            user:user_id (*)
          ),
          match (*)
        `
        )
        .eq("is_deleted", false)
        .eq("members.is_deleted", false);

      // Apply month filter if provided
      if (selectedMonth) {
        const { start, end } = getMonthRange(selectedMonth);
        query = query.gte("created_at", start).lte("created_at", end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedMonth]);

  const createGroup = async (groupData: Partial<TGroup>) => {
    const { data, error } = await supabase
      .from("group")
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    await fetchGroups(); // Refresh the list
    return data;
  };

  const updateGroup = async (id: string, updates: Partial<TGroup>) => {
    const { data, error } = await supabase
      .from("group")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await fetchGroups(); // Refresh the list
    return data;
  };

  const deleteGroup = async (id: string) => {
    const { error } = await supabase
      .from("group")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) throw error;
    await fetchGroups(); // Refresh the list
  };

  return {
    groups,
    loading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
