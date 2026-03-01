import apiClient from "../client";
import type {
  User,
  UserResponse,
  UpdateUserRequest,
  UserUpdateResponse,
} from "../../../types/user.types";

/**
 * User profile service
 * Handles current user profile operations
 */
export const userProfileService = {
  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<UserResponse>("/users/me");
    return response.data.data;
  },

  /**
   * Update current user's profile
   */
  updateCurrentUser: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<UserUpdateResponse>(
      "/users/me",
      data,
    );
    return response.data.data;
  },
};
