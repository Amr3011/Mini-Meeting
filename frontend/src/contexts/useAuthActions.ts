import { type MutableRefObject } from "react";
import type { User } from "../types/user.types";
import { userService } from "../services/api/user";

/**
 * Hook for auth actions
 * Provides logout and setAuthData functions
 */
export function useAuthActions(
  isFetchingUser: MutableRefObject<boolean>,
  setToken: (token: string | null) => void,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
) {
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const setAuthData = async (newToken: string) => {
    if (isFetchingUser.current) return;

    isFetchingUser.current = true;

    localStorage.setItem("token", newToken);
    sessionStorage.removeItem("token");

    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setToken(newToken);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch user after OAuth:", error);
      localStorage.removeItem("token");
      setIsLoading(false);
      throw error;
    } finally {
      isFetchingUser.current = false;
    }
  };

  return { logout, setAuthData };
}
