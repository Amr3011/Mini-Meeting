import React from "react";
import { Participant } from "livekit-client";
import { useParticipantAvatars } from "./useParticipantAvatars";
import { AdminButton } from "./AdminButton";
import "./MeetingHeader.css";

interface MeetingHeaderProps {
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  participants: Participant[];
  onAdminToggle: () => void;
}

/**
 * Meeting Header Component
 * Clean component for top header bar with Admin controls
 */
export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  isAdmin,
  isAdminPanelOpen,
  participants,
  onAdminToggle,
}) => {
  const participantAvatars = useParticipantAvatars(participants);
  const participantCount = participants.length;

  return (
    <div
      className="meeting-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "4px 8px",
        backgroundColor: "var(--lk-bg2)",
        borderBottom: "1px solid var(--lk-border-color)",
        gap: "8px",
        minHeight: "32px",
      }}
    >
      {/* Admin Button - Google Meet Style */}
      {isAdmin && (
        <AdminButton
          isOpen={isAdminPanelOpen}
          avatars={participantAvatars}
          participantCount={participantCount}
          onToggle={onAdminToggle}
        />
      )}
    </div>
  );
};
