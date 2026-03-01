import React from "react";

interface AvatarDisplayProps {
  avatarUrl: string;
  participantName: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  participantName,
}) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={participantName || "User"}
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid var(--lk-border-color)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "var(--lk-bg3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        fontWeight: "600",
        color: "var(--lk-fg)",
        border: "3px solid var(--lk-border-color)",
      }}
    >
      {participantName?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};
