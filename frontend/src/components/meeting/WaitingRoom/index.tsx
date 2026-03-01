import { useState, useCallback, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import {
  cancelLobbyRequest,
  getVisitorWsUrl,
} from "../../../services/api/lobby.service";
import { RejectedScreen } from "./RejectedScreen";
import { PendingScreen } from "./PendingScreen";
import { useWaitingTimer } from "./useWaitingTimer";
import type { WaitingRoomProps, WaitingStatus } from "./types";

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  requestId,
  meetingCode,
  displayName,
  onApproved,
  onCancel,
}) => {
  const [status, setStatus] = useState<WaitingStatus>("pending");
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const { dots, elapsedTime, formatTime } = useWaitingTimer();

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "approved" && data.token) {
          setStatus("approved");
          onApproved({
            token: data.token,
            url: data.url,
            room_code: data.room_code,
            identity: data.identity,
            user_name: data.user_name,
          });
        } else if (data.type === "rejected") {
          setStatus("rejected");
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    },
    [onApproved],
  );

  const { readyState } = useWebSocket(getVisitorWsUrl(requestId, meetingCode), {
    onMessage,
    shouldReconnect: () => status === "pending",
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  const handleCancel = async () => {
    try {
      await cancelLobbyRequest(requestId);
    } catch (err) {
      console.error("Failed to cancel lobby request:", err);
    }
    onCancel();
  };

  useEffect(() => {
    if (status !== "rejected") return;
    if (redirectCountdown <= 0) {
      onCancel();
      return;
    }
    const timer = setTimeout(
      () => setRedirectCountdown((prev) => prev - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [status, redirectCountdown, onCancel]);

  if (status === "rejected") {
    return (
      <RejectedScreen
        redirectCountdown={redirectCountdown}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <PendingScreen
      dots={dots}
      displayName={displayName}
      elapsedTime={formatTime(elapsedTime)}
      readyState={readyState}
      onCancel={handleCancel}
    />
  );
};
