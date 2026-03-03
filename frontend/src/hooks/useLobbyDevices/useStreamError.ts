import { useState, useCallback } from "react";
import { ERROR_MESSAGES } from "../../utils/constants";
import type { DeviceErrorType } from "./types";

/**
 * Hook for managing media stream errors
 * Handles error state, device errors, and error clearing
 */
export function useStreamError() {
  const [error, setError] = useState("");
  const [deviceError, setDeviceError] = useState<DeviceErrorType["type"]>(null);

  const handleMediaError = useCallback(async (err: unknown) => {
    console.error("Failed to get device permissions:", err);
    const mediaError = err as { name?: string };

    if (
      mediaError.name === "NotAllowedError" ||
      mediaError.name === "PermissionDeniedError"
    ) {
      setDeviceError("access-denied");
      setError(ERROR_MESSAGES.DEVICE_ACCESS_DENIED);
    } else if (mediaError.name === "NotFoundError") {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some((d) => d.kind === "videoinput");
        const hasAudio = devices.some((d) => d.kind === "audioinput");

        if (hasVideo || hasAudio) {
          setDeviceError("access-denied");
          setError(
            "Unable to access your camera/microphone. Please check browser permissions and ensure no other app is using them.",
          );
        } else {
          setDeviceError("not-found");
          setError(ERROR_MESSAGES.NO_DEVICES_FOUND);
        }
      } catch {
        setDeviceError("not-found");
        setError(ERROR_MESSAGES.NO_DEVICES_FOUND);
      }
    } else {
      setDeviceError("generic");
      setError(ERROR_MESSAGES.DEVICE_ERROR);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  const clearDeviceError = useCallback(() => {
    setDeviceError(null);
    setError("");
  }, []);

  const setErrorMessage = useCallback((msg: string) => setError(msg), []);

  return {
    error,
    deviceError,
    handleMediaError,
    clearError,
    clearDeviceError,
    setErrorMessage,
  };
}
