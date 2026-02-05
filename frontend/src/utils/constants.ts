const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export default API_BASE_URL;

// Design System Colors (aligned with Task 6 specifications)
export const COLORS = {
  primary: '#1976d2',      // Blue
  secondary: '#424242',    // Dark Gray
  success: '#4caf50',      // Green
  error: '#f44336',        // Red
  background: '#ffffff',   // White
  surface: '#f5f5f5',      // Light Gray
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  }
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 640,    // < 640px
  tablet: 1024,   // 640px - 1024px
  desktop: 1024,  // > 1024px
} as const;

// Video constraints
export const VIDEO_CONSTRAINTS = {
  lobby: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24 }, // Lower for preview
  },
  meeting: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  }
} as const;

// Error messages for different scenarios (Task 6)
export const ERROR_MESSAGES = {
  INVALID_MEETING_CODE: "Meeting not found. Please check the code and try again.",
  DEVICE_ACCESS_DENIED: "Camera and microphone access required. Please enable in browser settings.",
  NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
  TOKEN_GENERATION_FAILED: "Failed to join meeting. Please try again or contact support.",
  MEETING_CONNECTION_FAILED: "Could not connect to meeting. Please check your connection.",
  NO_DEVICES_FOUND: "No camera or microphone found. Please connect a device.",
  DEVICE_ERROR: "Failed to access camera/microphone. Please check your device settings.",
} as const;

// Accessibility settings
export const A11Y = {
  focusTrapEnabled: true,
  announceStateChanges: true,
  respectReducedMotion: true,
  keyboardShortcuts: {
    toggleCamera: 'v',
    toggleMic: 'm',
    leaveMeeting: 'Escape',
  }
} as const;
