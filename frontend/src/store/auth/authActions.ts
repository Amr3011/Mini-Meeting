import type { AuthActions } from "./auth.types";
import type { User } from "../../types/user.types";
import { tokenStorage } from "./tokenStorage";
import { userFetcher } from "./userFetcher";

/**
 * Auth store actions
 * Handles user authentication, token management, and initialization
 */
export const createAuthActions = (
  set: (
    partial: Partial<{
      user: User | null;
      token: string | null;
      isAuthenticated: boolean;
      isLoading: boolean;
    }>,
  ) => void,
  get: () => {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  },
): AuthActions => ({
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user && !!get().token,
    });
  },

  setToken: (token: string | null) => {
    if (token) {
      tokenStorage.set(token);
    } else {
      tokenStorage.remove();
    }
    set({
      token,
      isAuthenticated: !!token && !!get().user,
    });
  },

  setAuthData: async (token: string) => {
    if (userFetcher.isLocked()) return;

    try {
      tokenStorage.set(token);
      const userData = await userFetcher.fetchWithLock();

      set({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      tokenStorage.remove();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    tokenStorage.remove();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    const token = get().token;

    if (!token || userFetcher.isLocked()) {
      set({ isLoading: false });
      return;
    }

    try {
      const userData = await userFetcher.fetchWithLock();
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      tokenStorage.remove();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
});
