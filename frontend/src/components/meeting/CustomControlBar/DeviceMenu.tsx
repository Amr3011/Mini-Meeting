import React from "react";
import { DeviceMenuItem } from "./DeviceMenuItem";
import type { DeviceMenuProps } from "./types";

/**
 * Device selection menu for microphone or camera
 * Displays list of available devices with active indicator
 */
export const DeviceMenu: React.FC<DeviceMenuProps> = ({
  isOpen,
  devices,
  activeDeviceId,
  onSelectDevice,
  onClose,
  deviceType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-[calc(100%+8px)] left-0 bg-(--lk-bg2) border border-(--lk-border-color) rounded-xl p-1.5 min-w-60 max-w-[320px] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] z-1000 animate-slide-up-fade backdrop-blur-sm">
      {devices.map((device) => (
        <DeviceMenuItem
          key={device.deviceId}
          device={device}
          isActive={device.deviceId === activeDeviceId}
          deviceType={deviceType}
          onSelect={() => {
            onSelectDevice(device.deviceId);
            onClose();
          }}
        />
      ))}
    </div>
  );
};
