import React from "react";
import { useSummarizer } from "../../../hooks/useSummarizer";
import { Toast } from "../../common/Toast";
import { InlineButton } from "./InlineButton";
import { PanelButton } from "./PanelButton";
import { StatusIndicator } from "./StatusIndicator";
import { ErrorDisplay } from "./ErrorDisplay";
import { useToastNotification } from "./useToastNotification";
import type { SummarizerControlsProps } from "./types";

/**
 * Summarizer controls component
 * Allows admins to start/stop meeting recording and summarization
 */
export const SummarizerControls: React.FC<SummarizerControlsProps> = ({
  meetingId,
  isAdmin,
  inline = false,
}) => {
  const {
    session,
    isActive,
    isLoading,
    error,
    startSummarizer,
    stopSummarizer,
  } = useSummarizer();

  const { showCapturedMessage, showToast, setShowToast } = useToastNotification(
    session?.status,
  );

  if (!isAdmin) return null;

  const handleToggle = async () => {
    try {
      if (isActive) {
        await stopSummarizer(meetingId);
      } else {
        await startSummarizer(meetingId);
      }
    } catch (err) {
      console.error("Summarizer toggle error:", err);
    }
  };

  if (inline) {
    return (
      <>
        <InlineButton
          isActive={isActive}
          isLoading={isLoading}
          onToggle={handleToggle}
        />
        {showToast && (
          <Toast
            message="Recording complete! We will notify you when the summary is ready."
            duration={5000}
            onClose={() => setShowToast(false)}
            type="success"
          />
        )}
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {error && <ErrorDisplay error={error} />}

      <StatusIndicator
        isActive={isActive}
        showCapturedMessage={showCapturedMessage}
      />
      <PanelButton
        isActive={isActive}
        isLoading={isLoading}
        onToggle={handleToggle}
      />

      {showToast && (
        <Toast
          message="Recording complete! We will notify you when the summary is ready."
          duration={5000}
          onClose={() => setShowToast(false)}
          type="success"
        />
      )}
    </div>
  );
};
