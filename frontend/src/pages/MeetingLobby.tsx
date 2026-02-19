import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { DeviceErrorMessage } from "../components/common/DeviceErrorMessage";
import DeviceSelector from "../components/meeting/DeviceSelector";
import AudioLevelIndicator from "../components/meeting/AudioLevelIndicator";
import JoiningOverlay from "../components/meeting/JoiningOverlay";
import MediaControls from "../components/meeting/MediaControls";
import MeetingInfoBar from "../components/meeting/MeetingInfoBar";
import { WaitingRoom } from "../components/meeting/WaitingRoom";
import { useAuth } from "../hooks/useAuth";
import { useLobbyDevices } from "../hooks/useLobbyDevices";
import { meetingService } from "../services/api/meeting.service";
import { requestToJoin } from "../services/api/lobby.service";
import { getParticipantCount } from "../services/api/livekit.service";
import type { Meeting } from "../types/meeting.types";
import { ERROR_MESSAGES } from "../utils/constants";

export interface DevicePreferences {
  videoDeviceId: string;
  audioDeviceId: string;
  audioOutputDeviceId?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

export interface TokenData {
  token: string;
  url: string;
  room_code: string;
  identity: string;
  user_name: string;
}

interface MeetingLobbyProps {
  onJoin: (prefs: DevicePreferences, tokenData: TokenData) => void;
  onCancel?: () => void;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({ onJoin, onCancel }) => {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Meeting state
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Lobby waiting room state
  const [waitingRequestId, setWaitingRequestId] = useState<string | null>(null);
  const [savedDevicePrefs, setSavedDevicePrefs] = useState<DevicePreferences | null>(null);

  // Device management (extracted hook)
  const devices = useLobbyDevices(!!meetingData);

  // Video preview ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize display name from auth
  useEffect(() => {
    if (isAuthenticated && user) {
      setDisplayName(user.name || user.email.split("@")[0]);
    }
  }, [isAuthenticated, user]);

  // Verify meeting exists
  useEffect(() => {
    const verifyMeeting = async () => {
      if (!meetingCode) {
        setError("Invalid meeting code");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        setLoading(true);
        const meeting = await meetingService.getMeetingByCode(meetingCode);
        setMeetingData(meeting);

        try {
          const count = await getParticipantCount(meetingCode);
          setParticipantCount(count);
        } catch (err) {
          console.warn("Failed to get participant count:", err);
        }
      } catch (err) {
        console.error("Failed to verify meeting:", err);
        const axiosError = err as { response?: { status: number } };
        setError(
          axiosError.response?.status === 404
            ? ERROR_MESSAGES.INVALID_MEETING_CODE
            : ERROR_MESSAGES.NETWORK_ERROR,
        );
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyMeeting();
  }, [meetingCode, navigate]);

  // Display video preview
  useEffect(() => {
    if (videoRef.current && devices.stream && devices.cameraEnabled) {
      videoRef.current.srcObject = devices.stream;
    }
  }, [devices.stream, devices.cameraEnabled]);

  // Join meeting via lobby
  const handleJoinClick = async () => {
    if (!meetingCode) return;

    if (!isAuthenticated && !displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    try {
      setIsJoining(true);
      setError("");

      const prefs: DevicePreferences = {
        videoDeviceId: devices.selectedCamera,
        audioDeviceId: devices.selectedMic,
        audioOutputDeviceId: devices.selectedSpeaker,
        videoEnabled: devices.cameraEnabled,
        audioEnabled: devices.micEnabled,
      };

      const response = await requestToJoin(
        meetingCode,
        isAuthenticated ? undefined : displayName.trim(),
      );

      if (response.status === "auto_approved" && response.token) {
        // Admin: auto-approved, join immediately
        devices.cleanup();
        onJoin(prefs, {
          token: response.token,
          url: response.url!,
          room_code: response.room_code!,
          identity: response.identity!,
          user_name: response.user_name!,
        });
      } else {
        // Non-admin: enter waiting room
        devices.cleanup();
        setSavedDevicePrefs(prefs);
        setWaitingRequestId(response.request_id);
        setIsJoining(false);
      }
    } catch (err) {
      console.error("Failed to join meeting:", err);
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosError.response?.data?.message ||
        ERROR_MESSAGES.TOKEN_GENERATION_FAILED,
      );
      setIsJoining(false);
    }
  };

  // Handle approval from waiting room
  const handleWaitingApproved = (tokenData: TokenData) => {
    if (savedDevicePrefs) {
      onJoin(savedDevicePrefs, tokenData);
    }
  };

  // Handle rejection or cancel from waiting room
  const handleWaitingCancel = () => {
    setWaitingRequestId(null);
    setSavedDevicePrefs(null);
    setIsJoining(false);
    if (onCancel) {
      onCancel();
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  // Combine errors from both lobby and device hook
  const displayError = error || devices.error;

  // Show waiting room if request is pending
  if (waitingRequestId && meetingCode) {
    return (
      <WaitingRoom
        requestId={waitingRequestId}
        meetingCode={meetingCode}
        displayName={displayName}
        onApproved={handleWaitingApproved}
        onCancel={handleWaitingCancel}
      />
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-900 flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative">
      {/* Joining overlay */}
      {isJoining && <JoiningOverlay />}

      <div className="w-full max-w-2xl">
        {/* Device error message with instructions */}
        {devices.deviceError && (
          <div className="mb-6">
            <DeviceErrorMessage
              type={devices.deviceError}
              onRetry={() => {
                devices.clearDeviceError();
                // Reset permissions to re-trigger setup
              }}
              onDismiss={() => {
                devices.clearDeviceError();
              }}
            />
          </div>
        )}

        {/* Error message */}
        {displayError && !devices.deviceError && (
          <div className="mb-6">
            <ErrorMessage
              message={displayError}
              onRetry={() => {
                setError("");
                devices.clearError();
              }}
            />
          </div>
        )}

        {/* Main content card */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Video preview with overlay controls */}
          <div
            className="relative aspect-video bg-black"
            role="region"
            aria-label="Video preview"
          >
            {devices.cameraEnabled && devices.stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800">
                <div className="text-center px-4">
                  <p className="text-white text-lg md:text-base font-semibold mb-4">
                    Camera is off
                  </p>
                  <div
                    className="w-24 h-24 md:w-20 md:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-12 h-12 md:w-10 md:h-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Display name overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium">
                {displayName || "You"}
              </span>
            </div>

            {/* Media control buttons */}
            <MediaControls
              micEnabled={devices.micEnabled}
              cameraEnabled={devices.cameraEnabled}
              onToggleMic={devices.toggleMic}
              onToggleCamera={devices.toggleCamera}
            />
          </div>

          {/* Device selection and controls */}
          <div className="p-6 space-y-4">
            {/* Device selection dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DeviceSelector
                devices={devices.audioDevices}
                selectedId={devices.selectedMic}
                onSelect={devices.setSelectedMic}
                disabled={!devices.micEnabled}
                ariaLabel="Select microphone device"
                fallbackLabel="Microphone"
              />
              <DeviceSelector
                devices={devices.audioOutputDevices}
                selectedId={devices.selectedSpeaker}
                onSelect={devices.setSelectedSpeaker}
                ariaLabel="Select speaker device"
                fallbackLabel="Speaker"
              />
              <DeviceSelector
                devices={devices.videoDevices}
                selectedId={devices.selectedCamera}
                onSelect={devices.setSelectedCamera}
                disabled={!devices.cameraEnabled}
                ariaLabel="Select camera device"
                fallbackLabel="Camera"
              />
            </div>

            {/* Microphone level indicator */}
            {devices.micEnabled && (
              <AudioLevelIndicator
                level={devices.audioLevel}
                variant="horizontal"
              />
            )}

            {/* Display name input (for non-authenticated users) */}
            {!isAuthenticated && (
              <div className="pt-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-gray-700 border-gray-600"
                  maxLength={50}
                  aria-label="Enter your display name"
                  aria-required="true"
                />
              </div>
            )}

            {/* Permission request button for mobile devices */}
            {devices.showPermissionButton && !devices.permissionsGranted && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={devices.requestPermissions}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  <svg
                    className="w-5 h-5 mr-2 inline-block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Allow Camera & Microphone
                </Button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Tap to grant camera and microphone permissions
                </p>
              </div>
            )}

            {/* Join button */}
            <div className="relative group mt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleJoinClick}
                disabled={
                  isJoining ||
                  !devices.permissionsGranted ||
                  (!isAuthenticated && !displayName.trim())
                }
                isLoading={isJoining}
              >
                {isJoining ? "Joining..." : "Join Now"}
              </Button>
              {!isAuthenticated &&
                !displayName.trim() &&
                devices.permissionsGranted && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Enter your name first
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
            </div>

            {/* Help text */}
            {!devices.permissionsGranted && (
              <p className="text-xs text-center text-gray-400">
                Please allow camera and microphone access to join
              </p>
            )}

            {/* Meeting info bar */}
            {meetingData && (
              <MeetingInfoBar
                meetingCode={meetingData.meeting_code}
                participantCount={participantCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
