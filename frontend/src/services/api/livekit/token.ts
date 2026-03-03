import apiClient from "../client";

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  room_code: string;
  identity: string;
  user_name: string;
}

/**
 * Generate a LiveKit token for joining a meeting
 * @param meetingCode - The meeting code
 * @param userName - Optional custom user name
 */
export const generateToken = async (
  meetingCode: string,
  userName?: string,
): Promise<LiveKitTokenResponse> => {
  const response = await apiClient.post<LiveKitTokenResponse>(
    `/livekit/token`,
    {
      meeting_code: meetingCode,
      user_name: userName,
    },
  );
  return response.data;
};
