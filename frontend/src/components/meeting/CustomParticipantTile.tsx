import React, { useMemo } from "react";
import {
  useEnsureTrackRef,
  useEnsureParticipant,
  ParticipantTile,
  VideoTrack,
  AudioTrack,
  ConnectionQualityIndicator,
  TrackMutedIndicator,
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
  const hasVideo =
    trackRef?.publication?.isSubscribed &&
    !trackRef?.publication?.isMuted &&
    trackRef?.source === Track.Source.Camera;

  // Show custom avatar only when camera is off
  const showAvatar = !hasVideo && trackRef?.source === Track.Source.Camera;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--lk-bg2)",
            zIndex: 1,
          }}
        >
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
        </div>
      )}
    </div>
  );
};
