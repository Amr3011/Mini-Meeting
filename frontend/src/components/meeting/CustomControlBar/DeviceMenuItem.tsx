import React, { useState } from "react";
import { MicrophoneIcon, CameraIcon, CheckmarkIcon } from "./deviceIcons";
import { DEVICE_LABELS } from "./deviceConstants";

interface DeviceMenuItemProps {
  device: MediaDeviceInfo;
  isActive: boolean;
  deviceType: "microphone" | "camera";
  onSelect: () => void;
}

const DEVICE_ICON_COMPONENTS = {
  microphone: MicrophoneIcon,
  camera: CameraIcon,
};

/**
 * Single device menu item with hover effects and active indicator
 */
export const DeviceMenuItem: React.FC<DeviceMenuItemProps> = ({
  device,
  isActive,
  deviceType,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const DeviceIconComponent = DEVICE_ICON_COMPONENTS[deviceType];

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => !isActive && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        backgroundColor: isActive ? "var(--lk-accent)" : "transparent",
        color: isActive ? "#fff" : "var(--lk-fg)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: isActive ? "500" : "400",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        position: "relative",
        transform: isHovered && !isActive ? "translateX(4px)" : "translateX(0)",
        ...(isHovered &&
          !isActive && {
            backgroundColor: "var(--lk-bg3)",
          }),
      }}
    >
      <DeviceIconComponent />

      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {device.label || DEVICE_LABELS[deviceType]}
      </span>

      {isActive && <CheckmarkIcon />}
    </button>
  );
};
