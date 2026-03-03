import React, { useState } from "react";
import { TrackToggle, useMediaDeviceSelect } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useOutsideClick } from "./useOutsideClick";
import { DeviceMenu } from "./DeviceMenu";
import { ChevronDownIcon } from "./Icons";

export const CameraControl: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useOutsideClick(() => setShowMenu(false));

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      kind: "videoinput",
    });

  return (
    <div style={{ position: "relative", display: "flex" }} ref={menuRef}>
      <TrackToggle
        source={Track.Source.Camera}
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
        className="lk-button"
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--lk-bg2)",
          minWidth: "22px",
          minHeight: "48px",
          borderTopLeftRadius: "0",
          borderBottomLeftRadius: "0",
          padding: "0",
          marginLeft: "-1px",
        }}
        title="Select camera device"
      >
        <ChevronDownIcon />
      </button>

      <DeviceMenu
        isOpen={showMenu}
        devices={devices}
        activeDeviceId={activeDeviceId || ""}
        onSelectDevice={setActiveMediaDevice}
        onClose={() => setShowMenu(false)}
        deviceType="camera"
      />
    </div>
  );
};
