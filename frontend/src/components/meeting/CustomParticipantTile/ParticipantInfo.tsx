import React from "react";
import { ParticipantName } from "@livekit/components-react";
import type { Participant } from "livekit-client";

interface ParticipantInfoProps {
  participant: Participant;
}

export const ParticipantInfo: React.FC<ParticipantInfoProps> = ({
  participant,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "8px",
      background: "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
    }}
  >
    <ParticipantName
      style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}
    />
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {participant.isMicrophoneEnabled ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626">
          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
        </svg>
      )}
    </div>
  </div>
);
