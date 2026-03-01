import type { ErrorMessageProps } from "./types";

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
}) => (
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
