import { useEffect, useState } from "react";

interface ResendCodeButtonProps {
  onResend: () => Promise<void>;
  initialTimer?: number;
}

export const ResendCodeButton: React.FC<ResendCodeButtonProps> = ({ onResend, initialTimer = 0 }) => {
  const [resendTimer, setResendTimer] = useState(initialTimer);
  const [isResending, setIsResending] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setResendTimer(60); // Reset timer to 60 seconds after successful resend
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
      {resendTimer > 0 ? (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            {/* Background circle */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - resendTimer / 60)}`}
                className="text-brand-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
              {resendTimer}
            </span>
          </div>
          <span className="text-sm text-gray-600">Wait before resending</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isResending ? "Sending..." : "Resend code"}
        </button>
      )}
    </div>
  );
};
