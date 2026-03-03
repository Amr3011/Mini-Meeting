import { useCallback } from "react";

interface MediaStreamResult {
  setupDevices: () => Promise<MediaStream | null>;
  [key: string]: unknown;
}

interface DeviceEnumerationResult {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  setSelectedCamera: (id: string | ((prev: string) => string)) => void;
  setSelectedMic: (id: string | ((prev: string) => string)) => void;
  setSelectedSpeaker: (id: string | ((prev: string) => string)) => void;
  enumerateDevices: () => Promise<{
    videos: MediaDeviceInfo[];
    audios: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>;
  [key: string]: unknown;
}

interface DeviceSetupProps {
  mediaStream: MediaStreamResult;
  deviceEnumeration: DeviceEnumerationResult;
  setupAudioAnalyzer: (stream: MediaStream) => void;
}

/**
 * Hook for setting up devices and enumeration
 * Handles initial device setup and stream creation
 */
export function useDeviceSetup({
  mediaStream,
  deviceEnumeration,
  setupAudioAnalyzer,
}: DeviceSetupProps) {
  const setupDevicesAndEnumerate = useCallback(async () => {
    const stream = await mediaStream.setupDevices();
    if (stream) {
      await deviceEnumeration.enumerateDevices();
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        setupAudioAnalyzer(stream);
      }
    }
  }, [mediaStream, deviceEnumeration, setupAudioAnalyzer]);

  return { setupDevicesAndEnumerate };
}
