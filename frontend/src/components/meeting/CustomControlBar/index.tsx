import React from "react";
import { MicrophoneControl } from "./MicrophoneControl";
import { CameraControl } from "./CameraControl";
import { ScreenShareButton } from "./ScreenShareButton";
import { LeaveButton } from "./LeaveButton";

/**
 * Custom Control Bar Component
 * Media controls + Leave centered
 */
export const CustomControlBar: React.FC = () => {
  return (
    <div className="lk-control-bar responsive-control-bar justify-center">
      <div className="lk-button-group gap-2 flex-nowrap">
        <MicrophoneControl />
        <CameraControl />
        <ScreenShareButton />
        <LeaveButton />
      </div>
    </div>
  );
};
