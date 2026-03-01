export interface DevicePreferences {
  videoDeviceId: string;
  audioDeviceId: string;
  audioOutputDeviceId?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

export interface TokenData {
  token: string;
  url: string;
  room_code: string;
  identity: string;
  user_name: string;
}

export interface MeetingLobbyProps {
  onJoin: (prefs: DevicePreferences, tokenData: TokenData) => void;
  onCancel?: () => void;
}

export interface VideoPreviewProps {
  cameraEnabled: boolean;
  stream: MediaStream | null;
  displayName: string;
  micEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

export interface DeviceControlsProps {
  audioDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedMic: string;
  selectedSpeaker: string;
  selectedCamera: string;
  setSelectedMic: (id: string) => void;
  setSelectedSpeaker: (id: string) => void;
  setSelectedCamera: (id: string) => void;
  micEnabled: boolean;
  cameraEnabled: boolean;
  audioLevel: number;
}

export interface JoinButtonProps {
  isJoining: boolean;
  permissionsGranted: boolean;
  displayName: string;
  isAuthenticated: boolean;
  onClick: () => void;
}

export interface PermissionButtonProps {
  onRequestPermissions: () => Promise<void>;
}
