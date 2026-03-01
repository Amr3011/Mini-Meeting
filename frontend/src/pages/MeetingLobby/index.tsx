import React from "react";
import { useParams } from "react-router-dom";
import JoiningOverlay from "../../components/meeting/JoiningOverlay";
import { WaitingRoom } from "../../components/meeting/WaitingRoom";
import { PermissionPrompt } from "../../components/meeting/PermissionPrompt";
import { useAuth } from "../../hooks/useAuth";
import { useLobbyDevices } from "../../hooks/useLobbyDevices";
import { useMeetingData } from "./useMeetingData";
import { useLobbyLogic } from "./useLobbyLogic";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorDisplay } from "./ErrorDisplay";
import { LobbyContent } from "./LobbyContent";
import type { MeetingLobbyProps } from "./types";

export type { DevicePreferences, TokenData } from "./types";

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  onJoin,
  onCancel,
}) => {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const { isAuthenticated } = useAuth();

  const {
    meetingData,
    participantCount,
    error: meetingError,
    setError: setMeetingError,
    loading,
  } = useMeetingData(meetingCode);
  const devices = useLobbyDevices(!!meetingData);

  const {
    displayName,
    setDisplayName,
    isJoining,
    error: lobbyError,
    setError: setLobbyError,
    waitingRequestId,
    handleJoinClick,
    handleWaitingApproved,
    handleWaitingCancel,
  } = useLobbyLogic({ meetingCode, devices, onJoin, onCancel });

  const displayError = lobbyError || meetingError || devices.error;

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
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative">
      {isJoining && <JoiningOverlay />}

      <div className="w-full max-w-2xl">
        <ErrorDisplay
          deviceError={devices.deviceError}
          error={displayError}
          onClearDeviceError={devices.clearDeviceError}
          onRetryDeviceAccess={devices.retryDeviceAccess}
          onClearError={() => {
            setLobbyError("");
            setMeetingError("");
            devices.clearError();
          }}
        />

        {devices.showPermissionPrompt && (
          <PermissionPrompt
            onAllow={devices.handleAllowPermissions}
            onDismiss={devices.handleDismissPrompt}
          />
        )}

        <LobbyContent
          devices={devices}
          displayName={displayName}
          setDisplayName={setDisplayName}
          isAuthenticated={isAuthenticated}
          isJoining={isJoining}
          meetingData={meetingData}
          participantCount={participantCount}
          onJoinClick={handleJoinClick}
        />
      </div>
    </div>
  );
};
