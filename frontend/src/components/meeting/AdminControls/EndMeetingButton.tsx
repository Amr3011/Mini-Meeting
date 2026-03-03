import React from "react";
import type { EndMeetingButtonProps } from "./types";
import { EndMeetingIcon } from "./icons";
import "./AdminControls.styles.css";

export const EndMeetingButton: React.FC<EndMeetingButtonProps> = ({
  onEndMeeting,
  isEndingMeeting,
  showConfirm,
  onShowConfirm,
}) => {
  const handleClick = async () => {
    if (!showConfirm) {
      onShowConfirm(true);
      return;
    }
    await onEndMeeting();
  };

  if (showConfirm) {
    return (
      <div className="confirm-container">
        <p className="confirm-text">
          Are you sure? This will disconnect all participants.
        </p>
        <div className="confirm-buttons">
          <button
            onClick={handleClick}
            disabled={isEndingMeeting}
            className="end-meeting-btn"
          >
            <EndMeetingIcon />
            <span>{isEndingMeeting ? "Ending..." : "Confirm End"}</span>
          </button>
          <button
            onClick={() => onShowConfirm(false)}
            disabled={isEndingMeeting}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="end-meeting-btn end-meeting-btn-full"
    >
      <EndMeetingIcon />
      <span>End Meeting for All</span>
    </button>
  );
};
