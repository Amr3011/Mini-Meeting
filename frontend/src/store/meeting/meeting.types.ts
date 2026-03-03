export interface MeetingParticipant {
  identity: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isAdmin: boolean;
}

export interface MeetingState {
  meetingCode: string | null;
  isInMeeting: boolean;
  isAdmin: boolean;
  participants: MeetingParticipant[];
  isSummarizerActive: boolean;
}

export interface MeetingActions {
  setMeetingCode: (code: string | null) => void;
  setIsInMeeting: (isInMeeting: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  addParticipant: (participant: MeetingParticipant) => void;
  removeParticipant: (identity: string) => void;
  updateParticipant: (
    identity: string,
    updates: Partial<MeetingParticipant>,
  ) => void;
  setSummarizerActive: (isActive: boolean) => void;
  resetMeeting: () => void;
}

export type MeetingStore = MeetingState & MeetingActions;
