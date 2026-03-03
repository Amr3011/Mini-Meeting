import React from "react";
import {
  RoomAudioRenderer,
  useTracks,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { MeetingHeader } from "../MeetingHeader";
import { LobbyRequests } from "../LobbyRequests";
import { VideoSection } from "./VideoSection";
import { useMeetingChat } from "./useMeetingChat";
import type { MeetingContentProps } from "./types";

export const MeetingContent: React.FC<MeetingContentProps> = ({
  meetingCode,
  isAdmin,
  meetingId,
  onDisconnect,
  isAdminPanelOpen,
  setIsAdminPanelOpen,
}) => {
  const participants = useParticipants();
  const { isChatOpen, setIsChatOpen, unreadCount } = useMeetingChat();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const hasScreenShare = tracks.some(
    (track) => track.source === Track.Source.ScreenShare,
  );

  const toggleAdmin = () => {
    if (isAdminPanelOpen) {
      setIsAdminPanelOpen(false);
    } else {
      setIsChatOpen(false);
      setIsAdminPanelOpen(true);
    }
  };

  const toggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsAdminPanelOpen(false);
      setIsChatOpen(true);
    }
  };

  return (
    <>
      <RoomAudioRenderer />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <MeetingHeader
          isAdmin={isAdmin}
          isAdminPanelOpen={isAdminPanelOpen}
          participants={participants}
          onAdminToggle={toggleAdmin}
        />
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <VideoSection
            tracks={tracks}
            hasScreenShare={hasScreenShare}
            meetingCode={meetingCode}
            isAdmin={isAdmin}
            meetingId={meetingId}
            isChatOpen={isChatOpen}
            isAdminPanelOpen={isAdminPanelOpen}
            unreadCount={unreadCount}
            onToggleChat={toggleChat}
            onToggleAdmin={toggleAdmin}
            onChatClose={() => setIsChatOpen(false)}
            onAdminClose={() => setIsAdminPanelOpen(false)}
            onEndMeeting={() => onDisconnect?.()}
          />
        </div>
      </div>
      <LobbyRequests meetingCode={meetingCode} isAdmin={isAdmin} />
    </>
  );
};
