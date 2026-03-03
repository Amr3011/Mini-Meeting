import React from "react";
import { Button } from "../../components/common/Button";
import type { PermissionButtonProps } from "./types";

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  onRequestPermissions,
}) => {
  return (
    <div className="pt-2">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onRequestPermissions}
        className="bg-brand-600 hover:bg-brand-700"
      >
        <svg
          className="w-5 h-5 mr-2 inline-block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Allow Camera & Microphone
      </Button>
      <p className="text-xs text-center text-gray-400 mt-2">
        Tap to grant camera and microphone permissions
      </p>
    </div>
  );
};
