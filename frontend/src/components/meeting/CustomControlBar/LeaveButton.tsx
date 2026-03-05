import React from "react";
import { useRoomContext } from "@livekit/components-react";
import { LeaveIcon } from "./Icons";

export const LeaveButton: React.FC = () => {
  const room = useRoomContext();

  return (
    <button
      className="lk-button lk-disconnect-button bg-(--lk-danger-color,#dc2626) text-white flex items-center justify-center min-w-12 min-h-12"
      onClick={() => room?.disconnect()}
      title="Leave Meeting"
    >
      <LeaveIcon />
    </button>
  );
};
