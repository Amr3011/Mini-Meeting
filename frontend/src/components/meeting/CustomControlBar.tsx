import React from "react";
import { TrackToggle, DisconnectButton } from "@livekit/components-react";
import { Track } from "livekit-client";

interface CustomControlBarProps {
  isChatOpen: boolean;
  onChatToggle: () => void;
}

/**
 * Custom Control Bar Component
 * Media controls + Leave centered, Chat at far right
 */
export const CustomControlBar: React.FC<CustomControlBarProps> = ({
  isChatOpen,
  onChatToggle,
}) => {
  return (
    <div
      className="lk-control-bar"
      style={{
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Center Group - Media Controls + Leave في النص */}
      <div className="lk-button-group" style={{ gap: "12px" }}>
        <TrackToggle source={Track.Source.Microphone} showIcon={true} />
        <TrackToggle source={Track.Source.Camera} showIcon={true} />
        <TrackToggle source={Track.Source.ScreenShare} showIcon={true} />
        <DisconnectButton>Leave</DisconnectButton>
      </div>

      {/* Chat - أقصى اليمين */}
      <button
        className="lk-button lk-button-menu"
        onClick={onChatToggle}
        title="Toggle Chat"
        aria-pressed={isChatOpen}
        style={{
          position: "absolute",
          right: "16px",
          backgroundColor: isChatOpen ? "var(--lk-accent)" : "var(--lk-bg2)",
          border: "1px solid var(--lk-border-color)",
        }}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          style={{ flexShrink: 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="lk-button-label">Chat</span>
      </button>
    </div>
  );
};
