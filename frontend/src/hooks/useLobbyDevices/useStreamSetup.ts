import { useCallback } from "react";
import { VIDEO_CONSTRAINTS } from "../../utils/constants";

/**
 * Hook for setting up media devices
 * Handles requesting permissions and creating media stream
 */
export function useStreamSetup() {
  const requestUserMedia = useCallback(
    async (
      setCameraEnabled: (enabled: boolean) => void,
      setMicEnabled: (enabled: boolean) => void,
    ): Promise<MediaStream | null> => {
      let mediaStream: MediaStream | null = null;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: VIDEO_CONSTRAINTS.lobby,
          audio: true,
        });
        return mediaStream;
      } catch (combinedError) {
        console.warn(
          "Failed to get both audio and video, trying separately:",
          combinedError,
        );

        const tracks: MediaStreamTrack[] = [];

        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: VIDEO_CONSTRAINTS.lobby,
            audio: false,
          });
          tracks.push(...videoStream.getVideoTracks());
        } catch {
          console.warn("Failed to get video");
          setCameraEnabled(false);
        }

        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          tracks.push(...audioStream.getAudioTracks());
        } catch {
          console.warn("Failed to get audio");
          setMicEnabled(false);
        }

        if (tracks.length > 0) {
          return new MediaStream(tracks);
        }

        throw combinedError;
      }
    },
    [],
  );

  return { requestUserMedia };
}
