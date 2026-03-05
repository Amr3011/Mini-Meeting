import React from "react";
import type { ParticipantsListProps } from "./types";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localParticipantIdentity,
  onKick,
  onMuteTrack,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h4 className="text-xs text-gray-400 mb-3 font-medium">
        Participants ({participants.length})
      </h4>
      <div className="flex flex-col gap-2">
        {participants.map((participant) => {
          const isLocal = participant.identity === localParticipantIdentity;
          const metadata = participant.metadata
            ? JSON.parse(participant.metadata as string)
            : {};
          const role = metadata.role || "guest";

          return (
            <ParticipantItem
              key={participant.identity}
              participant={participant}
              isLocal={isLocal}
              role={role}
              onKick={() => onKick(participant.identity)}
              onMuteTrack={(trackSid, muted) =>
                onMuteTrack(participant.identity, trackSid, muted)
              }
            />
          );
        })}
      </div>
    </div>
  );
};
