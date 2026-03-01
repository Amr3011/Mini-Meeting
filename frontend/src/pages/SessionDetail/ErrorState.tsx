import { Link } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
      <svg
        className="w-7 h-7 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h2 className="text-lg font-semibold text-gray-800 mb-1">
      Session not found
    </h2>
    <p className="text-gray-500 text-sm">{error}</p>
    <Link
      to="/sessions"
      className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
    >
      View all sessions
    </Link>
  </div>
);
