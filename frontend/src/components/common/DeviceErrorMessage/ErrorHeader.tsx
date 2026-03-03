import React from "react";

interface ErrorHeaderProps {
  icon: React.ReactNode;
  title: string;
  onDismiss?: () => void;
}

export const ErrorHeader: React.FC<ErrorHeaderProps> = ({
  icon,
  title,
  onDismiss,
}) => (
  <div className="flex items-start mb-4">
    <div className="shrink-0 w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center text-danger-600">
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss error message"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )}
  </div>
);
