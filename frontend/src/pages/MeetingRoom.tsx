import React from "react";
import LiveKitMeetingRoom from "../components/meeting/LiveKitMeetingRoom";

/**
 * MeetingRoom component displays the LiveKit video conference
 * Uses the simplified LiveKitMeetingRoom component
 */
interface MeetingRoomProps {
  meetingCode: string;
  userName?: string;
  onLeave: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  meetingCode,
  userName,
  onLeave,
}) => {
  return (
    <LiveKitMeetingRoom
      meetingCode={meetingCode}
      userName={userName}
      onDisconnect={onLeave}
    />
  );
};
