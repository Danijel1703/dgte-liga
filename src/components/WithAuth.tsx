import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../utils/supabase";

export const WithAuth = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, session) => {
      setIsAuthenticated(e === "SIGNED_IN" || !!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return isAuthenticated ? children : null;
};
