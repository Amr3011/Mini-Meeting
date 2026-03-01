import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { MeetingStore } from "./meeting.types";

const initialState = {
  meetingCode: null,
  isInMeeting: false,
  isAdmin: false,
  participants: [],
  isSummarizerActive: false,
};

export const useMeetingStore = create<MeetingStore>()(
  devtools((set) => ({
    ...initialState,
    setMeetingCode: (code) => set({ meetingCode: code }),

    setIsInMeeting: (isInMeeting) => set({ isInMeeting }),

    setIsAdmin: (isAdmin) => set({ isAdmin }),

    addParticipant: (participant) =>
      set((state) => ({
        participants: [...state.participants, participant],
      })),

    removeParticipant: (identity) =>
      set((state) => ({
        participants: state.participants.filter((p) => p.identity !== identity),
      })),

    updateParticipant: (identity, updates) =>
      set((state) => ({
        participants: state.participants.map((p) =>
          p.identity === identity ? { ...p, ...updates } : p,
        ),
      })),

    setSummarizerActive: (isActive) => set({ isSummarizerActive: isActive }),

    resetMeeting: () => set(initialState),
  })),
);
