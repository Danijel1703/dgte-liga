import { useEffect, useState } from "react";
import type { TAnnouncement } from "../types.d";
import { supabase } from "../utils/supabase";

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<TAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    const { data } = await supabase
      .from("announcement")
      .select("*")
      .order("created_at", { ascending: false });

    setAnnouncements(data || []);
    if (showLoading) {
      setLoading(false);
    }
  };

  const addAnnouncement = async (text: string) => {
    const { data } = await supabase
      .from("announcement")
      .insert([{ text }])
      .select()
      .single();

    return data;
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("announcement").delete().eq("id", id);

    await fetchAnnouncements();
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    addAnnouncement,
    deleteAnnouncement,
    refresh: fetchAnnouncements,
  };
};
