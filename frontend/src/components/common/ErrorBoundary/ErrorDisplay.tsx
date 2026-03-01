import { Button } from "../Button";

interface ErrorDisplayProps {
  error: Error | null;
  onReset: () => void;
}

/**
 * Error display component
 * Shows error message with reset and home buttons
 */
export const ErrorDisplay = ({ error, onReset }: ErrorDisplayProps) => (
  <div
    className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
    role="alert"
    aria-live="assertive"
  >
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-danger-600"
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

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Oops! Something went wrong
      </h2>

      <p className="text-gray-600 mb-6">
        We encountered an unexpected error. Don't worry, you can try refreshing
        the page or going back.
      </p>

      {import.meta.env.DEV && error && (
        <details className="text-left mb-6 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Error details (dev only)
          </summary>
          <pre className="text-xs text-danger-600 overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}

      <div className="flex gap-3 justify-center">
        <Button onClick={onReset} variant="secondary" aria-label="Try again">
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="primary"
          aria-label="Go to home page"
        >
          Go Home
        </Button>
      </div>
    </div>
  </div>
);
