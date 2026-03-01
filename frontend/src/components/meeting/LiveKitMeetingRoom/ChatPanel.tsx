import React from "react";
import { Chat } from "@livekit/components-react";
import { SidebarPanel } from "../SidebarPanel";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div style={{ display: isOpen ? "flex" : "none" }}>
      <SidebarPanel title="In-call messages" onClose={onClose}>
        <Chat
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        />
      </SidebarPanel>
    </div>
  );
};
