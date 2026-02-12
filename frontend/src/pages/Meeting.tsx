import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingLobby, type DevicePreferences, type TokenData } from "./MeetingLobby";
import { MeetingRoom } from "./MeetingRoom";
import { useAuth } from "../hooks/useAuth";

/**
 * Meeting handles the entire meeting flow:
 * 1. Shows MeetingLobby for pre-join setup
 * 2. Shows WaitingRoom if lobby approval is pending (handled inside MeetingLobby)
 * 3. Shows MeetingRoom after joining
 */
const Meeting: React.FC = () => {
  const navigate = useNavigate();
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const { isAuthenticated, user } = useAuth();

  const [hasJoined, setHasJoined] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [devicePreferences, setDevicePreferences] = useState<DevicePreferences | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  const handleJoinMeeting = (prefs: DevicePreferences, token: TokenData) => {
    const name = isAuthenticated && user
      ? user.name || user.email.split("@")[0]
      : token.user_name || token.identity;
    setUserName(name);
    setDevicePreferences(prefs);
    setTokenData(token);
    setHasJoined(true);
  };

  const handleLeaveMeeting = () => {
    setHasJoined(false);
    setUserName("");
    setTokenData(null);

    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  if (hasJoined && meetingCode && devicePreferences && tokenData) {
    return (
      <MeetingRoom
        meetingCode={meetingCode}
        userName={userName}
        devicePreferences={devicePreferences}
        token={tokenData.token}
        livekitUrl={tokenData.url}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return <MeetingLobby onJoin={handleJoinMeeting} />;
};

export default Meeting;
