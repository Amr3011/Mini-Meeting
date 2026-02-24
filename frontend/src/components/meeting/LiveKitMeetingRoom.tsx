import { useState, useEffect, useMemo } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  useTracks,
  useParticipants,
  LayoutContextProvider,
  Chat,
  useChat,
} from "@livekit/components-react";
import "@livekit/components-styles";
import "./ChatSidebar.css";
import "./Sidebar.css";
import "./ScreenShareLayout.css";
import {
  VideoPresets,
  ScreenSharePresets,
  DisconnectReason,
  Track,
} from "livekit-client";
import { ErrorMessage } from "../common/ErrorMessage";
import { AdminControls } from "./AdminControls";
import { LobbyRequests } from "./LobbyRequests";
import { SummarizerControls } from "./SummarizerControls";
import { DisconnectMessage } from "./DisconnectMessage";
import { CustomControlBar } from "./CustomControlBar";
import { MeetingHeader } from "./MeetingHeader";
import { SidebarPanel } from "./SidebarPanel";
import { CustomParticipantTile } from "./CustomParticipantTile";
import type { DevicePreferences } from "../../pages/MeetingLobby";
import { meetingService } from "../../services/api/meeting.service";

interface LiveKitMeetingRoomProps {
  meetingCode: string;
  userName?: string;
  devicePreferences: DevicePreferences;
  token: string;
  livekitUrl: string;
  onDisconnect?: () => void;
  meetingId?: number; // Add meetingId prop
}

/**
 * LiveKit Meeting Room Component
 * Handles video conferencing for a meeting using LiveKit
 */
const LiveKitMeetingRoom: React.FC<LiveKitMeetingRoomProps> = ({
  meetingCode,
  devicePreferences,
  token,
  livekitUrl,
  onDisconnect,
  meetingId,
}) => {
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  // Extract admin role from token metadata
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const metadata = payload.metadata ? JSON.parse(payload.metadata) : {};
      return metadata.role === "admin";
    } catch (e) {
      console.error("Failed to parse token metadata:", e);
      return false;
    }
  }, [token]);

  // Handle disconnect with redirect after showing message
  useEffect(() => {
    if (disconnectReason) {
      const timer = setTimeout(() => {
        onDisconnect?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [disconnectReason, onDisconnect]);

  const handleDisconnect = (reason?: DisconnectReason) => {
    // Stop summarizer if admin leaves
    if (isAdmin && meetingId) {
      meetingService
        .stopSummarizer(meetingId)
        .catch((err) =>
          console.error("Failed to stop summarizer on disconnect:", err),
        );
    }

    let message = "You left the meeting";

    if (reason === DisconnectReason.SERVER_SHUTDOWN) {
      message = "Meeting ended by host";
    } else if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
      message = "You were removed from the meeting";
    } else if (reason === DisconnectReason.ROOM_DELETED) {
      message = "Meeting ended by host";
    }

    setDisconnectReason(message);
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

  // Show disconnect message if disconnected
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
        options={{
          // --- Publish settings ---
          publishDefaults: {
            // Enable simulcast: sends multiple resolution layers so the SFU
            // can forward the best layer per subscriber
            simulcast: true,
            videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],

            // VP9 with SVC gives better quality at lower bitrates than VP8
            videoCodec: "vp9",
            // SVC scalability mode: 3 spatial layers, 3 temporal layers
            scalabilityMode: "L3T3_KEY",
            // Auto-fallback to VP8 for browsers that don't support VP9
            backupCodec: true,

            // Primary camera encoding cap (applied to the highest layer)
            videoEncoding: {
              maxBitrate: 1_700_000, // 1.7 Mbps for 720p
              maxFramerate: 30,
            },

            // Screen share encoding — high bitrate for crisp text/code
            screenShareEncoding: {
              maxBitrate: 3_000_000, // 3 Mbps
              maxFramerate: 30,
            },
            screenShareSimulcastLayers: [ScreenSharePresets.h720fps15],

            // Audio: higher quality preset
            dtx: true, // Discontinuous transmission saves bandwidth in silence
            red: true, // Redundant audio for packet loss resilience
          },

          // --- Capture settings ---
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution, // 1280×720 @ 30fps
          },

          // Dynamic broadcast — stop sending layers nobody is watching
          dynacast: true,
          // Adaptive stream — auto-adjust subscribed quality per viewer's tile size
          adaptiveStream: true,
        }}
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

/**
 * Meeting View Component with custom control bar
 */
interface MeetingViewProps {
  meetingCode: string;
  isAdmin: boolean;
  meetingId?: number;
  onDisconnect?: () => void;
}

const MeetingView: React.FC<MeetingViewProps> = ({
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

const MeetingContent: React.FC<
  MeetingViewProps & {
    isAdminPanelOpen: boolean;
    setIsAdminPanelOpen: (open: boolean) => void;
  }
> = ({
  meetingCode,
  isAdmin,
  meetingId,
  onDisconnect,
  isAdminPanelOpen,
  setIsAdminPanelOpen,
}) => {
  const participants = useParticipants();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { chatMessages } = useChat();
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  // Calculate unread messages
  const unreadCount = chatMessages.length - lastReadMessageCount;

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  // Mark messages as read when chat is open
  useEffect(() => {
    if (isChatOpen) {
      setLastReadMessageCount(chatMessages.length);
    }
  }, [isChatOpen, chatMessages.length]);

  // Check if there's a screen share active
  const hasScreenShare = tracks.some(
    (track) => track.source === Track.Source.ScreenShare,
  );

  const toggleAdmin = () => {
    if (isAdminPanelOpen) {
      setIsAdminPanelOpen(false);
    } else {
      setIsChatOpen(false); // إغلاق Chat
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

      {/* Main Layout - Flex container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Top Header Bar */}
        <MeetingHeader
          isAdmin={isAdmin}
          isAdminPanelOpen={isAdminPanelOpen}
          participants={participants}
          onAdminToggle={toggleAdmin}
        />

        {/* Content Area - Video + Sidebars */}
        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Video Section */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {/* Video Grid + Sidebars Container */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              {/* Video Grid */}
              <div
                className="lk-video-conference-inner"
                style={{ flex: 1, minWidth: 0 }}
              >
                <div
                  className="lk-grid-layout-wrapper"
                  style={{ height: "100%" }}
                >
                  {hasScreenShare ? (
                    <FocusLayoutContainer>
                      <CarouselLayout tracks={tracks}>
                        <CustomParticipantTile />
                      </CarouselLayout>
                      <FocusLayout
                        trackRef={tracks.find(
                          (t) => t.source === Track.Source.ScreenShare,
                        )}
                      />
                    </FocusLayoutContainer>
                  ) : (
                    <GridLayout tracks={tracks}>
                      <CustomParticipantTile />
                    </GridLayout>
                  )}
                </div>
              </div>

              {/* Chat Panel - Always mounted to preserve messages */}
              <div style={{ display: isChatOpen ? "flex" : "none" }}>
                <SidebarPanel
                  title="In-call messages"
                  onClose={() => setIsChatOpen(false)}
                >
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

              {/* Admin Panel */}
              {isAdminPanelOpen && (
                <SidebarPanel
                  title="Admin Controls"
                  onClose={() => setIsAdminPanelOpen(false)}
                >
                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <AdminControls
                      meetingCode={meetingCode}
                      isAdmin={isAdmin}
                      onEndMeeting={() => onDisconnect?.()}
                      isOpen={true}
                      onClose={() => {}}
                      hideHeader={true}
                    />
                  </div>
                </SidebarPanel>
              )}
            </div>

            {/* Control Bar - Full Width تحت خالص */}
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
              {/* Summarizer Controls - أقصى اليسار */}
              <div style={{ flexShrink: 0, order: 1 }}>
                {meetingId && (
                  <SummarizerControls
                    meetingId={meetingId}
                    isAdmin={isAdmin}
                    inline={true}
                  />
                )}
              </div>

              {/* Media Controls - في النص */}
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

              {/* Chat Button - أقصى اليمين */}
              <div style={{ flexShrink: 0, order: 3 }}>
                <button
                  className="lk-button"
                  onClick={toggleChat}
                  title="Toggle Chat"
                  aria-pressed={isChatOpen}
                  style={{
                    backgroundColor: isChatOpen
                      ? "var(--lk-accent)"
                      : "var(--lk-bg2)",
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lobby Requests */}
      <LobbyRequests meetingCode={meetingCode} isAdmin={isAdmin} />
    </>
  );
};

export default LiveKitMeetingRoom;