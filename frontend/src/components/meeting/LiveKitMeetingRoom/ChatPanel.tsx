import React from "react";
import { Chat } from "@livekit/components-react";
import { SidebarPanel } from "../SidebarPanel";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div style={{ display: isOpen ? "contents" : "none" }}>
      <SidebarPanel title="In-call messages" onClose={onClose}>
        <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
          <Chat />
        </div>
      </SidebarPanel>
    </div>
  );
};
