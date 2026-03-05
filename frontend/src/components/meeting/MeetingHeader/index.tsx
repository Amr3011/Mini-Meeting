import React from "react";
import { Participant } from "livekit-client";
import { useParticipantAvatars } from "./useParticipantAvatars";
import { AdminButton } from "./AdminButton";

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
    <div className="flex items-center justify-end px-2 py-1 bg-(--lk-bg2) border-b border-(--lk-border-color) gap-2 min-h-8 shrink-0 md:py-0.5 max-[480px]:px-1.5 max-[480px]:py-0.5 max-[480px]:min-h-7">
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
