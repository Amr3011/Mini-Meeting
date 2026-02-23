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

  // Original floating mode
  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm max-w-xs">
              {error}
            </div>
          )}

          {/* Status indicator */}
          {isActive && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Recording for summary
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
              group relative flex items-center gap-3 px-5 py-3 rounded-xl font-medium
              transition-all duration-200 shadow-lg
              ${
                isActive
                  ? "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:scale-105"}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isActive ? "Stop Listening" : "Listen to Summarize"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isActive ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              {isLoading
                ? "Processing..."
                : isActive
                  ? "Stop Listening"
                  : "Listen to Summarize"}
            </span>
          </button>

          {/* Info tooltip */}
          {!isActive && !isLoading && (
            <div className="text-xs text-gray-400 max-w-xs text-right">
              AI will listen to summarize this meeting
            </div>
          )}

          {/* Session info */}
          {showCapturedMessage && session && session.status === "CAPTURED" && (
            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-lg text-sm">
              ✓ Recording complete we will notify you when the summary is ready
            </div>
          )}
        </div>
      </div>

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
};
