import React, { useState } from "react";
import { TrackToggle, useMediaDeviceSelect } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useOutsideClick } from "./useOutsideClick";
import { DeviceMenu } from "./DeviceMenu";
import { ChevronDownIcon } from "./Icons";

export const MicrophoneControl: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useOutsideClick(() => setShowMenu(false));

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      kind: "audioinput",
    });

  return (
    <div className="relative flex" ref={menuRef}>
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon={true}
        style={
          {
            minWidth: "48px",
            minHeight: "48px",
            borderTopRightRadius: "0",
            borderBottomRightRadius: "0",
            borderRight: "none",
          } as React.CSSProperties
        }
      />

      <button
        className="lk-button flex items-center justify-center bg-(--lk-bg2) min-w-5.5 min-h-12 rounded-tl-none rounded-bl-none p-0 -ml-px"
        onClick={() => setShowMenu(!showMenu)}
        title="Select microphone device"
      >
        <ChevronDownIcon />
      </button>

      <DeviceMenu
        isOpen={showMenu}
        devices={devices}
        activeDeviceId={activeDeviceId || ""}
        onSelectDevice={setActiveMediaDevice}
        onClose={() => setShowMenu(false)}
        deviceType="microphone"
      />
    </div>
  );
};
