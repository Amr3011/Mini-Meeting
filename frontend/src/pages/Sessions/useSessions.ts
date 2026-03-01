import { useState, useEffect, useCallback } from "react";
import { userService } from "../../services/api/user";
import type { SummarizerSessionList } from "../../types/user.types";

export const useSessions = (page: number, pageSize: number) => {
  const [sessions, setSessions] = useState<SummarizerSessionList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await userService.getSessions(page, pageSize, signal);
        setSessions(response.data);
        setTotalPages(response.total_pages);
      } catch (error) {
        const err = error as { name?: string };
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSessions(controller.signal);
    return () => controller.abort();
  }, [fetchSessions]);

  return { sessions, isLoading, totalPages };
};
