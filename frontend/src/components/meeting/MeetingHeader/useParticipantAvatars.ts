import { useMemo } from "react";
import { Participant } from "livekit-client";

export interface ParticipantAvatar {
  name: string;
  avatar: string;
}

/**
 * Hook to extract participant avatars from metadata
 * Parses JSON metadata and returns avatar info for display
 */
export function useParticipantAvatars(participants: Participant[]) {
  const participantAvatars = useMemo(() => {
    return participants
      .slice(0, 3) // Show max 3 avatars
      .map((p) => {
        try {
          const metadata = p.metadata ? JSON.parse(p.metadata) : null;
          return {
            name: p.name || p.identity,
            avatar: metadata?.avatar || "",
          };
        } catch {
          return {
            name: p.name || p.identity,
            avatar: "",
          };
        }
      });
  }, [participants]);

  return participantAvatars;
}
