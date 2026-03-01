import React from "react";
import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export const ScreenShareButton: React.FC = () => (
  <TrackToggle
    source={Track.Source.ScreenShare}
    showIcon={true}
    style={
      {
        minWidth: "48px",
        minHeight: "48px",
      } as React.CSSProperties
    }
  />
);
