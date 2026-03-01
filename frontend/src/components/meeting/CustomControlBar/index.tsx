import React from "react";
import { MicrophoneControl } from "./MicrophoneControl";
import { CameraControl } from "./CameraControl";
import { ScreenShareButton } from "./ScreenShareButton";
import { LeaveButton } from "./LeaveButton";
import "./CustomControlBar.css";

/**
 * Custom Control Bar Component
 * Media controls + Leave centered
 */
export const CustomControlBar: React.FC = () => {
  return (
    <div
      className="lk-control-bar responsive-control-bar"
      style={{ justifyContent: "center" }}
    >
      <div
        className="lk-button-group"
        style={{ gap: "8px", flexWrap: "nowrap" }}
      >
        <MicrophoneControl />
        <CameraControl />
        <ScreenShareButton />
        <LeaveButton />
      </div>
    </div>
  );
};
