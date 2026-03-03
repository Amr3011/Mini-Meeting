import { Input } from "../../common/Input";
import { useJoinMeeting } from "./useJoinMeeting";
import { SearchIcon } from "./SearchIcon";
import { JoinButton } from "./JoinButton";
import { FormatExamples } from "./FormatExamples";

interface JoinMeetingInputProps {
  className?: string;
  showTitle?: boolean;
  showExamples?: boolean;
}

/**
 * Component for joining a meeting via code or URL
 * Supports both meeting codes (xxx-xxxx-xxx) and full URLs
 */
export function JoinMeetingInput({
  className = "",
  showTitle = true,
  showExamples = true,
}: JoinMeetingInputProps) {
  const {
    meetingInput,
    setMeetingInput,
    isValidFormat,
    handleJoinMeeting,
    handleKeyDown,
  } = useJoinMeeting();

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
            leftIcon={<SearchIcon />}
            showClearButton={meetingInput.length > 0}
            onClear={() => setMeetingInput("")}
          />
        </div>

        <JoinButton
          isValidFormat={isValidFormat()}
          onJoin={handleJoinMeeting}
        />
      </div>

      {showExamples && <FormatExamples />}
    </div>
  );
}
