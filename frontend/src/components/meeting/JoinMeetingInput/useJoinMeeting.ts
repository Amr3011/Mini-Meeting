import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for joining meetings
 * Handles input parsing, validation, and navigation
 */
export function useJoinMeeting() {
  const navigate = useNavigate();
  const [meetingInput, setMeetingInput] = useState("");

  /**
   * Parse meeting code or URL from input
   * Returns the meeting code or null if invalid
   */
  const parseInput = (input: string): string | null => {
    const trimmed = input.trim();

    const codeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    if (codeRegex.test(trimmed)) {
      return trimmed;
    }

    try {
      const url = new URL(trimmed);
      const pathMatch = url.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
      if (pathMatch) {
        return pathMatch[1];
      }
    } catch {
      /* Invalid URL */
    }

    return null; // Invalid format
  };

  /**
   * Check if the input format is valid
   */
  const isValidFormat = (): boolean => {
    if (!meetingInput.trim()) return false;
    return parseInput(meetingInput) !== null;
  };

  /**
   * Handle joining a meeting
   */
  const handleJoinMeeting = () => {
    const meetingCode = parseInput(meetingInput);

    if (meetingCode) {
      navigate(`/${meetingCode}`);
    }
  };

  /**
   * Handle Enter key press in input field
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidFormat()) {
      handleJoinMeeting();
    }
  };

  return {
    meetingInput,
    setMeetingInput,
    isValidFormat,
    handleJoinMeeting,
    handleKeyDown,
  };
}
