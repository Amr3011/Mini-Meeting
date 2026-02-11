import React from "react";

interface MediaControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

const MicOnIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

const MicOffIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

const CameraOnIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CameraOffIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

const MediaControls: React.FC<MediaControlsProps> = ({
  micEnabled,
  cameraEnabled,
  onToggleMic,
  onToggleCamera,
}) => {
  const buttonBase = "p-3.5 rounded-full transition-all";
  const enabledClass =
    "bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white";
  const disabledClass = "bg-danger-500 hover:bg-danger-600 text-white";

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
      <button
        onClick={onToggleMic}
        className={`${buttonBase} ${micEnabled ? enabledClass : disabledClass}`}
        title={micEnabled ? "Mute microphone" : "Unmute microphone"}
        aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
        aria-pressed={micEnabled}
      >
        {micEnabled ? <MicOnIcon /> : <MicOffIcon />}
      </button>

      <button
        onClick={onToggleCamera}
        className={`${buttonBase} ${cameraEnabled ? enabledClass : disabledClass}`}
        title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
        aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
        aria-pressed={cameraEnabled}
      >
        {cameraEnabled ? <CameraOnIcon /> : <CameraOffIcon />}
      </button>
    </div>
  );
};

export default MediaControls;
