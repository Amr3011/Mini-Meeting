import React from "react";
import type { StatusIndicatorProps } from "./types";

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isActive,
  showCapturedMessage,
}) => {
  return (
    <>
      {isActive && (
        <div
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            border: "1px solid rgba(34, 197, 94, 0.5)",
            color: "#86efac",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#22c55e",
              borderRadius: "50%",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          Recording for summary
        </div>
      )}

      {showCapturedMessage && (
        <div
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
            color: "#93c5fd",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          ✓ Recording complete - we will notify you when the summary is ready
        </div>
      )}
    </>
  );
};
