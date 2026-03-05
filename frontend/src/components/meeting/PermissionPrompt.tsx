import React from "react";

interface PermissionPromptProps {
  onAllow: () => void;
  onDismiss?: () => void;
}

/**
 * PermissionPrompt - Modern dark modal for camera/mic permission
 */
export const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  onAllow,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-sm animate-scale-up rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "var(--lk-bg2)",
          border: "1px solid var(--lk-border-color)",
        }}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--lk-fg)" }}
              >
                Camera &amp; Microphone Access
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--lk-fg2)" }}>
                Permission required to join with audio/video
              </p>
            </div>
          </div>

          {/* Steps */}
          <div
            className="rounded-xl p-4 mb-5 space-y-3"
            style={{
              background: "var(--lk-bg)",
              border: "1px solid var(--lk-border-color)",
            }}
          >
            {[
              {
                n: "1",
                text: (
                  <>
                    Click{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--lk-fg)" }}
                    >
                      "Allow Access"
                    </span>{" "}
                    below
                  </>
                ),
              },
              {
                n: "2",
                text: <>Browser shows a permission popup at the top</>,
              },
              {
                n: "3",
                text: (
                  <>
                    Click{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--lk-fg)" }}
                    >
                      "Allow"
                    </span>{" "}
                    in that popup
                  </>
                ),
              },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#818cf8",
                  }}
                >
                  {n}
                </span>
                <span className="text-sm" style={{ color: "var(--lk-fg2)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Privacy */}
          <div className="flex items-start gap-2 mb-5">
            <svg
              className="w-3.5 h-3.5 mt-0.5 shrink-0"
              style={{ color: "var(--lk-fg2)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span
              className="text-xs leading-relaxed"
              style={{ color: "var(--lk-fg2)" }}
            >
              We only use your devices during the meeting and never record
              without your consent.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onAllow}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Allow Access
            </button>

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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.54 8.46a5 5 0 010 7.07"
                  />
                </svg>
                Listen Only
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
