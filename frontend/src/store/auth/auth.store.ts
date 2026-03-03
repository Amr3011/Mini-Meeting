import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthStore } from "./auth.types";
import { createAuthActions } from "./authActions";

/**
 * Zustand store for authentication state
 * Manages user, token, and authentication status with persistence
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: localStorage.getItem("token") || sessionStorage.getItem("token"),
        isAuthenticated: false,
        isLoading: true,
        ...createAuthActions(set, get),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ token: state.token }),
      },
    ),
  ),
);
