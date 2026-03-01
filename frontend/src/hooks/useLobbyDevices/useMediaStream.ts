import { useState, useCallback } from "react";
import { useStreamSetup } from "./useStreamSetup";
import { useStreamError } from "./useStreamError";

/**
 * Hook for managing media stream
 * Orchestrates stream setup, permissions, and error handling
 */
export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const { requestUserMedia } = useStreamSetup();
  const {
    error,
    deviceError,
    handleMediaError,
    clearError,
    clearDeviceError,
    setErrorMessage,
  } = useStreamError();

  const setupDevices = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const mediaStream = await requestUserMedia(
        setCameraEnabled,
        setMicEnabled,
      );

      setStream(mediaStream);
      setPermissionsGranted(true);
      clearDeviceError();

      return mediaStream;
    } catch (err) {
      handleMediaError(err);
      setPermissionsGranted(false);
      return null;
    }
  }, [requestUserMedia, handleMediaError, clearDeviceError]);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, [stream]);

  return {
    stream,
    setStream,
    permissionsGranted,
    cameraEnabled,
    setCameraEnabled,
    micEnabled,
    setMicEnabled,
    error,
    deviceError,
    setupDevices,
    stopStream,
    clearError,
    clearDeviceError,
    setErrorMessage,
  };
}
