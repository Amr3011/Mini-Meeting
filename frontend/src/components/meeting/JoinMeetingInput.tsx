import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { Input } from "../common/Input";

interface JoinMeetingInputProps {
  className?: string;
  showTitle?: boolean;
  showExamples?: boolean;
}

export function JoinMeetingInput({
  className = "",
  showTitle = true,
  showExamples = true,
}: JoinMeetingInputProps) {
  const navigate = useNavigate();
  const [meetingInput, setMeetingInput] = useState("");

  /**
   * Parse meeting code or URL from input
   * Returns the meeting code or null if invalid
   */
  const parseInput = (input: string): string | null => {
    // Trim whitespace
    const trimmed = input.trim();

    // Check if it's a meeting code format (xxx-xxxx-xxx)
    const codeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    if (codeRegex.test(trimmed)) {
      return trimmed;
    }

    // Check if it's a full URL
    try {
      const url = new URL(trimmed);
      const pathMatch = url.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
      if (pathMatch) {
        return pathMatch[1];
      }
    } catch {
      // Not a valid URL, continue
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
      // Navigate to the meeting lobby with the code
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

  return (
    <div className={className}>
      {showTitle && (
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Join a Meeting
        </h2>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            value={meetingInput}
            onChange={(e) => setMeetingInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter meeting code or link"
            className="w-full text-lg"
            aria-label="Meeting code or link input"
            aria-describedby="meeting-format-hint"
            hideValidationIcon={true}
            leftIcon={
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            showClearButton={meetingInput.length > 0}
            onClear={() => setMeetingInput("")}
          />
        </div>
        <div className="relative group sm:w-auto w-full">
          <Button
            variant="primary"
            size="lg"
            onClick={handleJoinMeeting}
            disabled={!isValidFormat()}
            className="sm:w-auto w-full"
            aria-label="Join meeting"
          >
            Join Meeting
          </Button>
          {!isValidFormat() && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Enter a valid meeting code or URL first
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Format Examples */}
      {showExamples && (
        <div className="mt-6 text-sm text-gray-500" id="meeting-format-hint">
          <p className="mb-2" role="note">Example formats:</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <code className="bg-gray-100 px-3 py-1 rounded text-xs sm:text-sm">
              https://mini-meeting/abc-defg-hij
            </code>
            <code className="bg-gray-100 px-3 py-1 rounded">or just "abc-defg-hij"</code>
          </div>
        </div>
      )}
    </div>
  );
}
