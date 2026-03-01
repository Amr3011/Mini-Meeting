import type { ParticipantAvatar } from "./useParticipantAvatars";

interface AvatarCirclesProps {
  avatars: ParticipantAvatar[];
}

/**
 * Overlapping avatar circles for participants
 * Google Meet style with max 3 avatars
 */
export const AvatarCircles = ({ avatars }: AvatarCirclesProps) => (
  <div
    className="admin-avatars"
    style={{
      display: "flex",
      alignItems: "center",
      marginLeft: "-2px",
    }}
  >
    {avatars.map((p, index) => (
      <div
        key={index}
        className="admin-avatar"
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "2px solid var(--lk-bg2)",
          backgroundColor: "var(--lk-bg3)",
          marginLeft: index > 0 ? "-6px" : "0",
          zIndex: avatars.length - index,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          fontWeight: "600",
          color: "var(--lk-fg)",
        }}
      >
        {p.avatar ? (
          <img
            src={p.avatar}
            alt={p.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span>{p.name?.charAt(0)?.toUpperCase() || "?"}</span>
        )}
      </div>
    ))}
  </div>
);
