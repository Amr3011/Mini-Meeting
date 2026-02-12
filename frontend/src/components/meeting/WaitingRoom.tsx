import React, { useEffect, useState, useCallback, useRef } from 'react';
import { checkLobbyStatus, cancelLobbyRequest, type LobbyStatusResponse } from '../../services/api/lobby.service';

interface WaitingRoomProps {
  requestId: string;
  meetingCode: string;
  displayName: string;
  onApproved: (tokenData: {
    token: string;
    url: string;
    room_name: string;
    identity: string;
    user_name: string;
  }) => void;
  onRejected: () => void;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  requestId,
  meetingCode,
  displayName,
  onApproved,
  onRejected,
  onCancel,
}) => {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [dots, setDots] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Poll for status
  const pollStatus = useCallback(async () => {
    try {
      const response: LobbyStatusResponse = await checkLobbyStatus(requestId, meetingCode);

      if (response.status === 'approved' && response.token) {
        setStatus('approved');
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        onApproved({
          token: response.token,
          url: response.url!,
          room_name: response.room_name!,
          identity: response.identity!,
          user_name: response.user_name!,
        });
      } else if (response.status === 'rejected') {
        setStatus('rejected');
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        onRejected();
      }
    } catch (err) {
      console.error('Failed to check lobby status:', err);
    }
  }, [requestId, meetingCode, onApproved, onRejected]);

  useEffect(() => {
    // Start polling every 2 seconds
    pollRef.current = setInterval(pollStatus, 2000);

    // Do an immediate check
    pollStatus();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [pollStatus]);

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          {/* Rejected icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">
            Request Denied
          </h2>
          <p className="text-gray-400 mb-6">
            The host didn't allow you to join this meeting.
          </p>

          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Animated waiting icon */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-brand-500/30 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Waiting for host to let you in{dots}
        </h2>

        {/* User avatar/initial */}
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-300 font-medium">{displayName}</span>
        </div>

        <p className="text-gray-400 text-sm mb-2">
          You'll join the meeting once the host approves your request.
        </p>

        <p className="text-gray-500 text-xs mb-6">
          Waiting for {formatTime(elapsedTime)}
        </p>

        {/* Subtle progress bar animation */}
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-brand-500 rounded-full animate-pulse w-1/2" />
        </div>

        <button
          onClick={async () => {
            try {
              await cancelLobbyRequest(requestId);
            } catch (err) {
              console.error('Failed to cancel lobby request:', err);
            }
            onCancel();
          }}
          className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
