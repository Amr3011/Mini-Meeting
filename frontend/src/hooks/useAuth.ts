import { useAuthStore } from "../store";

/**
 * Hook for authentication using Zustand store
 * Replaces the old AuthContext approach
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setUser = useAuthStore((state) => state.setUser);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout,
    setAuthData,
    setUser,
  };
};
