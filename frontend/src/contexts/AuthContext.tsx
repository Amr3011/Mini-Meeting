import React, { createContext, useState, type ReactNode } from "react";
import type { User } from "../types/user.types";
import { useAuthInitialization } from "./useAuthInitialization";
import { useAuthActions } from "./useAuthActions";

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthData: (token: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

/**
 * Auth provider component
 * Manages authentication state and provides context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const isFetchingUser = useAuthInitialization(
    token,
    user,
    setUser,
    setToken,
    setIsLoading,
  );

  const { logout, setAuthData } = useAuthActions(
    isFetchingUser,
    setToken,
    setUser,
    setIsLoading,
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        logout,
        setUser,
        setAuthData,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
