import { useEffect } from "react";
import { useAuthStore } from "../../store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Initializes authentication state when app mounts
 * Restores user session from localStorage if available
 */
const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

export default AuthInitializer;
