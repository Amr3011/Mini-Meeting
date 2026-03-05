import React, { useState } from "react";
import { useMediaDeviceSelect } from "@livekit/components-react";
import { useOutsideClick } from "./useOutsideClick";
import { DeviceMenu } from "./DeviceMenu";
import { ChevronDownIcon, SpeakerButtonIcon } from "./Icons";

/**
 * Speaker (audio output) selector — no microphone toggle, just device pick.
 * Uses audiooutput enumeration which does NOT require mic/camera permission.
 */
export const SpeakerControl: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useOutsideClick(() => setShowMenu(false));

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind: "audiooutput" });

  return (
    <div className="relative flex" ref={menuRef}>
      {/* Static "speaker" indicator — not a toggle, just shows current state */}
      <div
        className="lk-button flex items-center justify-center"
        style={{
          minWidth: "48px",
          minHeight: "48px",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: "none",
          cursor: "default",
          pointerEvents: "none",
        }}
        title="Speaker output"
      >
        <SpeakerButtonIcon />
      </div>

      <button
        className="lk-button flex items-center justify-center bg-(--lk-bg2) min-w-5.5 min-h-12 rounded-tl-none rounded-bl-none p-0 -ml-px"
        onClick={() => setShowMenu(!showMenu)}
        title="Select speaker device"
      >
        <ChevronDownIcon />
      </button>

      <DeviceMenu
        isOpen={showMenu}
        devices={devices}
        activeDeviceId={activeDeviceId || ""}
        onSelectDevice={(id) => {
          setActiveMediaDevice(id);
          setShowMenu(false);
        }}
        onClose={() => setShowMenu(false)}
        deviceType="speaker"
      />
    </div>
  );
};
