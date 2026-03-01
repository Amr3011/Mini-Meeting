import React, { useState, useEffect, useMemo } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import "../ChatSidebar.css";
import "../Sidebar.css";
import "../ScreenShareLayout.css";
import { DisconnectReason } from "livekit-client";
import { ErrorMessage } from "../../common/ErrorMessage";
import { DisconnectMessage } from "../DisconnectMessage";
import { meetingService } from "../../../services/api/meeting.service";
import { MeetingView } from "./MeetingView";
import { LIVEKIT_OPTIONS } from "./config";
import { parseTokenMetadata, getDisconnectMessage } from "./utils";
import type { LiveKitMeetingRoomProps } from "./types";

const LiveKitMeetingRoom: React.FC<LiveKitMeetingRoomProps> = ({
  meetingCode,
  devicePreferences,
  token,
  livekitUrl,
  onDisconnect,
  meetingId,
}) => {
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  const isAdmin = useMemo(() => parseTokenMetadata(token).isAdmin, [token]);

  useEffect(() => {
    if (disconnectReason) {
      const timer = setTimeout(() => {
        onDisconnect?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [disconnectReason, onDisconnect]);

  const handleDisconnect = (reason?: DisconnectReason) => {
    if (isAdmin && meetingId) {
      meetingService
        .stopSummarizer(meetingId)
        .catch((err) =>
          console.error("Failed to stop summarizer on disconnect:", err),
        );
    }

    setDisconnectReason(getDisconnectMessage(reason));
  };

  if (!token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <div className="max-w-md">
          <ErrorMessage message="Failed to connect to meeting. Please try again." />
        </div>
      </div>
    );
  }

  if (disconnectReason) {
    return <DisconnectMessage reason={disconnectReason} />;
  }

  return (
    <div className="h-screen w-screen bg-[#0f1219]">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio={devicePreferences.audioEnabled}
        video={devicePreferences.videoEnabled}
        onDisconnected={handleDisconnect}
        data-lk-theme="default"
        style={{ height: "100%" }}
        options={LIVEKIT_OPTIONS}
      >
        <MeetingView
          meetingCode={meetingCode}
          isAdmin={isAdmin}
          meetingId={meetingId}
          onDisconnect={onDisconnect}
        />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitMeetingRoom;
