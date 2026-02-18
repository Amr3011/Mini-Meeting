import apiClient from "./client";
import type {
  User,
  SummarizerSession,
  UserResponse,
  PaginatedUsersResponse,
  UpdateUserRequest,
  UserUpdateResponse,
  CreateUserRequest,
  UserDeleteResponse,
} from "../../types/user.types";

export const userService = {
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
    const response = await apiClient.patch<UserUpdateResponse>("/users/me", data);
    return response.data.data;
  },

  /**
   * Get all users with pagination and search (Admin only)
   */
  getAllUsers: async (
    page: number = 1,
    pageSize: number = 10,
    search: string = ""
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
    const response = await apiClient.patch<UserUpdateResponse>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Get a specific summarizer session by ID for the current user
   */
  getSession: async (id: number): Promise<SummarizerSession> => {
    const user = await userService.getCurrentUser();
    const session = user.summarizer_sessions?.find((s) => s.id === id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }
    return session;
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete<UserDeleteResponse>(`/users/${id}`);
  },
};
