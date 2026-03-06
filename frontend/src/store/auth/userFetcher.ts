import { userService } from "../../services/api/user";
import type { User } from "../../types/user.types";

let fetchPromise: Promise<User> | null = null;

/**
 * User data fetching with lock mechanism
 * Prevents duplicate concurrent requests by returning the existing promise
 */
export const userFetcher = {
  isLocked: () => fetchPromise !== null,

  fetchWithLock: async (): Promise<User> => {
    if (fetchPromise) {
      console.warn("⚠️ User fetch already in progress, returning existing promise");
      return fetchPromise;
    }

    console.log("🔒 User fetch locked, making API call...");
    fetchPromise = (async () => {
      try {
        const userData = await userService.getCurrentUser();
        console.log("✅ User data received from API:", userData.email);
        return userData;
      } catch (error) {
        console.error("❌ Failed to fetch user from API:", error);
        throw error;
      } finally {
        fetchPromise = null;
        console.log("🔓 User fetch unlocked");
      }
    })();

    return fetchPromise;
  },
};
