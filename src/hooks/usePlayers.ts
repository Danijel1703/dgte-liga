import { useState } from "react";
import { supabase } from "../utils/supabase";
import { useUsers } from "../providers/UsersProvider";

export function usePlayers() {
  const { users: players, refresh } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Jeste li sigurni da želite obrisati igrača ${playerName}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("user")
        .update({ is_deleted: true })
        .eq("user_id", playerId);

      if (error) {
        throw error;
      }

      setSuccess(`Igrač ${playerName} je uspješno obrisan!`);
      refresh(); // Refresh the users list
    } catch (error: any) {
      console.error("Error deleting player:", error);
      setError(error.message || "Greška pri brisanju igrača");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return {
    players,
    loading,
    error,
    success,
    deletePlayer,
    clearMessages,
  };
}
