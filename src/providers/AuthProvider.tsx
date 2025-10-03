import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../utils/supabase";

interface TAuthContext {
  user: User | null;
}

const AuthContext = createContext<TAuthContext | null>(null);

const useAuth = () => useContext(AuthContext) as TAuthContext;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data) {
      setUser(data.user);
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (e) => {
      if (e === "SIGNED_IN" || e === "INITIAL_SESSION") {
        getUser();
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };

