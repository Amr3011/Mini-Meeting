import React from "react";
import {
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { CustomParticipantTile } from "../CustomParticipantTile";

interface VideoLayoutProps {
  tracks: TrackReferenceOrPlaceholder[];
  hasScreenShare: boolean;
}

export const VideoLayout: React.FC<VideoLayoutProps> = ({
  tracks,
  hasScreenShare,
}) => {
  if (hasScreenShare) {
    return (
      <FocusLayoutContainer>
        <CarouselLayout tracks={tracks}>
          <CustomParticipantTile />
        </CarouselLayout>
        <FocusLayout
          trackRef={tracks.find((t) => t.source === Track.Source.ScreenShare)}
        />
      </FocusLayoutContainer>
    );
  }

  return (
    <GridLayout tracks={tracks}>
      <CustomParticipantTile />
    </GridLayout>
  );
};
