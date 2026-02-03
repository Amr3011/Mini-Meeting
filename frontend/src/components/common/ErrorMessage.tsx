import { useCallback, useEffect, useState } from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 animate-slide-down">
      <div className="flex items-start">
        <div className="shrink-0">
          <svg
            className="h-5 w-5 text-danger-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-danger-800 font-medium">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-danger-800 hover:text-danger-900 underline transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast Notification Component
interface ToastProps {
  id: string;
  type?: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

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

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, handleClose]);

  const typeConfig = {
    success: {
      bgColor: "bg-white",
      borderColor: "border-success-500",
      iconColor: "text-success-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bgColor: "bg-white",
      borderColor: "border-danger-500",
      iconColor: "text-danger-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bgColor: "bg-white",
      borderColor: "border-warning-500",
      iconColor: "text-warning-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bgColor: "bg-white",
      borderColor: "border-brand-500",
      iconColor: "text-brand-500",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        ${config.bgColor} 
        ${config.borderColor}
        border-l-4 rounded-lg shadow-xl p-4 mb-3 w-full max-w-md
        transition-all duration-300 
        ${isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0 animate-slide-in-right"}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
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

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.borderColor.replace('border', 'bg')} transition-all`}
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, "onClose">>;
  onClose: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = "top-right",
}) => {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
