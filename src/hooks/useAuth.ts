import { useMemo } from "react";
import { useAuth as useAuthProvider } from "../providers/AuthProvider";
import { useUsers } from "../providers/UsersProvider";

/**
 * Custom hook that combines auth and users data
 * Provides convenient access to current user info and admin status
 */
export function useAuth() {
  const { user } = useAuthProvider();
  const { users } = useUsers();

  const currentUser = useMemo(
    () => users.find((u) => u.user_id === user?.id),
    [user, users]
  );

  const isAdmin = useMemo(() => currentUser?.is_admin ?? false, [currentUser]);

  const isViewer = useMemo(
    () => currentUser?.is_viewer ?? false,
    [currentUser]
  );

  return {
    user,
    currentUser,
    isAdmin,
    isViewer,
  };
}
