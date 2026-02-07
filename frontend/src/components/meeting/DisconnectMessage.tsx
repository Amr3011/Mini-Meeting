import React from "react";

interface DisconnectMessageProps {
  reason: string;
}

/**
 * DisconnectMessage component displays a user-friendly message
 * when a user is disconnected from a meeting
 */
export const DisconnectMessage: React.FC<DisconnectMessageProps> = ({ reason }) => {
  return (
    <div 
      className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4" 
      role="alert" 
      aria-live="assertive"
    >
      <div className="text-center max-w-md w-full">
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 animate-fade-in">
          <div className="mb-6 relative">
            <div className="w-20 h-20 mx-auto bg-warning-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-warning-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-warning-500/20 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-white text-2xl font-semibold mb-3">{reason}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <span>Redirecting</span>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
