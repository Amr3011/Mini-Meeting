import { useState, useEffect } from "react";
import { meetingService } from "../../../services/api/meeting.service";
import type { Meeting } from "../../../types/meeting.types";

export const useCreateMeeting = (isOpen: boolean) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateMeeting = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newMeeting = await meetingService.createMeeting();
      setMeeting(newMeeting);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to create meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (meeting?.meeting_link) {
      try {
        await navigator.clipboard.writeText(meeting.meeting_link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const reset = () => {
    setMeeting(null);
    setError(null);
    setCopied(false);
  };

  useEffect(() => {
    if (isOpen && !meeting && !isLoading && !error) {
      handleCreateMeeting();
    }
  }, [isOpen, meeting, isLoading, error]);

  return {
    meeting,
    isLoading,
    error,
    copied,
    handleCreateMeeting,
    handleCopyLink,
    reset,
  };
};
