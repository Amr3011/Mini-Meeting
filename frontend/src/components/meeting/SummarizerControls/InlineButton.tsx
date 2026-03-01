import React from "react";
import { Loader2 } from "lucide-react";
import { AISparklesIcon } from "./AISparklesIcon";
import type { ToggleButtonProps } from "./types";

export const InlineButton: React.FC<ToggleButtonProps> = ({
  isActive,
  isLoading,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className="lk-button"
      style={{
        backgroundColor: isActive ? "var(--lk-accent)" : "var(--lk-bg2)",
        border: "1px solid var(--lk-border-color)",
        color: "var(--lk-fg)",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.5 : 1,
      }}
      title={
        isActive ? "Stop Listening" : "AI will listen to summarize this meeting"
      }
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" style={{ flexShrink: 0 }} />
      ) : (
        <>
          <AISparklesIcon />
          <span className="lk-button-label">
            {isActive ? "Listening..." : "Summarize"}
          </span>
        </>
      )}
    </button>
  );
};
