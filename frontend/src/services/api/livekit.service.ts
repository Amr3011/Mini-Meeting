import apiClient from './client';

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

export interface MuteParticipantRequest {
  meeting_code: string;
  participant_identity: string;
  track_sid: string;
  muted: boolean;
}

export interface EndMeetingRequest {
  meeting_code: string;
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
  const response = await apiClient.post<LiveKitTokenResponse>(
    `/livekit/token`,
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
  await apiClient.post(`/livekit/remove-participant`, {
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
  const response = await apiClient.get<ListParticipantsResponse>(
    `/livekit/participants`,
    {
      params: { meeting_code: meetingCode },
    }
  );
  return response.data;
};

/**
 * Mute or unmute a participant's track (admin only)
 * @param meetingCode - The meeting code
 * @param participantIdentity - The identity of the participant
 * @param trackSid - The track SID to mute/unmute
 * @param muted - Whether to mute (true) or unmute (false)
 */
export const muteParticipant = async (
  meetingCode: string,
  participantIdentity: string,
  trackSid: string,
  muted: boolean
): Promise<void> => {
  await apiClient.post(`/livekit/mute-participant`, {
    meeting_code: meetingCode,
    participant_identity: participantIdentity,
    track_sid: trackSid,
    muted: muted,
  });
};

/**
 * End the meeting for all participants (admin only)
 * @param meetingCode - The meeting code
 */
export const endMeeting = async (meetingCode: string): Promise<void> => {
  await apiClient.post(`/livekit/end-meeting`, {
    meeting_code: meetingCode,
  });
};
