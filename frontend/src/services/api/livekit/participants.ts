import apiClient from "../client";

export interface ParticipantInfo {
  identity: string;
  name: string;
  state: string;
  metadata: string;
  joined_at: number;
}

export interface ListParticipantsResponse {
  participants: ParticipantInfo[];
}

/**
 * List all participants in a meeting
 * @param meetingCode - The meeting code
 */
export const listParticipants = async (
  meetingCode: string,
): Promise<ListParticipantsResponse> => {
  const response = await apiClient.get<ListParticipantsResponse>(
    `/livekit/participants`,
    {
      params: { meeting_code: meetingCode },
    },
  );
  return response.data;
};

/**
 * Get the number of participants in a meeting (public)
 * @param meetingCode - The meeting code
 */
export const getParticipantCount = async (
  meetingCode: string,
): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(
    `/livekit/participants/count`,
    {
      params: { meeting_code: meetingCode },
    },
  );
  return response.data.count;
};
