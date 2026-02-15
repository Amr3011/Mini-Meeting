import apiClient from "./client";
import type {
  Meeting,
  MeetingResponse,
  MeetingsResponse,
  MeetingDeleteResponse,
  SummarizerSession,
  SummarizerStartResponse,
  SummarizerStopResponse,
} from "../../types/meeting.types";

export const meetingService = {
  /**
   * Create a new instant meeting (no parameters needed)
   */
  createMeeting: async (): Promise<Meeting> => {
    const response = await apiClient.post<MeetingResponse>("/meetings");
    return response.data.data;
  },

  /**
   * Get meetings created by the current user
   */
  getMyMeetings: async (): Promise<Meeting[]> => {
    const response = await apiClient.get<MeetingsResponse>("/meetings/my");
    return response.data.data;
  },

  /**
   * Get meeting by ID
   */
  getMeetingById: async (id: number): Promise<Meeting> => {
    const response = await apiClient.get<MeetingResponse>(`/meetings/${id}`);
    return response.data.data;
  },

  /**
   * Get meeting by code
   */
  getMeetingByCode: async (code: string): Promise<Meeting> => {
    const response = await apiClient.get<MeetingResponse>(`/meetings/code/${code}`);
    return response.data.data;
  },

  /**
   * Delete a meeting
   */
  deleteMeeting: async (id: number): Promise<void> => {
    await apiClient.delete<MeetingDeleteResponse>(`/meetings/${id}`);
  },

  /**
   * Get all meetings (Admin only)
   */
  getAllMeetings: async (): Promise<Meeting[]> => {
    const response = await apiClient.get<MeetingsResponse>("/meetings");
    return response.data.data;
  },

  /**
   * Start summarizer for a meeting
   */
  startSummarizer: async (meetingId: number): Promise<SummarizerSession> => {
    const response = await apiClient.post<SummarizerStartResponse>(
      `/meetings/${meetingId}/summarizer/start`
    );
    return response.data.data;
  },

  /**
   * Stop summarizer for a meeting
   */
  stopSummarizer: async (meetingId: number): Promise<SummarizerSession> => {
    const response = await apiClient.post<SummarizerStopResponse>(
      `/meetings/${meetingId}/summarizer/stop`
    );
    return response.data.data;
  },
};

