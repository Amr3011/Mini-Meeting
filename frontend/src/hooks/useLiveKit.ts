import { useState, useEffect } from 'react';
import { generateToken, type LiveKitTokenResponse } from '../services/api/livekit.service';

interface UseLiveKitOptions {
  meetingCode: string;
  userName?: string;
  autoConnect?: boolean;
}

interface UseLiveKitReturn {
  token: string | null;
  livekitUrl: string | null;
  roomName: string | null;
  identity: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook to manage LiveKit connection for a meeting
 * @param options - Configuration options
 * @returns LiveKit connection state and controls
 */
export const useLiveKit = (options: UseLiveKitOptions): UseLiveKitReturn => {
  const { meetingCode, userName, autoConnect = false } = options;

  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [identity, setIdentity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    if (!meetingCode) {
      setError('Meeting code is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: LiveKitTokenResponse = await generateToken(meetingCode, userName);

      setToken(response.token);
      setLivekitUrl(response.url);
      setRoomName(response.room_name);
      setIdentity(response.identity);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to connect to meeting';
      setError(errorMessage);
      console.error('LiveKit connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setToken(null);
    setLivekitUrl(null);
    setRoomName(null);
    setIdentity(null);
    setError(null);
  };

  useEffect(() => {
    if (autoConnect && meetingCode) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [meetingCode, autoConnect]);

  return {
    token,
    livekitUrl,
    roomName,
    identity,
    isLoading,
    error,
    connect,
    disconnect,
  };
};
