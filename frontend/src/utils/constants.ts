const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export default API_BASE_URL;

export const COLORS = {
  primary: "#1976d2",
  secondary: "#424242",
  success: "#4caf50",
  error: "#f44336",
  background: "#ffffff",
  surface: "#f5f5f5",
  text: {
    primary: "#212121",
    secondary: "#757575",
    disabled: "#bdbdbd",
  },
} as const;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1024,
} as const;

export const VIDEO_CONSTRAINTS = {
  lobby: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24 },
  },
  meeting: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
} as const;

export const ERROR_MESSAGES = {
  INVALID_MEETING_CODE:
    "Meeting not found. Please check the code and try again.",
  DEVICE_ACCESS_DENIED:
    "Camera and microphone access required. Please enable in browser settings.",
  NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
  TOKEN_GENERATION_FAILED:
    "Failed to join meeting. Please try again or contact support.",
  MEETING_CONNECTION_FAILED:
    "Could not connect to meeting. Please check your connection.",
  NO_DEVICES_FOUND: "No camera or microphone found. Please connect a device.",
  DEVICE_ERROR:
    "Failed to access camera/microphone. Please check your device settings.",
} as const;

export const A11Y = {
  focusTrapEnabled: true,
  announceStateChanges: true,
  respectReducedMotion: true,
  keyboardShortcuts: {
    toggleCamera: "v",
    toggleMic: "m",
    leaveMeeting: "Escape",
  },
} as const;
