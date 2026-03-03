import { useAuth } from "../../hooks/useAuth";
import { useDisplayNameInit } from "./useDisplayNameInit";
import { useJoinHandlers } from "./useJoinHandlers";
import type { DevicePreferences, TokenData } from "./types";
import type { LobbyDeviceState } from "../../hooks/useLobbyDevices/types";

interface UseLobbyLogicProps {
  meetingCode: string | undefined;
  devices: LobbyDeviceState;
  onJoin: (prefs: DevicePreferences, tokenData: TokenData) => void;
  onCancel?: () => void;
}

/**
 * Main lobby logic hook
 * Orchestrates display name initialization and join handling
 */
export const useLobbyLogic = ({
  meetingCode,
  devices,
  onJoin,
  onCancel,
}: UseLobbyLogicProps) => {
  const { user, isAuthenticated } = useAuth();

  const { displayName, setDisplayName } = useDisplayNameInit(
    isAuthenticated,
    user,
  );

  const {
    isJoining,
    error,
    setError,
    waitingRequestId,
    handleJoinClick,
    handleWaitingApproved,
    handleWaitingCancel,
  } = useJoinHandlers(
    meetingCode,
    isAuthenticated,
    displayName,
    devices,
    onJoin,
    onCancel,
  );

  return {
    displayName,
    setDisplayName,
    isJoining,
    error,
    setError,
    waitingRequestId,
    handleJoinClick,
    handleWaitingApproved,
    handleWaitingCancel,
  };
};
