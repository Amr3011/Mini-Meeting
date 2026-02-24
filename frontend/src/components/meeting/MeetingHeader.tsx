import React, { useMemo } from "react";
import { Participant } from "livekit-client";
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
  // Extract participant avatars from metadata
  const participantAvatars = useMemo(() => {
    return participants
      .slice(0, 3) // Show max 3 avatars
      .map((p) => {
        try {
          const metadata = p.metadata ? JSON.parse(p.metadata) : null;
          return {
            name: p.name || p.identity,
            avatar: metadata?.avatar || "",
          };
        } catch (e) {
          return {
            name: p.name || p.identity,
            avatar: "",
          };
        }
      });
  }, [participants]);

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
        <button
          className="lk-button admin-button"
          onClick={onAdminToggle}
          title={`Admin Controls (${participantCount} participants)`}
          aria-pressed={isAdminPanelOpen}
          style={{
            backgroundColor: isAdminPanelOpen
              ? "var(--lk-accent)"
              : "var(--lk-bg2)",
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
          {/* Overlapping Avatar Circles */}
          <div
            className="admin-avatars"
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "-2px",
            }}
          >
            {participantAvatars.map((p, index) => (
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
                  zIndex: participantAvatars.length - index,
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
      )}
    </div>
  );
};
