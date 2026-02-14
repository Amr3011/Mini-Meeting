import { useState, useEffect, useCallback } from 'react';
import { generateToken, type LiveKitTokenResponse } from '../services/api/livekit.service';
import type { AxiosError } from 'axios';

interface UseLiveKitOptions {
  meetingCode: string;
  userName?: string;
  autoConnect?: boolean;
}

interface UseLiveKitReturn {
  token: string | null;
  livekitUrl: string | null;
  roomCode: string | null;
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
  const [roomCode, setroomCode] = useState<string | null>(null);
  const [identity, setIdentity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
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
      setroomCode(response.room_code);
      setIdentity(response.identity);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'Failed to connect to meeting';
      setError(errorMessage);
      console.error('LiveKit connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingCode, userName]);

  const disconnect = useCallback(() => {
    setToken(null);
    setLivekitUrl(null);
    setroomCode(null);
    setIdentity(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (autoConnect && meetingCode) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [meetingCode, autoConnect, connect, disconnect]);

  return {
    token,
    livekitUrl,
    roomCode,
    identity,
    isLoading,
    error,
    connect,
    disconnect,
  };
};
