import { useState, useCallback } from "react";
import { meetingService } from "../services/api/meeting.service";
import type { SummarizerSession } from "../types/meeting.types";

interface UseSummarizerReturn {
  session: SummarizerSession | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  startSummarizer: (meetingId: number) => Promise<void>;
  stopSummarizer: (meetingId: number) => Promise<void>;
}

/**
 * Hook for managing meeting summarizer state
 */
export const useSummarizer = (): UseSummarizerReturn => {
  const [session, setSession] = useState<SummarizerSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSummarizer = useCallback(async (meetingId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await meetingService.startSummarizer(meetingId);
      setSession(newSession);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || "Failed to start summarizer";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopSummarizer = useCallback(async (meetingId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSession = await meetingService.stopSummarizer(meetingId);
      setSession(updatedSession);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || "Failed to stop summarizer";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isActive = session?.status === "STARTED";

  return {
    session,
    isActive,
    isLoading,
    error,
    startSummarizer,
    stopSummarizer,
  };
};
