import React from "react";
import DeviceSelector from "../../components/meeting/DeviceSelector";
import AudioLevelIndicator from "../../components/meeting/AudioLevelIndicator";
import type { DeviceControlsProps } from "./types";

export const DeviceControls: React.FC<DeviceControlsProps> = ({
  audioDevices,
  audioOutputDevices,
  videoDevices,
  selectedMic,
  selectedSpeaker,
  selectedCamera,
  setSelectedMic,
  setSelectedSpeaker,
  setSelectedCamera,
  micEnabled,
  cameraEnabled,
  audioLevel,
}) => {
  return (
    <div className="space-y-4">
      {/* Device selection dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DeviceSelector
          devices={audioDevices}
          selectedId={selectedMic}
          onSelect={setSelectedMic}
          disabled={!micEnabled}
          ariaLabel="Select microphone device"
          fallbackLabel="Microphone"
        />
        <DeviceSelector
          devices={audioOutputDevices}
          selectedId={selectedSpeaker}
          onSelect={setSelectedSpeaker}
          ariaLabel="Select speaker device"
          fallbackLabel="Speaker"
        />
        <DeviceSelector
          devices={videoDevices}
          selectedId={selectedCamera}
          onSelect={setSelectedCamera}
          disabled={!cameraEnabled}
          ariaLabel="Select camera device"
          fallbackLabel="Camera"
        />
      </div>

      {/* Microphone level indicator */}
      {micEnabled && (
        <AudioLevelIndicator level={audioLevel} variant="horizontal" />
      )}
    </div>
  );
};
