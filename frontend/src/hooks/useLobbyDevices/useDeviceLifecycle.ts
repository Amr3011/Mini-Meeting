import { useEffect, useState } from "react";
import { isMobileDevice } from "../../utils/browser";

interface UseDeviceLifecycleProps {
  meetingReady: boolean;
  permissionsGranted: boolean;
  setupDevicesAndEnumerate: () => void;
  stopStream: () => void;
  cleanupAnalyzer: () => void;
}

export interface DeviceLifecycleReturn {
  showPermissionPrompt: boolean;
  handleAllowPermissions: () => void;
  handleDismissPrompt: () => void;
}

/**
 * Hook for device lifecycle management
 * Handles permission prompt and auto-request on desktop
 */
export function useDeviceLifecycle({
  meetingReady,
  permissionsGranted,
  setupDevicesAndEnumerate,
  stopStream,
  cleanupAnalyzer,
}: UseDeviceLifecycleProps): DeviceLifecycleReturn {
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    if (
      meetingReady &&
      !permissionsGranted &&
      !isMobileDevice() &&
      !promptDismissed &&
      !permissionRequested
    ) {
      // Always show site prompt first - never auto-request browser permissions
      setShowPermissionPrompt(true);
    }
  }, [meetingReady, permissionsGranted, promptDismissed, permissionRequested]);

  const handleAllowPermissions = () => {
    setShowPermissionPrompt(false);
    setPermissionRequested(true);
    setupDevicesAndEnumerate();
  };

  const handleDismissPrompt = () => {
    setShowPermissionPrompt(false);
    setPromptDismissed(true);
  };

  useEffect(() => {
    return () => {
      stopStream();
      cleanupAnalyzer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingReady]);

  return {
    showPermissionPrompt,
    handleAllowPermissions,
    handleDismissPrompt,
  };
}
