import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { TUser } from "../types";
import { supabase } from "../utils/supabase";

interface TUsersContext {
  users: TUser[];
  refresh: () => Promise<void>;
}

const UsersContext = createContext<TUsersContext | null>(null);

const useUsers = () =>
  useContext(UsersContext) || { users: [], refresh: () => {} };

const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TUser[]>([]);

  const getUsers = async () => {
    const response = await supabase
      .from("user")
      .select("*")
      .eq("is_deleted", false).order("last_name");
    if (response.data) setData(response.data);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users: data,
        refresh: getUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export { UsersProvider, useUsers };
