import { useCallback } from "react";

interface MediaStreamState {
  stream: MediaStream | null;
  cameraEnabled: boolean;
  micEnabled: boolean;
  setCameraEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
  setMicEnabled: (value: boolean | ((prev: boolean) => boolean)) => void;
  [key: string]: unknown;
}

interface AudioAnalyzerState {
  setupAudioAnalyzer: (
    stream: MediaStream,
    setLevel: (level: number) => void,
  ) => void;
  cleanup: () => void;
  restartMonitoring: (setLevel: (level: number) => void) => void;
  stopMonitoring: () => void;
  [key: string]: unknown;
}

interface DeviceTogglesProps {
  mediaStream: MediaStreamState;
  audioAnalyzer: AudioAnalyzerState;
  setAudioLevel: (level: number) => void;
}

/**
 * Hook for toggling camera and microphone
 * Manages track enable/disable and audio monitoring
 */
export function useDeviceToggles({
  mediaStream,
  audioAnalyzer,
  setAudioLevel,
}: DeviceTogglesProps) {
  const toggleCamera = useCallback(() => {
    if (mediaStream.stream) {
      const videoTrack = mediaStream.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !mediaStream.cameraEnabled;
      }
    }
    mediaStream.setCameraEnabled((prev: boolean) => !prev);
  }, [mediaStream]);

  const toggleMic = useCallback(() => {
    const newMicEnabled = !mediaStream.micEnabled;
    if (mediaStream.stream) {
      const audioTrack = mediaStream.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newMicEnabled;
      }
    }
    mediaStream.setMicEnabled(newMicEnabled);

    if (newMicEnabled) {
      audioAnalyzer.restartMonitoring(setAudioLevel);
    } else {
      audioAnalyzer.stopMonitoring();
      setAudioLevel(0);
    }
  }, [mediaStream, audioAnalyzer, setAudioLevel]);

  return { toggleCamera, toggleMic };
}
