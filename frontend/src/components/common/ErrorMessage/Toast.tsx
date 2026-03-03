import { useState } from "react";
import type { ToastProps } from "./types";
import { toastTypeConfig } from "./toastConfig";
import { useToastTimer } from "./useToastTimer";

export const Toast: React.FC<ToastProps> = ({
  id,
  type = "info",
  message,
  description,
  duration = 5000,
  onClose,
  action,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  useToastTimer(duration, handleClose);

  const config = toastTypeConfig[type];

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor}
        border-l-4 rounded-lg shadow-xl p-4 mb-3 w-full max-w-md
        transition-all duration-300 
        ${isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0 animate-slide-in-right"}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 ${config.iconColor}`}>{config.icon}</div>
        <div className="flex-1 pt-0.5">
          <p className="font-semibold text-gray-900">{message}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
      </div>
      {duration > 0 && (
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.borderColor.replace("border", "bg")} transition-all`}
            style={{ animation: `shrink ${duration}ms linear` }}
          />
        </div>
      )}
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};
