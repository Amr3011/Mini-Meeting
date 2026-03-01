import MeetingInfoBar from "../../components/meeting/MeetingInfoBar";
import { VideoPreview } from "./VideoPreview";
import { DeviceControls } from "./DeviceControls";
import { NameInput } from "./NameInput";
import { PermissionButton } from "./PermissionButton";
import { JoinButton } from "./JoinButton";
import type { LobbyDeviceState } from "../../hooks/useLobbyDevices/types";
import type { Meeting } from "../../types/meeting.types";

interface LobbyContentProps {
  devices: LobbyDeviceState;
  displayName: string;
  setDisplayName: (name: string) => void;
  isAuthenticated: boolean;
  isJoining: boolean;
  meetingData: Meeting | null;
  participantCount: number | null;
  onJoinClick: () => void;
}

export const LobbyContent: React.FC<LobbyContentProps> = ({
  devices,
  displayName,
  setDisplayName,
  isAuthenticated,
  isJoining,
  meetingData,
  participantCount,
  onJoinClick,
}) => (
  <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
    <VideoPreview
      cameraEnabled={devices.cameraEnabled}
      stream={devices.stream}
      displayName={displayName}
      micEnabled={devices.micEnabled}
      onToggleMic={devices.toggleMic}
      onToggleCamera={devices.toggleCamera}
    />

    <div className="p-6 space-y-4">
      <DeviceControls
        audioDevices={devices.audioDevices}
        audioOutputDevices={devices.audioOutputDevices}
        videoDevices={devices.videoDevices}
        selectedMic={devices.selectedMic}
        selectedSpeaker={devices.selectedSpeaker}
        selectedCamera={devices.selectedCamera}
        setSelectedMic={devices.setSelectedMic}
        setSelectedSpeaker={devices.setSelectedSpeaker}
        setSelectedCamera={devices.setSelectedCamera}
        micEnabled={devices.micEnabled}
        cameraEnabled={devices.cameraEnabled}
        audioLevel={devices.audioLevel}
      />

      {!isAuthenticated && (
        <NameInput displayName={displayName} setDisplayName={setDisplayName} />
      )}

      {devices.showPermissionButton && !devices.permissionsGranted && (
        <PermissionButton onRequestPermissions={devices.requestPermissions} />
      )}

      <JoinButton
        isJoining={isJoining}
        permissionsGranted={devices.permissionsGranted}
        displayName={displayName}
        isAuthenticated={isAuthenticated}
        onClick={onJoinClick}
      />

      {!devices.permissionsGranted && (
        <p className="text-xs text-center text-gray-400">
          Please allow camera and microphone access to join
        </p>
      )}

      {meetingData && (
        <MeetingInfoBar
          meetingCode={meetingData.meeting_code}
          participantCount={participantCount}
        />
      )}
    </div>
  </div>
);
