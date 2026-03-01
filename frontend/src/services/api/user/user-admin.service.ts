import apiClient from "../client";
import type {
  User,
  UserResponse,
  PaginatedUsersResponse,
  UpdateUserRequest,
  UserUpdateResponse,
  CreateUserRequest,
  UserDeleteResponse,
} from "../../../types/user.types";

/**
 * User admin service
 * Handles admin operations for managing users
 */
export const userAdminService = {
  /**
   * Get all users with pagination and search (Admin only)
   */
  getAllUsers: async (
    page: number = 1,
    pageSize: number = 10,
    search: string = "",
  ): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<PaginatedUsersResponse>("/users", {
      params: { page, page_size: pageSize, search },
    });
    return response.data;
  },

  /**
   * Get user by ID (Admin only)
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Create new user (Admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<UserUpdateResponse>("/users", data);
    return response.data.data;
  },

  /**
   * Update user by ID (Admin only)
   */
  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<UserUpdateResponse>(
      `/users/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete<UserDeleteResponse>(`/users/${id}`);
  },
};
