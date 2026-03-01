import { useState } from "react";
import { requestToJoin } from "../../services/api/lobby.service";
import { ERROR_MESSAGES } from "../../utils/constants";
import { useWaitingRoom } from "./useWaitingRoom";
import type { DevicePreferences, TokenData } from "./types";
import type { LobbyDeviceState } from "../../hooks/useLobbyDevices/types";

/**
 * Hook for handling join operations
 * Manages join request, waiting state, and approval/cancel
 */
export function useJoinHandlers(
  meetingCode: string | undefined,
  isAuthenticated: boolean,
  displayName: string,
  devices: LobbyDeviceState,
  onJoin: (prefs: DevicePreferences, tokenData: TokenData) => void,
  onCancel?: () => void,
) {
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState("");

  const waitingRoom = useWaitingRoom(isAuthenticated, onJoin, onCancel);

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
        devices.cleanup();
        onJoin(prefs, {
          token: response.token,
          url: response.url!,
          room_code: response.room_code!,
          identity: response.identity!,
          user_name: response.user_name!,
        });
      } else {
        devices.cleanup();
        waitingRoom.enterWaitingRoom(response.request_id, prefs);
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

  return {
    isJoining,
    error,
    setError,
    waitingRequestId: waitingRoom.waitingRequestId,
    handleJoinClick,
    handleWaitingApproved: waitingRoom.handleApproved,
    handleWaitingCancel: waitingRoom.handleCancel,
  };
}
