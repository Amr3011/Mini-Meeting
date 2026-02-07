import React, { useState, useEffect } from "react";
import { type DevicePreferences } from "./MeetingLobby";
import type { LiveKitTokenResponse } from "../services/api/livekit.service";
import {
  LiveKitRoom,
  useRoomContext,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { DisconnectReason, VideoPresets, Track } from "livekit-client";
import { ERROR_MESSAGES } from "../utils/constants";

/**
 * Inner component that has access to room context
 * Applies device preferences after room is connected
 */
const MeetingRoomContent: React.FC<{
  devicePreferences: DevicePreferences;
}> = ({ devicePreferences }) => {
  const room = useRoomContext();
  const [devicesApplied, setDevicesApplied] = useState(false);

  // Get all tracks (video and audio) from all participants
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Apply device preferences when room is ready
  useEffect(() => {
    if (room && room.state === "connected" && !devicesApplied) {
      const applyDevices = async () => {
        try {
          const localParticipant = room.localParticipant;

          // Switch video device
          if (devicePreferences.videoDeviceId) {
            await room.switchActiveDevice("videoinput", devicePreferences.videoDeviceId);
          }

          // Switch audio input device
          if (devicePreferences.audioDeviceId) {
            await room.switchActiveDevice("audioinput", devicePreferences.audioDeviceId);
          }

          // Switch audio output device (speaker)
          if (devicePreferences.audioOutputDeviceId) {
            await room.switchActiveDevice("audiooutput", devicePreferences.audioOutputDeviceId);
          }

          // Set initial camera state
          await localParticipant.setCameraEnabled(devicePreferences.videoEnabled);

          // Set initial microphone state
          await localParticipant.setMicrophoneEnabled(devicePreferences.audioEnabled);

          setDevicesApplied(true);
          console.log("Device preferences applied successfully");
        } catch (error) {
          console.error("Error applying device preferences:", error);
          // Continue anyway - user can adjust devices in the meeting UI
        }
      };

      applyDevices();
    }
  }, [room, devicePreferences, devicesApplied]);

  return (
    <div 
      style={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a'
      }}
    >
      {/* Video grid - takes remaining space */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <GridLayout tracks={tracks} style={{ height: '100%' }}>
          <ParticipantTile />
        </GridLayout>
      </div>
      
      {/* Control bar - fixed at bottom */}
      <div style={{ 
        width: '100%', 
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <ControlBar variation="verbose" />
      </div>
      
      <RoomAudioRenderer />
    </div>
  );
};

/**
 * MeetingRoom component displays the LiveKit video conference
 * Receives device preferences and token data as props
 * Handles disconnection and navigation through onLeave callback
 */
interface MeetingRoomProps {
  devicePreferences: DevicePreferences;
  tokenData: LiveKitTokenResponse;
  onLeave: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  devicePreferences,
  tokenData,
  onLeave,
}) => {
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);

  // Handle disconnection from LiveKit
  const handleDisconnect = (reason?: DisconnectReason) => {
    console.log("Disconnected from meeting:", reason);

    // Set user-friendly disconnect message
    let message = null;
    if (reason === DisconnectReason.CLIENT_INITIATED) {
      message = "You left the meeting";
    } else if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
      message = "You were removed from the meeting";
    } else if (reason === DisconnectReason.ROOM_DELETED) {
      message = "The meeting has ended";
    } else if (reason === DisconnectReason.STATE_MISMATCH) {
      message = ERROR_MESSAGES.MEETING_CONNECTION_FAILED;
    } else if (reason === DisconnectReason.JOIN_FAILURE) {
      message = ERROR_MESSAGES.MEETING_CONNECTION_FAILED;
    } else {
      message = ERROR_MESSAGES.NETWORK_ERROR;
    }

    setDisconnectReason(message);

    // Delay navigation to show message
    setTimeout(() => {
      onLeave();
    }, 2000);
  };

  // Show disconnect message
  if (disconnectReason) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4" role="alert" aria-live="assertive">
        <div className="text-center max-w-md w-full">
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 animate-fade-in">
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto bg-warning-500/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-warning-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-warning-500/20 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-white text-2xl font-semibold mb-3">{disconnectReason}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span>Redirecting</span>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render full-screen meeting room
  return (
    <div 
      className="fixed inset-0 z-50 bg-gray-900" 
      role="main" 
      aria-label="Meeting room"
      style={{ 
        height: '100vh', 
        width: '100vw', 
        margin: 0, 
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <LiveKitRoom
        token={tokenData.token}
        serverUrl={tokenData.url}
        connect={true}
        onDisconnected={handleDisconnect}
        video={devicePreferences.videoEnabled}
        audio={devicePreferences.audioEnabled}
        options={{
          // Video quality settings - High quality with simulcast
          videoCaptureDefaults: {
            deviceId: devicePreferences.videoDeviceId,
            resolution: {
              width: 1280,
              height: 720,
              frameRate: 30,
            },
          },
          // Audio quality settings - High quality audio
          audioCaptureDefaults: {
            deviceId: devicePreferences.audioDeviceId,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          audioOutput: {
            deviceId: devicePreferences.audioOutputDeviceId,
          },
          // Adaptive streaming - automatically adjusts quality based on network
          adaptiveStream: true,
          // Dynacast - only sends layers that are being consumed
          dynacast: true,
          // Publish defaults for optimal quality
          publishDefaults: {
            videoEncoding: {
              maxBitrate: 3_000_000, // 3 Mbps for high quality
              maxFramerate: 30,
            },
            screenShareEncoding: {
              maxBitrate: 5_000_000, // 5 Mbps for screen share (higher for clarity)
              maxFramerate: 15,
            },
            // Simulcast - sends multiple quality versions using predefined presets
            videoSimulcastLayers: [
              VideoPresets.h720,    // High quality layer (1280x720)
              VideoPresets.h360,    // Medium quality layer (640x360)
              VideoPresets.h180,    // Low quality layer (320x180)
            ],
            screenShareSimulcastLayers: [
              VideoPresets.h1080,   // High quality for screen share (1920x1080)
              VideoPresets.h720,    // Lower quality fallback (1280x720)
            ],
          },
        }}
        style={{ 
          height: '100%', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <MeetingRoomContent
          devicePreferences={devicePreferences}
        />
      </LiveKitRoom>
    </div>
  );
};
