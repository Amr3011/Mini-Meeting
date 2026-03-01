import React from "react";

interface TrackButtonProps {
  onClick: () => void;
  title: string;
  isMuted: boolean;
  icon: React.ReactNode;
  label: string;
}

/**
 * Track control button (mic/camera)
 * Shows mute status with colored background
 */
export const TrackButton: React.FC<TrackButtonProps> = ({
  onClick,
  title,
  isMuted,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 8px",
      fontSize: "11px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      backgroundColor: isMuted ? "rgba(220, 38, 38, 0.2)" : "var(--lk-bg)",
      color: isMuted ? "#f87171" : "var(--lk-fg2)",
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);
