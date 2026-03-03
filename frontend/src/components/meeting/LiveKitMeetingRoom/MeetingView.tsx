import React, { useState } from "react";
import { LayoutContextProvider } from "@livekit/components-react";
import { MeetingContent } from "./MeetingContent";
import type { MeetingViewProps } from "./types";

export const MeetingView: React.FC<MeetingViewProps> = ({
  meetingCode,
  isAdmin,
  meetingId,
  onDisconnect,
}) => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <div className="lk-video-conference" style={{ height: "100%" }}>
      <LayoutContextProvider>
        <MeetingContent
          meetingCode={meetingCode}
          isAdmin={isAdmin}
          meetingId={meetingId}
          onDisconnect={onDisconnect}
          isAdminPanelOpen={isAdminPanelOpen}
          setIsAdminPanelOpen={setIsAdminPanelOpen}
        />
      </LayoutContextProvider>
    </div>
  );
};
