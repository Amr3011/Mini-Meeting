import { useEffect, useRef } from "react";
import type { User } from "../types/user.types";
import { userService } from "../services/api/user";

/**
 * Hook for initializing auth state
 * Fetches user data if token exists
 */
export function useAuthInitialization(
  token: string | null,
  user: User | null,
  setUser: (user: User | null) => void,
  setToken: (token: string | null) => void,
  setIsLoading: (loading: boolean) => void,
) {
  const isFetchingUser = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user && !isFetchingUser.current) {
        isFetchingUser.current = true;
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setToken(null);
        } finally {
          isFetchingUser.current = false;
          setIsLoading(false);
        }
      } else if (!token) {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, user, setUser, setToken, setIsLoading]);

  return isFetchingUser;
}
