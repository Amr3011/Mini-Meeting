import React from "react";
import { SummarizerControls } from "../SummarizerControls";
import { CustomControlBar } from "../CustomControlBar";
import { ChatButton } from "./ChatButton";
import type { ControlBarSectionProps } from "./types";

export const ControlBarSection: React.FC<ControlBarSectionProps> = ({
  meetingId,
  isAdmin,
  isChatOpen,
  unreadCount,
  onToggleChat,
}) => {
  return (
    <div
      className="lk-control-bar-wrapper"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "8px 12px",
        flexWrap: "wrap",
      }}
    >
      {/* Summarizer Controls */}
      <div style={{ flexShrink: 0, order: 1 }}>
        {meetingId && (
          <SummarizerControls
            meetingId={meetingId}
            isAdmin={isAdmin}
            inline={true}
          />
        )}
      </div>

      {/* Media Controls */}
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          justifyContent: "center",
          order: 2,
          minWidth: 0,
        }}
      >
        <CustomControlBar />
      </div>

      {/* Chat Button */}
      <div style={{ flexShrink: 0, order: 3 }}>
        <ChatButton
          isChatOpen={isChatOpen}
          unreadCount={unreadCount}
          onToggle={onToggleChat}
        />
      </div>
    </div>
  );
};
