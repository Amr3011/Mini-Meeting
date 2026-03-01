import { userService } from "../../services/api/user";
import type { User } from "../../types/user.types";

let isFetchingUser = false;

/**
 * User data fetching with lock mechanism
 * Prevents duplicate concurrent requests
 */
export const userFetcher = {
  isLocked: () => isFetchingUser,

  fetchWithLock: async (): Promise<User> => {
    if (isFetchingUser) {
      throw new Error("User fetch already in progress");
    }

    isFetchingUser = true;
    try {
      const userData = await userService.getCurrentUser();
      return userData;
    } finally {
      isFetchingUser = false;
    }
  },
};
