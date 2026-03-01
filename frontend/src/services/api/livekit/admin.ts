import apiClient from "../client";

/**
 * Remove a participant from a meeting (admin only)
 * @param meetingCode - The meeting code
 * @param participantIdentity - The identity of the participant to remove
 */
export const removeParticipant = async (
  meetingCode: string,
  participantIdentity: string,
): Promise<void> => {
  await apiClient.post(`/livekit/remove-participant`, {
    meeting_code: meetingCode,
    participant_identity: participantIdentity,
  });
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
  muted: boolean,
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
