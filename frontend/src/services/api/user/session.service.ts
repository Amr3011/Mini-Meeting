import apiClient from "../client";
import type {
  SummarizerSession,
  PaginatedSessionsResponse,
} from "../../../types/user.types";

/**
 * Session service
 * Handles summarizer session operations
 */
export const sessionService = {
  /**
   * Get all summarizer sessions with pagination
   */
  getSessions: async (
    page: number = 1,
    pageSize: number = 10,
    signal?: AbortSignal,
  ): Promise<PaginatedSessionsResponse> => {
    const response = await apiClient.get<PaginatedSessionsResponse>(
      "/sessions",
      {
        params: { page, page_size: pageSize },
        signal,
      },
    );
    return response.data;
  },

  /**
   * Get a specific summarizer session by ID
   */
  getSession: async (
    id: number,
    signal?: AbortSignal,
  ): Promise<SummarizerSession> => {
    const response = await apiClient.get<{ data: SummarizerSession }>(
      `/sessions/${id}`,
      {
        signal,
      },
    );
    return response.data.data;
  },

  /**
   * Delete a summarizer session by ID
   */
  deleteSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/sessions/${id}`);
  },
};
