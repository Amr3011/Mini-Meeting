import React from "react";
import { useRoomContext } from "@livekit/components-react";
import { LeaveIcon } from "./Icons";

export const LeaveButton: React.FC = () => {
  const room = useRoomContext();

  return (
    <button
      className="lk-button lk-disconnect-button"
      onClick={() => room?.disconnect()}
      style={{
        backgroundColor: "var(--lk-danger-color, #dc2626)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "48px",
        minHeight: "48px",
      }}
      title="Leave Meeting"
    >
      <LeaveIcon />
    </button>
  );
};
