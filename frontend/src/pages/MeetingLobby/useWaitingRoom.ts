import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DevicePreferences, TokenData } from "./types";

/**
 * Hook for managing waiting room state
 * Handles approval/cancel events and device preference storage
 */
export function useWaitingRoom(
  isAuthenticated: boolean,
  onJoin: (prefs: DevicePreferences, tokenData: TokenData) => void,
  onCancel?: () => void,
) {
  const navigate = useNavigate();
  const [waitingRequestId, setWaitingRequestId] = useState<string | null>(null);
  const [savedDevicePrefs, setSavedDevicePrefs] =
    useState<DevicePreferences | null>(null);

  const enterWaitingRoom = (
    requestId: string,
    devicePrefs: DevicePreferences,
  ) => {
    setWaitingRequestId(requestId);
    setSavedDevicePrefs(devicePrefs);
  };

  const handleApproved = (tokenData: TokenData) => {
    if (savedDevicePrefs) {
      onJoin(savedDevicePrefs, tokenData);
    }
  };

  const handleCancel = () => {
    setWaitingRequestId(null);
    setSavedDevicePrefs(null);
    if (onCancel) {
      onCancel();
    } else {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  };

  return {
    waitingRequestId,
    enterWaitingRoom,
    handleApproved,
    handleCancel,
  };
}
