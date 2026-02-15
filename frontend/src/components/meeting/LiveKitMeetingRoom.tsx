import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import {
  VideoPresets,
  ScreenSharePresets,
  DisconnectReason,
} from 'livekit-client';
import { ErrorMessage } from '../common/ErrorMessage';
import { AdminControls } from './AdminControls';
import { LobbyRequests } from './LobbyRequests';
import { SummarizerControls } from './SummarizerControls';
import { DisconnectMessage } from './DisconnectMessage';
import type { DevicePreferences } from '../../pages/MeetingLobby';
import { useState, useEffect, useMemo } from 'react';

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
      const payload = JSON.parse(atob(token.split('.')[1]));
      const metadata = payload.metadata ? JSON.parse(payload.metadata) : {};
      return metadata.role === 'admin';
    } catch (e) {
      console.error('Failed to parse token metadata:', e);
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
    let message = 'You left the meeting';

    if (reason === DisconnectReason.SERVER_SHUTDOWN) {
      message = 'Meeting ended by host';
    } else if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
      message = 'You were removed from the meeting';
    } else if (reason === DisconnectReason.ROOM_DELETED) {
      message = 'Meeting ended by host';
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
        style={{ height: '100%' }}
        options={{
          // --- Publish settings ---
          publishDefaults: {
            // Enable simulcast: sends multiple resolution layers so the SFU
            // can forward the best layer per subscriber
            simulcast: true,
            videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],

            // VP9 with SVC gives better quality at lower bitrates than VP8
            videoCodec: 'vp9',
            // SVC scalability mode: 3 spatial layers, 3 temporal layers
            scalabilityMode: 'L3T3_KEY',
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
            screenShareSimulcastLayers: [
              ScreenSharePresets.h720fps15,
            ],

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
        <VideoConference />
        <AdminControls
          meetingCode={meetingCode}
          isAdmin={isAdmin}
          onEndMeeting={() => onDisconnect?.()}
        />
        <LobbyRequests
          meetingCode={meetingCode}
          isAdmin={isAdmin}
        />
        {meetingId && (
          <SummarizerControls
            meetingId={meetingId}
            isAdmin={isAdmin}
          />
        )}
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitMeetingRoom;
