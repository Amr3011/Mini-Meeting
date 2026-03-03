import type { User } from "../../types/user.types";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthData: (token: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
