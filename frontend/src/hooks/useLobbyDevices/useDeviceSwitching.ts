import { useVideoDeviceSwitching } from "./useVideoDeviceSwitching";
import { useAudioDeviceSwitching } from "./useAudioDeviceSwitching";

interface UseDeviceSwitchingProps {
  selectedCamera: string;
  selectedMic: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  permissionsGranted: boolean;
  stream: MediaStream | null;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  setStream: (stream: MediaStream) => void;
  setSelectedCamera: (id: string) => void;
  setSelectedMic: (id: string) => void;
  setError: (msg: string) => void;
  setupAudioAnalyzer: (stream: MediaStream) => void;
}

/**
 * Hook for managing device switching (both video and audio)
 * Orchestrates camera and microphone selection
 */
export function useDeviceSwitching(props: UseDeviceSwitchingProps) {
  useVideoDeviceSwitching(props);
  useAudioDeviceSwitching(props);
}
