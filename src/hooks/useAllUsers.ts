import { useEffect, useMemo, useState } from "react";
import type { TUser } from "../types";
import { supabase } from "../utils/supabase";

/**
 * The complete roster, including players who have left the league.
 *
 * UsersProvider deliberately filters `is_deleted` because almost every page
 * wants only current players. Historical views cannot use it: a departed
 * player still appears in past results, and without their row the UI can only
 * render "unknown player" — or silently drop the row entirely.
 *
 * Use this for anything that looks backwards (statistics, head-to-head,
 * profiles). Use `useUsers()` for anything that acts on the current squad.
 */
export function useAllUsers() {
  const [users, setUsers] = useState<TUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("user").select("*");
      if (!cancelled) {
        setUsers((data ?? []) as TUser[]);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, TUser>();
    for (const u of users) map.set(u.user_id, u);
    return map;
  }, [users]);

  return { users, byId, loading };
}
