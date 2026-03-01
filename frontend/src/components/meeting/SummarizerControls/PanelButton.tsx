import React from "react";
import { Loader2, Mic, MicOff } from "lucide-react";
import type { ToggleButtonProps } from "./types";

export const PanelButton: React.FC<ToggleButtonProps> = ({
  isActive,
  isLoading,
  onToggle,
}) => {
  return (
    <>
      <button
        onClick={onToggle}
        disabled={isLoading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "6px",
          fontWeight: 500,
          fontSize: "14px",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.5 : 1,
          backgroundColor: isActive ? "#dc2626" : "#3b82f6",
          color: "white",
        }}
        title={isActive ? "Stop Listening" : "Listen to Summarize"}
      >
        {isLoading ? (
          <Loader2
            style={{ width: "16px", height: "16px" }}
            className="animate-spin"
          />
        ) : isActive ? (
          <MicOff style={{ width: "16px", height: "16px" }} />
        ) : (
          <Mic style={{ width: "16px", height: "16px" }} />
        )}
        <span>
          {isLoading
            ? "Processing..."
            : isActive
              ? "Stop Listening"
              : "Listen to Summarize"}
        </span>
      </button>

      {!isActive && !isLoading && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--lk-fg2)",
            textAlign: "center",
          }}
        >
          AI will listen and summarize this meeting
        </div>
      )}
    </>
  );
};
