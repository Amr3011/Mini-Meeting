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
    className={`lk-button flex items-center gap-2 px-3 py-1.5 min-h-8 rounded-2xl border border-(--lk-border-color) shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-sm font-medium text-(--lk-fg) md:gap-1.5 md:px-2.5 md:py-1 md:min-h-7 md:rounded-[14px] md:text-[13px] max-[480px]:gap-1 max-[480px]:px-2 max-[480px]:py-0.5 max-[480px]:min-h-6 max-[480px]:rounded-xl max-[480px]:text-xs ${isOpen ? "bg-(--lk-accent)" : "bg-(--lk-bg2)"}`}
    onClick={onToggle}
    title={`Admin Controls (${participantCount} participants)`}
    aria-pressed={isOpen}
  >
    <AvatarCircles avatars={avatars} />

    {/* Participant Count */}
    <span>{participantCount}</span>
  </button>
);
