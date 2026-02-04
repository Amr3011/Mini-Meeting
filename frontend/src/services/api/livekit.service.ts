import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  room_name: string;
  identity: string;
  user_name: string;
}

export interface RemoveParticipantRequest {
  meeting_code: string;
  participant_identity: string;
}

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
 * Generate a LiveKit token for joining a meeting
 * @param meetingCode - The meeting code
 * @param userName - Optional custom user name
 */
export const generateToken = async (
  meetingCode: string,
  userName?: string
): Promise<LiveKitTokenResponse> => {
  const response = await axios.post<LiveKitTokenResponse>(
    `${API_URL}/livekit/token`,
    {
      meeting_code: meetingCode,
      user_name: userName,
    }
  );
  return response.data;
};

/**
 * Remove a participant from a meeting (admin only)
 * @param meetingCode - The meeting code
 * @param participantIdentity - The identity of the participant to remove
 */
export const removeParticipant = async (
  meetingCode: string,
  participantIdentity: string
): Promise<void> => {
  await axios.post(`${API_URL}/livekit/remove-participant`, {
    meeting_code: meetingCode,
    participant_identity: participantIdentity,
  });
};

/**
 * List all participants in a meeting
 * @param meetingCode - The meeting code
 */
export const listParticipants = async (
  meetingCode: string
): Promise<ListParticipantsResponse> => {
  const response = await axios.get<ListParticipantsResponse>(
    `${API_URL}/livekit/participants`,
    {
      params: { meeting_code: meetingCode },
    }
  );
  return response.data;
};
