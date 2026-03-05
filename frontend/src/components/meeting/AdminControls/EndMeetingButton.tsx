import React from "react";
import type { EndMeetingButtonProps } from "./types";
import { EndMeetingIcon } from "./icons";

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
      <div className="flex flex-col gap-2">
        <p className="text-xs text-yellow-400 m-0">
          Are you sure? This will disconnect all participants.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            disabled={isEndingMeeting}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <EndMeetingIcon />
            <span>{isEndingMeeting ? "Ending..." : "Confirm End"}</span>
          </button>
          <button
            onClick={() => onShowConfirm(false)}
            disabled={isEndingMeeting}
            className="flex-1 px-3 py-2 rounded-md cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "var(--lk-bg3)",
              color: "var(--lk-fg)",
              border: "1px solid var(--lk-border-color)",
            }}
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
      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-600 text-white rounded-md cursor-pointer text-sm font-medium hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      <EndMeetingIcon />
      <span>End Meeting for All</span>
    </button>
  );
};
