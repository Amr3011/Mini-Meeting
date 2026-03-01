import { ReadyState } from "react-use-websocket";

interface PendingScreenProps {
  dots: string;
  displayName: string;
  elapsedTime: string;
  readyState: ReadyState;
  onCancel: () => void;
}

export const PendingScreen: React.FC<PendingScreenProps> = ({
  dots,
  displayName,
  elapsedTime,
  readyState,
  onCancel,
}) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-brand-500/30 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Waiting for host to let you in{dots}
      </h2>
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-gray-300 font-medium">{displayName}</span>
      </div>
      <p className="text-gray-400 text-sm mb-2">
        You'll join the meeting once the host approves your request.
      </p>
      <p className="text-gray-500 text-xs mb-6">Waiting for {elapsedTime}</p>
      {readyState !== ReadyState.OPEN && (
        <p className="text-yellow-400 text-xs mb-2">Reconnecting...</p>
      )}
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-brand-500 rounded-full animate-pulse w-1/2" />
      </div>
      <button
        onClick={onCancel}
        className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
      >
        Cancel
      </button>
    </div>
  </div>
);
