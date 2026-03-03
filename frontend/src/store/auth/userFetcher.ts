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
      console.warn("⚠️ User fetch already in progress");
      throw new Error("User fetch already in progress");
    }

    isFetchingUser = true;
    console.log("🔒 User fetch locked, making API call...");
    try {
      const userData = await userService.getCurrentUser();
      console.log("✅ User data received from API:", userData.email);
      return userData;
    } catch (error) {
      console.error("❌ Failed to fetch user from API:", error);
      throw error;
    } finally {
      isFetchingUser = false;
      console.log("🔓 User fetch unlocked");
    }
  },
};
