import React from "react";
import LiveKitMeetingRoom from "../components/meeting/LiveKitMeetingRoom";
import type { DevicePreferences } from "./MeetingLobby";

/**
 * MeetingRoom component displays the LiveKit video conference
 * Uses the simplified LiveKitMeetingRoom component
 */
interface MeetingRoomProps {
  meetingCode: string;
  userName?: string;
  devicePreferences: DevicePreferences;
  token: string;
  livekitUrl: string;
  onLeave: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  meetingCode,
  userName,
  devicePreferences,
  token,
  livekitUrl,
  onLeave,
}) => {
  return (
    <LiveKitMeetingRoom
      meetingCode={meetingCode}
      userName={userName}
      devicePreferences={devicePreferences}
      token={token}
      livekitUrl={livekitUrl}
      onDisconnect={onLeave}
    />
  );
};
