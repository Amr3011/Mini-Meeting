import React, { useState } from "react";
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import { Track, Participant } from "livekit-client";
import {
  removeParticipant,
  muteParticipant,
  endMeeting,
} from "../../services/api/livekit.service";

interface AdminControlsProps {
  meetingCode: string;
  isAdmin: boolean;
  onEndMeeting: () => void;
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  meetingCode,
  isAdmin,
  onEndMeeting,
}) => {
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  if (!isAdmin) {
    return null;
  }

  const handleKickParticipant = async (identity: string) => {
    try {
      await removeParticipant(meetingCode, identity);
    } catch (error) {
      console.error("Failed to kick participant:", error);
      alert("Failed to kick participant");
    }
  };

  const handleMuteTrack = async (
    identity: string,
    trackSid: string,
    muted: boolean,
  ) => {
    try {
      await muteParticipant(meetingCode, identity, trackSid, muted);
    } catch (error) {
      console.error("Failed to mute participant:", error);
      alert("Failed to mute participant");
    }
  };

  const handleEndMeeting = async () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true);
      return;
    }

    setIsEndingMeeting(true);
    try {
      await endMeeting(meetingCode);
      onEndMeeting();
    } catch (error) {
      console.error("Failed to end meeting:", error);
      alert("Failed to end meeting");
      setIsEndingMeeting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* End Meeting Button */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--lk-border-color)",
          flexShrink: 0,
        }}
      >
        {showEndConfirm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "13px", color: "#fbbf24" }}>
              Are you sure? This will disconnect all participants.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleEndMeeting}
                disabled={isEndingMeeting}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isEndingMeeting ? "not-allowed" : "pointer",
                  opacity: isEndingMeeting ? 0.6 : 1,
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{isEndingMeeting ? "Ending..." : "Confirm End"}</span>
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                disabled={isEndingMeeting}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "var(--lk-bg3)",
                  color: "var(--lk-fg)",
                  border: "1px solid var(--lk-border-color)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleEndMeeting}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 12px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <svg
              style={{ width: "16px", height: "16px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>End Meeting for All</span>
          </button>
        )}
      </div>

      {/* Participants List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        <h4
          style={{
            fontSize: "13px",
            color: "var(--lk-fg2)",
            marginBottom: "12px",
            fontWeight: 500,
          }}
        >
          Participants ({participants.length})
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {participants.map((participant) => {
            const isLocal = participant.identity === localParticipant.identity;
            const metadata = participant.metadata
              ? JSON.parse(participant.metadata)
              : {};
            const role = metadata.role || "guest";

            return (
              <ParticipantItem
                key={participant.identity}
                participant={participant}
                isLocal={isLocal}
                role={role}
                onKick={() => handleKickParticipant(participant.identity)}
                onMuteTrack={(trackSid, muted) =>
                  handleMuteTrack(participant.identity, trackSid, muted)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ParticipantItemProps {
  participant: Participant;
  isLocal: boolean;
  role: string;
  onKick: () => void;
  onMuteTrack: (trackSid: string, muted: boolean) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  role,
  onKick,
  onMuteTrack,
}) => {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare],
    { onlySubscribed: false },
  ).filter((track) => track.participant.identity === participant.identity);

  const audioTrack = tracks.find((t) => t.source === Track.Source.Microphone);
  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);

  return (
    <div
      style={{
        backgroundColor: "var(--lk-bg3)",
        borderRadius: "6px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Participant Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "2px",
            }}
          >
            <p
              style={{
                color: "var(--lk-fg)",
                fontSize: "14px",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: 0,
              }}
            >
              {participant.name || participant.identity}
            </p>
            {isLocal && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#4ade80",
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 500,
                }}
              >
                You
              </span>
            )}
            {role === "admin" && (
              <span
                style={{
                  fontSize: "10px",
                  color: "#60a5fa",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 500,
                }}
              >
                Admin
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--lk-fg2)",
              margin: 0,
            }}
          >
            {role}
          </p>
        </div>
        {!isLocal && (
          <button
            onClick={onKick}
            title="Kick participant"
            style={{
              padding: "6px",
              color: "#f87171",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              style={{ width: "16px", height: "16px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Track Controls */}
      {!isLocal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {/* Microphone */}
          {audioTrack && (
            <button
              onClick={() =>
                onMuteTrack(
                  audioTrack.publication.trackSid,
                  !audioTrack.publication.isMuted,
                )
              }
              title={
                audioTrack.publication.isMuted
                  ? "Unmute microphone"
                  : "Mute microphone"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                fontSize: "11px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                backgroundColor: audioTrack.publication.isMuted
                  ? "rgba(220, 38, 38, 0.2)"
                  : "var(--lk-bg)",
                color: audioTrack.publication.isMuted
                  ? "#f87171"
                  : "var(--lk-fg2)",
              }}
            >
              {audioTrack.publication.isMuted ? (
                <svg
                  style={{ width: "12px", height: "12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  style={{ width: "12px", height: "12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
              <span>Mic</span>
            </button>
          )}

          {/* Camera */}
          {videoTrack && (
            <button
              onClick={() =>
                onMuteTrack(
                  videoTrack.publication.trackSid,
                  !videoTrack.publication.isMuted,
                )
              }
              title={
                videoTrack.publication.isMuted ? "Unmute camera" : "Mute camera"
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                fontSize: "11px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                backgroundColor: videoTrack.publication.isMuted
                  ? "rgba(220, 38, 38, 0.2)"
                  : "var(--lk-bg)",
                color: videoTrack.publication.isMuted
                  ? "#f87171"
                  : "var(--lk-fg2)",
              }}
            >
              {videoTrack.publication.isMuted ? (
                <svg
                  style={{ width: "12px", height: "12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  style={{ width: "12px", height: "12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
              <span>Cam</span>
            </button>
          )}

          {/* Screen Share - Show info badge instead of stop button */}
          {screenTrack && (
            <div
              title="To stop screen share, remove the participant"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                fontSize: "11px",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                borderRadius: "4px",
              }}
            >
              <svg
                style={{ width: "12px", height: "12px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Sharing Screen</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
