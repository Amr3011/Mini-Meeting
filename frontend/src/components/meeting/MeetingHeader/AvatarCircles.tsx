import type { ParticipantAvatar } from "./useParticipantAvatars";

interface AvatarCirclesProps {
  avatars: ParticipantAvatar[];
}

/**
 * Overlapping avatar circles for participants
 * Google Meet style with max 3 avatars
 */
export const AvatarCircles = ({ avatars }: AvatarCirclesProps) => (
  <div className="flex items-center -ml-0.5 max-[480px]:-ml-px">
    {avatars.map((p, index) => (
      <div
        key={index}
        className="w-6 h-6 rounded-full border-2 border-(--lk-bg2) bg-(--lk-bg3) overflow-hidden flex items-center justify-center text-[10px] font-semibold text-(--lk-fg) md:w-5 md:h-5 md:text-[8px] md:border-[1.5px] max-[480px]:w-4.5 max-[480px]:h-4.5 max-[480px]:text-[7px] max-[480px]:border"
        style={{
          marginLeft: index > 0 ? "-8px" : "0",
          zIndex: avatars.length - index,
        }}
      >
        {p.avatar ? (
          <img
            src={p.avatar}
            alt={p.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{p.name?.charAt(0)?.toUpperCase() || "?"}</span>
        )}
      </div>
    ))}
  </div>
);
