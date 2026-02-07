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
  Chat,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { DisconnectReason, VideoPresets, Track } from "livekit-client";
import { ERROR_MESSAGES } from "../utils/constants";
import { DisconnectMessage } from "../components/meeting/DisconnectMessage";

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
    <div className="h-full w-full relative flex flex-row bg-slate-900 text-white">
      {/* Main video area with grid and controls */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video grid - takes remaining space */}
        <div className="flex-1 overflow-hidden relative">
          <GridLayout tracks={tracks} className="h-full [&_.lk-participant-name]:text-white [&_.lk-participant-metadata]:text-white [&_.lk-participant-metadata-item]:text-gray-300">
            <ParticipantTile />
          </GridLayout>
        </div>

        {/* Control bar - fixed at bottom */}
        <div className="w-full p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 [&_.lk-button]:text-white [&_.lk-button-group-menu-item]:text-white">
          <ControlBar variation="verbose" />
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="w-96 border-l border-slate-700/50 flex flex-col bg-slate-800 [&_.lk-chat-entry]:text-white [&_.lk-chat-entry__name]:text-gray-300 [&_.lk-chat-entry__message]:text-white [&_.lk-form-control]:text-white [&_.lk-form-control]:bg-slate-700 [&_.lk-form-control::placeholder]:text-gray-400 [&_.lk-chat-header]:text-white [&_.lk-button]:text-white">
        <Chat />
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
    return <DisconnectMessage reason={disconnectReason} />;
  }

  // Render full-screen meeting room
  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900 h-screen w-screen m-0 p-0 overflow-hidden text-white"
      role="main"
      aria-label="Meeting room"
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
        className="h-full w-full flex flex-col relative"
      >
        <MeetingRoomContent
          devicePreferences={devicePreferences}
        />
      </LiveKitRoom>
    </div>
  );
};
