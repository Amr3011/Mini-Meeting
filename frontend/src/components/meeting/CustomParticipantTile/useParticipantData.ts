import { useMemo } from "react";
import { useEnsureParticipant } from "@livekit/components-react";

export const useParticipantData = () => {
  const participant = useEnsureParticipant();

  const metadata = useMemo(() => {
    try {
      if (participant?.metadata) {
        return JSON.parse(participant.metadata);
      }
    } catch (e) {
      console.warn("Failed to parse participant metadata:", e);
    }
    return null;
  }, [participant?.metadata]);

  const avatarUrl = metadata?.avatar || "";

  return { participant, avatarUrl };
};
