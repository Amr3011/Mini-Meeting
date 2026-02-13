import React, { useEffect, useState, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getAdminWsUrl, type LobbyPendingEntry } from '../../services/api/lobby.service';

interface LobbyRequestsProps {
  meetingCode: string;
  isAdmin: boolean;
}

export const LobbyRequests: React.FC<LobbyRequestsProps> = ({
  meetingCode,
  isAdmin,
}) => {
  const [requests, setRequests] = useState<LobbyPendingEntry[]>([]);
  const [respondingTo, setRespondingTo] = useState<Set<string>>(new Set());
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const prevCountRef = useRef(0);

  // Build WebSocket URL (only connect if admin)
  const wsUrl = isAdmin ? getAdminWsUrl(meetingCode) : null;

  // Handle incoming WebSocket messages
  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'pending_requests':
            // Initial list of pending requests on connect
            setRequests(data.requests || []);
            prevCountRef.current = (data.requests || []).length;
            break;

          case 'new_request':
            // A new visitor is waiting
            setRequests((prev) => {
              const updated = [...prev, data.request];
              // Show notification
              if (updated.length > prevCountRef.current) {
                setHasNewRequests(true);
                setTimeout(() => setHasNewRequests(false), 3000);
              }
              prevCountRef.current = updated.length;
              return updated;
            });
            break;

          case 'request_resolved':
          case 'visitor_cancelled':
            // Remove from list
            setRequests((prev) => {
              const updated = prev.filter((r) => r.request_id !== data.request_id);
              prevCountRef.current = updated.length;
              return updated;
            });
            break;
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    },
    []
  );

  const { sendJsonMessage, readyState } = useWebSocket(wsUrl, {
    onMessage,
    shouldReconnect: () => true,
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
  });

  // Reset on disconnect
  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      // Will reconnect automatically; pending_requests will be sent again on connect
    }
  }, [readyState]);

  const handleRespond = (requestId: string, action: 'approve' | 'reject') => {
    setRespondingTo((prev) => new Set(prev).add(requestId));

    // Send via WebSocket
    sendJsonMessage({
      type: 'respond',
      request_id: requestId,
      action,
    });

    // Optimistically remove from list
    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));

    setRespondingTo((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
  };

  const handleAdmitAll = () => {
    for (const req of requests) {
      handleRespond(req.request_id, 'approve');
    }
  };

  if (!isAdmin || requests.length === 0) return null;

  return (
    <>
      {/* Notification toast */}
      {hasNewRequests && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium">
              Someone is waiting to join
            </span>
          </div>
        </div>
      )}

      {/* Lobby panel */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-96 max-w-[calc(100vw-2rem)]">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600/20 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {/* Badge */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              </div>
              <h3 className="text-white text-sm font-semibold">
                Waiting to join
              </h3>
            </div>

            {requests.length > 1 && (
              <button
                onClick={handleAdmitAll}
                className="text-xs px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
              >
                Admit all
              </button>
            )}
          </div>

          {/* Request list */}
          <div className="max-h-60 overflow-y-auto">
            {requests.map((req) => {
              const isLoading = respondingTo.has(req.request_id);
              return (
                <div
                  key={req.request_id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    {req.avatar_url ? (
                      <img
                        src={req.avatar_url}
                        alt={req.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {req.name}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">
                        {req.role}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => handleRespond(req.request_id, 'approve')}
                      disabled={isLoading}
                      className="p-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                      title="Admit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRespond(req.request_id, 'reject')}
                      disabled={isLoading}
                      className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                      title="Deny"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
