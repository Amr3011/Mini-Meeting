import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingLobby, type DevicePreferences } from "./MeetingLobby";
import { MeetingRoom } from "./MeetingRoom";
import type { LiveKitTokenResponse } from "../services/api/livekit.service";
import { useAuth } from "../hooks/useAuth";

/**
 * Meeting handles the entire meeting flow:
 * 1. Shows MeetingLobby for pre-join setup
 * 2. Shows MeetingRoom after joining
 * 3. Manages state transition between lobby and room
 */
const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const { isAuthenticated, user } = useAuth();

  const [hasJoined, setHasJoined] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const handleJoinMeeting = (_prefs: DevicePreferences, token: LiveKitTokenResponse) => {
    // Get user name from auth context, or use the display name returned by the backend
    const name = isAuthenticated && user
      ? user.name || user.email.split("@")[0]
      : token.user_name || token.identity;
    setUserName(name);
    setHasJoined(true);
  };

  const handleLeaveMeeting = () => {
    setHasJoined(false);
    setUserName("");

    // Navigate based on authentication status
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  if (hasJoined && meetingCode) {
    return (
      <MeetingRoom
        meetingCode={meetingCode}
        userName={userName}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return <MeetingLobby onJoin={handleJoinMeeting} />;
};

export default Meeting;
