import React from "react";
import { errorConfigs } from "./errorConfigs";

interface DeviceErrorMessageProps {
  type: "access-denied" | "not-found" | "generic";
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * DeviceErrorMessage - Modern dark modal for device access errors
 */
export const DeviceErrorMessage: React.FC<DeviceErrorMessageProps> = ({
  type,
  onRetry,
  onDismiss,
}) => {
  const content = errorConfigs[type] || errorConfigs["generic"];

  return (
    <div
      className="w-full max-w-sm animate-scale-up rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "var(--lk-bg2)",
        border: "1px solid var(--lk-border-color)",
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Header gradient bar */}
      <div className="h-1 w-full bg-linear-to-r from-red-500 via-orange-500 to-amber-500" />

      <div className="p-6">
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
          >
            {content.icon}
          </div>
          <div className="flex-1">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--lk-fg)" }}
            >
              {content.title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--lk-fg2)" }}>
              {content.message}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--lk-fg2)", background: "transparent" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--lk-bg3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              aria-label="Dismiss"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div
          className="rounded-xl p-4 mb-5 space-y-3"
          style={{
            background: "var(--lk-bg)",
            border: "1px solid var(--lk-border-color)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--lk-fg2)" }}
          >
            How to fix this
          </p>
          {content.instructions.map((instruction: string, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm leading-relaxed"
                style={{ color: "var(--lk-fg2)" }}
              >
                {instruction}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
              }}
              aria-label="Retry device access"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: "var(--lk-bg)",
                color: "var(--lk-fg2)",
                border: "1px solid var(--lk-border-color)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--lk-fg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--lk-fg2)")
              }
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
