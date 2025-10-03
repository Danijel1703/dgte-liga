import { useState, type ReactNode } from "react";
import { supabase } from "../utils/supabase";

export const WithAuth = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  supabase.auth.onAuthStateChange((e, session) => {
    setIsAuthenticated(e === "SIGNED_IN" || !!session);
  });

  return isAuthenticated ? children : null;
};
