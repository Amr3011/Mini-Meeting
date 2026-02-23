import React from "react";

interface MeetingHeaderProps {
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  participantCount: number;
  onAdminToggle: () => void;
}

/**
 * Meeting Header Component
 * Clean component for top header bar with Admin controls
 */
export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  isAdmin,
  isAdminPanelOpen,
  participantCount,
  onAdminToggle,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "6px 12px",
        backgroundColor: "var(--lk-bg2)",
        borderBottom: "1px solid var(--lk-border-color)",
        gap: "8px",
        minHeight: "40px",
      }}
    >
      {/* Admin Button */}
      {isAdmin && (
        <button
          className="lk-button lk-button-menu"
          onClick={onAdminToggle}
          title={`Admin Controls (${participantCount} participants)`}
          aria-pressed={isAdminPanelOpen}
          style={{
            backgroundColor: isAdminPanelOpen
              ? "var(--lk-accent)"
              : "var(--lk-bg2)",
            border: "1px solid var(--lk-border-color)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
            padding: "6px 10px",
            fontSize: "13px",
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="lk-button-label" style={{ fontSize: "13px" }}>
            Admin
          </span>
          {participantCount > 0 && (
            <span
              className="lk-button-badge"
              style={{
                position: "absolute",
                top: "-3px",
                right: "-3px",
                backgroundColor: "var(--lk-accent)",
                color: "white",
                fontSize: "9px",
                fontWeight: "600",
                padding: "1px 4px",
                borderRadius: "8px",
                minWidth: "16px",
                textAlign: "center",
                lineHeight: "1.2",
              }}
            >
              {participantCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
