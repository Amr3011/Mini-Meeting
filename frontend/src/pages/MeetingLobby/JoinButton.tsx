import React from "react";
import { Button } from "../../components/common/Button";
import type { JoinButtonProps } from "./types";

export const JoinButton: React.FC<JoinButtonProps> = ({
  isJoining,
  permissionsGranted,
  listenerMode,
  displayName,
  isAuthenticated,
  onClick,
}) => {
  const canJoin = permissionsGranted || listenerMode;
  const isDisabled =
    isJoining || !canJoin || (!isAuthenticated && !displayName.trim());

  return (
    <div className="relative group mt-2">
      <Button
        variant={listenerMode && !permissionsGranted ? "secondary" : "primary"}
        size="lg"
        fullWidth
        onClick={onClick}
        disabled={isDisabled}
        isLoading={isJoining}
      >
        {isJoining
          ? "Joining..."
          : listenerMode && !permissionsGranted
            ? "Join as Listener"
            : "Join Now"}
      </Button>
      {!isAuthenticated && !displayName.trim() && canJoin && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          Enter your name first
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};
