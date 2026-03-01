import React from "react";
import {
  useEnsureTrackRef,
  ParticipantTile,
  useIsSpeaking,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useParticipantData } from "./useParticipantData";
import { AvatarDisplay } from "./AvatarDisplay";
import { ParticipantInfo } from "./ParticipantInfo";

export const CustomParticipantTile: React.FC = () => {
  const trackRef = useEnsureTrackRef();
  const { participant, avatarUrl } = useParticipantData();
  const isSpeaking = useIsSpeaking(participant);

  const isCameraTrack = trackRef?.source === Track.Source.Camera;
  const hasVideo =
    isCameraTrack &&
    trackRef?.publication?.isSubscribed &&
    !trackRef?.publication?.isMuted;
  const showAvatar = isCameraTrack && !hasVideo;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: isSpeaking ? "3px solid #3b82f6" : "3px solid transparent",
        boxShadow: isSpeaking
          ? "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)"
          : "none",
        transition: "all 0.05s ease-out",
      }}
    >
      <ParticipantTile />
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
          <AvatarDisplay
            avatarUrl={avatarUrl}
            participantName={participant.name || ""}
          />
          <ParticipantInfo participant={participant} />
        </div>
      )}
    </div>
  );
};
