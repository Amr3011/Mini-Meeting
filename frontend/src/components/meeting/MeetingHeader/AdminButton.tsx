import { AvatarCircles } from "./AvatarCircles";
import type { ParticipantAvatar } from "./useParticipantAvatars";

interface AdminButtonProps {
  isOpen: boolean;
  avatars: ParticipantAvatar[];
  participantCount: number;
  onToggle: () => void;
}

/**
 * Admin button showing participant count and avatars
 * Google Meet style with overlapping circles
 */
export const AdminButton = ({
  isOpen,
  avatars,
  participantCount,
  onToggle,
}: AdminButtonProps) => (
  <button
    className="lk-button admin-button"
    onClick={onToggle}
    title={`Admin Controls (${participantCount} participants)`}
    aria-pressed={isOpen}
    style={{
      backgroundColor: isOpen ? "var(--lk-accent)" : "var(--lk-bg2)",
      border: "1px solid var(--lk-border-color)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      minHeight: "28px",
      borderRadius: "14px",
    }}
  >
    <AvatarCircles avatars={avatars} />

    {/* Participant Count */}
    <span
      style={{
        fontSize: "14px",
        fontWeight: "500",
        color: "var(--lk-fg)",
      }}
    >
      {participantCount}
    </span>
  </button>
);
