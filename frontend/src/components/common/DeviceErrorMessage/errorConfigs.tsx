import React from "react";

export interface ErrorContent {
  icon: React.ReactNode;
  title: string;
  message: string;
  instructions: string[];
}

export const errorConfigs: Record<string, ErrorContent> = {
  "access-denied": {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    ),
    title: "Camera and Microphone Access Required",
    message:
      "Unable to access your devices. This could be due to browser permissions or another application using them.",
    instructions: [
      "Click the camera icon in your browser's address bar and select 'Allow'",
      "Close any other applications that might be using your camera/microphone (Zoom, Teams, Skype, etc.)",
      "Check your operating system privacy settings for camera and microphone access",
      "Try disconnecting and reconnecting your devices",
      "Refresh the page and try again",
    ],
  },
  "not-found": {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "No Camera or Microphone Found",
    message: "We couldn't detect a camera or microphone on your device.",
    instructions: [
      "Make sure your camera and microphone are properly connected",
      "Check if other applications are using your devices",
      "Try a different USB port if using external devices",
    ],
  },
  generic: {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    title: "Device Access Error",
    message:
      "Failed to access your camera and microphone. Please check your device settings.",
    instructions: [
      "Ensure no other applications are using your devices",
      "Check your system permissions for camera and microphone",
      "Try restarting your browser",
    ],
  },
};
