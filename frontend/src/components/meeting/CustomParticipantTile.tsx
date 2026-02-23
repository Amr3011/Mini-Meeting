import React, { useMemo } from "react";
import {
  useEnsureTrackRef,
  useEnsureParticipant,
  ParticipantTile,
  ParticipantName,
} from "@livekit/components-react";
import { Track } from "livekit-client";

/**
 * Custom Participant Tile that displays user avatar from metadata
 */
export const CustomParticipantTile: React.FC = () => {
  const trackRef = useEnsureTrackRef();
  const participant = useEnsureParticipant();

  // Parse metadata to get avatar URL
  const metadata = useMemo(() => {
    try {
      if (participant?.metadata) {
        return JSON.parse(participant.metadata);
      }
    } catch (e) {
      console.warn("Failed to parse participant metadata:", e);
    }
    return null;
  }, [participant?.metadata]);

  const avatarUrl = metadata?.avatar || "";

  // Only process if trackRef exists and is a camera track
  const isCameraTrack = trackRef?.source === Track.Source.Camera;
  const hasVideo =
    isCameraTrack &&
    trackRef?.publication?.isSubscribed &&
    !trackRef?.publication?.isMuted;

  // Show custom avatar only when it's a camera track and video is off
  const showAvatar = isCameraTrack && !hasVideo;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Use default ParticipantTile */}
      <ParticipantTile />

      {/* Overlay avatar when video is off */}
      {showAvatar && participant && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--lk-bg2)",
            zIndex: 1,
            borderRadius: "12px",
          }}
        >
          {/* Avatar in center */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={participant.name || "User"}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--lk-border-color)",
              }}
            />
          ) : (
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
              {participant.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {/* Participant info at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px",
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {/* Participant Name */}
            <ParticipantName
              style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}
            />

            {/* Microphone Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {participant.isMicrophoneEnabled ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
