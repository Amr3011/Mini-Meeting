export interface DeviceMenuProps {
  isOpen: boolean;
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onClose: () => void;
  deviceType: "microphone" | "camera";
}

export interface DeviceControlProps {
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  setActiveDevice: (deviceId: string) => void;
}
