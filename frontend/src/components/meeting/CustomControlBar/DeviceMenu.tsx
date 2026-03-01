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
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "0",
        backgroundColor: "var(--lk-bg2)",
        border: "1px solid var(--lk-border-color)",
        borderRadius: "12px",
        padding: "6px",
        minWidth: "240px",
        maxWidth: "320px",
        boxShadow:
          "0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        animation: "slideUpFade 0.2s ease-out",
        backdropFilter: "blur(8px)",
      }}
    >
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
