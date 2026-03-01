import React from "react";
import type { ParticipantsListProps } from "./types";
import { ParticipantItem } from "./ParticipantItem";
import "./AdminControls.styles.css";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localParticipantIdentity,
  onKick,
  onMuteTrack,
}) => {
  return (
    <div className="participants-section">
      <h4 className="participants-header">
        Participants ({participants.length})
      </h4>
      <div className="participants-list">
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
