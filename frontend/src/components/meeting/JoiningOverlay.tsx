import React from "react";

const JoiningOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Outer spinning ring */}
          <div className="absolute w-24 h-24 border-4 border-brand-600/30 rounded-full"></div>
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>

          {/* Inner pulsing circle */}
          <div className="relative w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-brand-500"
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
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          Joining meeting...
        </h3>
        <p className="text-gray-400 text-sm">
          Please wait while we connect you
        </p>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <div
            className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default JoiningOverlay;
