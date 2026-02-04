import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { isAuthenticated } = useAuth();

  const [hasJoined, setHasJoined] = useState(false);
  const [devicePreferences, setDevicePreferences] = useState<DevicePreferences | null>(null);
  const [tokenData, setTokenData] = useState<LiveKitTokenResponse | null>(null);

  const handleJoinMeeting = (prefs: DevicePreferences, token: LiveKitTokenResponse) => {
    setDevicePreferences(prefs);
    setTokenData(token);
    setHasJoined(true);
  };

  const handleLeaveMeeting = () => {
    setHasJoined(false);
    setDevicePreferences(null);
    setTokenData(null);

    // Navigate based on authentication status
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  if (hasJoined && devicePreferences && tokenData) {
    return (
      <MeetingRoom
        devicePreferences={devicePreferences}
        tokenData={tokenData}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return <MeetingLobby onJoin={handleJoinMeeting} />;
};

export default Meeting;
