import React from "react";
import { useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackControlsProps } from "./types";
import { MicIcon, CameraIcon } from "./icons";
import { TrackButton } from "./TrackButton";
import { ScreenShareIndicator } from "./ScreenShareIndicator";

/**
 * Track controls for participant
 * Shows buttons to mute/unmute mic, camera, and screen share indicator
 */
export const TrackControls: React.FC<TrackControlsProps> = ({
  participant,
  isLocal,
  onMuteTrack,
}) => {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare],
    { onlySubscribed: false },
  ).filter((track) => track.participant.identity === participant.identity);

  const audioTrack = tracks.find((t) => t.source === Track.Source.Microphone);
  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);

  if (isLocal) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
      }}
    >
      {audioTrack && (
        <TrackButton
          onClick={() =>
            onMuteTrack(
              audioTrack.publication.trackSid,
              !audioTrack.publication.isMuted,
            )
          }
          title={audioTrack.publication.isMuted ? "Unmute mic" : "Mute mic"}
          isMuted={audioTrack.publication.isMuted}
          icon={<MicIcon isMuted={audioTrack.publication.isMuted} />}
          label="Mic"
        />
      )}

      {videoTrack && (
        <TrackButton
          onClick={() =>
            onMuteTrack(
              videoTrack.publication.trackSid,
              !videoTrack.publication.isMuted,
            )
          }
          title={videoTrack.publication.isMuted ? "Unmute cam" : "Mute cam"}
          isMuted={videoTrack.publication.isMuted}
          icon={<CameraIcon isMuted={videoTrack.publication.isMuted} />}
          label="Cam"
        />
      )}

      {screenTrack && <ScreenShareIndicator />}
    </div>
  );
};
