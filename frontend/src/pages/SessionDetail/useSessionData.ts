import { useState, useEffect } from "react";
import { userService } from "../../services/api/user";
import type { SummarizerSession } from "../../types/user.types";

export const useSessionData = (id: string | undefined) => {
  const sessionId = Number(id);
  const isValid = id && !isNaN(sessionId);

  const [session, setSession] = useState<SummarizerSession | null>(null);
  const [isLoading, setIsLoading] = useState(isValid);
  const [error, setError] = useState<string | null>(
    isValid ? null : "Invalid session ID.",
  );

  useEffect(() => {
    if (!isValid) {
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    const loadSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userService.getSession(sessionId, controller.signal);
        if (mounted) {
          setSession(data);
        }
      } catch (err) {
        const error = err as { name?: string; message?: string };
        if (error.name === "CanceledError" || error.name === "AbortError")
          return;
        if (mounted) {
          setError(error.message || "Session not found.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isValid, sessionId]);

  return { session, isLoading, error };
};
