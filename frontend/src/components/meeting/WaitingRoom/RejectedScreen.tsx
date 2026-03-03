interface RejectedScreenProps {
  redirectCountdown: number;
  onCancel: () => void;
}

export const RejectedScreen: React.FC<RejectedScreenProps> = ({
  redirectCountdown,
  onCancel,
}) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-400"
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
        </div>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Request Denied</h2>
      <p className="text-gray-400 mb-4">
        The host didn't allow you to join this meeting.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Redirecting in {redirectCountdown}s...
      </p>
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(redirectCountdown / 5) * 100}%` }}
        />
      </div>
      <button
        onClick={onCancel}
        className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
      >
        Go Back Now
      </button>
    </div>
  </div>
);
