interface DashboardActionsProps {
  onStartMeeting: () => void;
  onCreateMeeting: () => void;
  isStartingMeeting: boolean;
}

/**
 * Dashboard quick action buttons
 * Start instant meeting or schedule meeting for later
 */
export const DashboardActions = ({
  onStartMeeting,
  onCreateMeeting,
  isStartingMeeting,
}: DashboardActionsProps) => (
  <div className="mt-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={onStartMeeting}
        disabled={isStartingMeeting}
        className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-blue-600"
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
          <span className="ml-3 text-lg font-medium text-gray-900">
            {isStartingMeeting ? "Starting..." : "Start New Meeting"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Create a new video meeting instantly
        </p>
      </button>

      <button
        onClick={onCreateMeeting}
        className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="ml-3 text-lg font-medium text-gray-900">
            Create Meeting
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">Create Meeting for later</p>
      </button>
    </div>
  </div>
);
