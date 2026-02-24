import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSummarizer } from "../../hooks/useSummarizer";
import { Toast } from "../common/Toast";

interface SummarizerControlsProps {
  meetingId: number;
  isAdmin: boolean;
  inline?: boolean; // For inline display in control bar
}

/**
 * Summarizer Controls Component
 * Allows meeting host to start/stop the AI summarizer
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
  const [showCapturedMessage, setShowCapturedMessage] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (session?.status === "CAPTURED") {
      setShowCapturedMessage(true);
      setShowToast(true); // Show toast when recording is complete
      const timer = setTimeout(() => {
        setShowCapturedMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCapturedMessage(false);
    }
  }, [session?.status]);

  // Only show to admin/host
  if (!isAdmin) {
    return null;
  }

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

  // Inline mode for control bar
  if (inline) {
    return (
      <>
        <button
          onClick={handleToggle}
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
            isActive
              ? "Stop Listening"
              : "AI will listen to summarize this meeting"
          }
        >
          {isLoading ? (
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ flexShrink: 0 }}
            />
          ) : isActive ? (
            <>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0 }}
              >
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span className="lk-button-label">Listening...</span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0 }}
              >
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <span className="lk-button-label">Summarize</span>
            </>
          )}
        </button>

        {/* Toast Notification */}
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

  // Panel mode - for embedding in Admin Controls
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Error message */}
      {error && (
        <div
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.2)",
            border: "1px solid rgba(220, 38, 38, 0.5)",
            color: "#fca5a5",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Status indicator */}
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

      {/* Session info */}
      {showCapturedMessage && session && session.status === "CAPTURED" && (
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

      {/* Toggle button */}
      <button
        onClick={handleToggle}
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

      {/* Info tooltip */}
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

      {/* Toast Notification */}
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
