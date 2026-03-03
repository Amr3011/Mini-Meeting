import { useState, useEffect } from "react";
import type { User } from "../../types/user.types";

/**
 * Hook for initializing display name
 * Sets display name from authenticated user
 */
export function useDisplayNameInit(
  isAuthenticated: boolean,
  user: User | null,
) {
  const getInitialName = () => {
    if (isAuthenticated && user) {
      return user.name || user.email.split("@")[0];
    }
    return "";
  };

  const [displayName, setDisplayName] = useState<string>(getInitialName);

  useEffect(() => {
    const newName = getInitialName();
    if (newName !== displayName) {
      setDisplayName(newName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return { displayName, setDisplayName };
}
