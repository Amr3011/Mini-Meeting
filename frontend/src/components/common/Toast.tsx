import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

/**
 * Toast Notification Component
 * Shows a temporary notification message
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 5000,
  onClose,
  type = "success",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  const borderColor = {
    success: "border-green-600",
    error: "border-red-600",
    info: "border-blue-600",
  }[type];

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-slide-down">
      <div
        className={`${bgColor} ${borderColor} border-2 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-[500px]`}
      >
        {/* Icon */}
        {type === "success" && (
          <svg
            className="w-6 h-6 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* Message */}
        <p className="text-sm font-medium leading-relaxed">{message}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-auto shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
