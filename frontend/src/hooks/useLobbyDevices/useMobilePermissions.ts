import { useState, useCallback } from "react";
import { isMobileDevice } from "../../utils/browser";

interface MobilePermissionsProps {
  setupDevicesAndEnumerate: () => Promise<void>;
}

/**
 * Hook for managing mobile device permissions
 * Shows permission button on mobile and handles request
 */
export function useMobilePermissions({
  setupDevicesAndEnumerate,
}: MobilePermissionsProps) {
  const [showPermissionButton, setShowPermissionButton] = useState(() =>
    isMobileDevice(),
  );

  const requestPermissions = useCallback(async () => {
    setShowPermissionButton(false);
    await setupDevicesAndEnumerate();
  }, [setupDevicesAndEnumerate]);

  return { showPermissionButton, requestPermissions };
}
