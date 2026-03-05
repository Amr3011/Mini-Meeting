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
      className={`w-full text-left py-2.5 px-3 border-none rounded-lg cursor-pointer text-sm transition-all duration-200 flex items-center gap-2.5 relative ${isActive ? "bg-(--lk-accent) text-white font-medium" : "bg-transparent text-(--lk-fg) font-normal"} ${isHovered && !isActive ? "bg-(--lk-bg3) translate-x-1" : "translate-x-0"}`}
    >
      <DeviceIconComponent />

      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {device.label || DEVICE_LABELS[deviceType]}
      </span>

      {isActive && <CheckmarkIcon />}
    </button>
  );
};
