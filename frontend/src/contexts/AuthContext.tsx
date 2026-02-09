import React, { createContext, useState, useEffect, useRef, type ReactNode } from "react";
import type { User } from "../types/user.types";
import { userService } from "../services/api/user.service";

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingUser = useRef(false);

  // Initialize auth state - fetch user if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user && !isFetchingUser.current) {
        isFetchingUser.current = true;
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          // Token might be invalid, clear it
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setToken(null);
        } finally {
          isFetchingUser.current = false;
          setIsLoading(false);
        }
      } else if (!token) {
        // No token, not loading anymore
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, user]);

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const setAuthData = async (newToken: string) => {
    // Prevent duplicate fetches
    if (isFetchingUser.current) {
      return;
    }
    
    isFetchingUser.current = true;
    
    // Store token in localStorage for OAuth (keep user logged in)
    localStorage.setItem("token", newToken);
    sessionStorage.removeItem("token");
    
    // Fetch user data
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setToken(newToken);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch user after OAuth:", error);
      // Clean up on error
      localStorage.removeItem("token");
      setIsLoading(false);
      throw error;
    } finally {
      isFetchingUser.current = false;
    }
  };

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
