import React from "react";
import type { ParticipantItemProps } from "./types";
import { TrackControls } from "./TrackControls";
import { KickIcon } from "./icons";
import "./AdminControls.styles.css";

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  role,
  onKick,
  onMuteTrack,
}) => {
  return (
    <div className="participant-item">
      <div className="participant-header">
        <div className="participant-info">
          <div className="participant-name-row">
            <p className="participant-name">
              {participant.name || participant.identity}
            </p>
            {isLocal && <span className="badge badge-you">You</span>}
            {role === "admin" && <span className="badge badge-admin">Admin</span>}
          </div>
          <p className="participant-role">{role}</p>
        </div>
        {!isLocal && (
          <button onClick={onKick} title="Kick participant" className="kick-btn">
            <KickIcon />
          </button>
        )}
      </div>

      <TrackControls
        participant={participant}
        isLocal={isLocal}
        onMuteTrack={onMuteTrack}
      />
    </div>
  );
};
