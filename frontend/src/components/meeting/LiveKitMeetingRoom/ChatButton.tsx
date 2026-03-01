import React from "react";
import type { ChatButtonProps } from "./types";

export const ChatButton: React.FC<ChatButtonProps> = ({
  isChatOpen,
  unreadCount,
  onToggle,
}) => {
  return (
    <button
      className="lk-button"
      onClick={onToggle}
      title="Toggle Chat"
      aria-pressed={isChatOpen}
      style={{
        backgroundColor: isChatOpen ? "var(--lk-accent)" : "var(--lk-bg2)",
        border: "1px solid var(--lk-border-color)",
        position: "relative",
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
      <span className="lk-button-label hidden sm:inline">Chat</span>
      {/* Unread message badge */}
      {!isChatOpen && unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            backgroundColor: "#dc2626",
            color: "white",
            fontSize: "10px",
            fontWeight: "600",
            padding: "2px 6px",
            borderRadius: "10px",
            minWidth: "20px",
            textAlign: "center",
            lineHeight: "1.2",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
