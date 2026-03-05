import React from "react";
import type { ParticipantItemProps } from "./types";
import { TrackControls } from "./TrackControls";
import { KickIcon } from "./icons";

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  role,
  onKick,
  onMuteTrack,
}) => {
  return (
    <div className="bg-gray-800 rounded-md p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-white text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap m-0">
              {participant.name || participant.identity}
            </p>
            {isLocal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded text-green-400 bg-green-400/20 font-medium">
                You
              </span>
            )}
            {role === "admin" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded text-blue-400 bg-blue-400/20 font-medium">
                Admin
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 m-0">{role}</p>
        </div>
        {!isLocal && (
          <button
            onClick={onKick}
            title="Kick participant"
            className="p-1.5 text-red-400 bg-transparent rounded hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            <KickIcon />
          </button>
        )}
      </div>

      <TrackControls
        participant={participant}
        isLocal={isLocal}
        onMuteTrack={onMuteTrack}
      />
    </div>
  );
};
