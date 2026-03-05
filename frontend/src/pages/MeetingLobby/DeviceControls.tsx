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
  listenerMode = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Device selection dropdowns */}
      <div
        className={
          listenerMode
            ? "flex justify-center"
            : "grid grid-cols-1 sm:grid-cols-3 gap-3"
        }
      >
        {!listenerMode && (
          <DeviceSelector
            devices={audioDevices}
            selectedId={selectedMic}
            onSelect={setSelectedMic}
            disabled={!micEnabled}
            ariaLabel="Select microphone device"
            fallbackLabel="Microphone"
          />
        )}
        <div className={listenerMode ? "w-full" : ""}>
          <DeviceSelector
            devices={audioOutputDevices}
            selectedId={selectedSpeaker}
            onSelect={setSelectedSpeaker}
            ariaLabel="Select speaker device"
            fallbackLabel="Speaker"
          />
        </div>
        {!listenerMode && (
          <DeviceSelector
            devices={videoDevices}
            selectedId={selectedCamera}
            onSelect={setSelectedCamera}
            disabled={!cameraEnabled}
            ariaLabel="Select camera device"
            fallbackLabel="Camera"
          />
        )}
      </div>

      {/* Microphone level indicator */}
      {!listenerMode && micEnabled && (
        <AudioLevelIndicator level={audioLevel} variant="horizontal" />
      )}
    </div>
  );
};
