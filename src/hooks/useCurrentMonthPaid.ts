import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

/** Whether the user has paid membership for the current calendar month (from membership_payment). */
export function useCurrentMonthPaid(userId: string | undefined) {
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setIsPaid(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("membership_payment")
        .select("paid")
        .eq("user_id", userId)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (!cancelled) {
        setIsPaid(!error && data?.paid === true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isPaid, loading };
}
