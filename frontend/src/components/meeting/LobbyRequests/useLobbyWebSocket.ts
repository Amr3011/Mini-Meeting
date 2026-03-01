import { useState, useCallback, useRef, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  getAdminWsUrl,
  type LobbyPendingEntry,
} from "../../../services/api/lobby.service";

export function useLobbyWebSocket(
  meetingCode: string,
  isAdmin: boolean,
  onNewRequest: () => void,
) {
  const [requests, setRequests] = useState<LobbyPendingEntry[]>([]);
  const prevCountRef = useRef(0);

  const wsUrl = isAdmin ? getAdminWsUrl(meetingCode) : null;

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "pending_requests":
            setRequests(data.requests || []);
            prevCountRef.current = (data.requests || []).length;
            break;

          case "new_request":
            setRequests((prev) => {
              const updated = [...prev, data.request];
              if (updated.length > prevCountRef.current) {
                onNewRequest();
              }
              prevCountRef.current = updated.length;
              return updated;
            });
            break;

          case "request_resolved":
          case "visitor_cancelled":
            setRequests((prev) => {
              const updated = prev.filter(
                (r) => r.request_id !== data.request_id,
              );
              prevCountRef.current = updated.length;
              return updated;
            });
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    },
    [onNewRequest],
  );

  const { sendJsonMessage, readyState } = useWebSocket(wsUrl, {
    onMessage,
    shouldReconnect: () => true,
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      /* Auto-reconnect handled by useWebSocket */
    }
  }, [readyState]);

  return { requests, setRequests, sendJsonMessage };
}
