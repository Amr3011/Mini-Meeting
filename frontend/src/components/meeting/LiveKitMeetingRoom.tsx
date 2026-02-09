import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import {
  VideoPresets,
  ScreenSharePresets,
} from 'livekit-client';
import { useLiveKit } from '../../hooks/useLiveKit';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';

interface LiveKitMeetingRoomProps {
  meetingCode: string;
  userName?: string;
  onDisconnect?: () => void;
}

/**
 * LiveKit Meeting Room Component
 * Handles video conferencing for a meeting using LiveKit
 */
const LiveKitMeetingRoom: React.FC<LiveKitMeetingRoomProps> = ({
  meetingCode,
  userName,
  onDisconnect,
}) => {
  const {
    token,
    livekitUrl,
    isLoading,
    error,
  } = useLiveKit({
    meetingCode,
    userName,
    autoConnect: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <Loading text="Connecting to meeting..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <div className="max-w-md">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <div className="max-w-md">
          <ErrorMessage message="Failed to connect to meeting. Please try again." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f1219]">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        onDisconnected={onDisconnect}
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
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitMeetingRoom;
