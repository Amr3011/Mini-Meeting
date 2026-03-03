import React from "react";
import { Button } from "../common/Button";

interface PermissionPromptProps {
  onAllow: () => void;
  onDismiss?: () => void;
}

/**
 * PermissionPrompt - Banner explaining why camera/mic access is needed
 * Shows before requesting permissions
 */
export const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  onAllow,
  onDismiss,
}) => {
  return (
    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg animate-slide-up">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
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
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Camera and Microphone Access Required
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            To join this meeting, we need access to your camera and microphone.
            Your browser will ask for permission in the next step.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              What to do next:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">1.</span>
                <span>
                  Click <strong>"Allow Access"</strong> button below
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">2.</span>
                <span>
                  Your browser will show a permission popup at the top
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">3.</span>
                <span>
                  Click <strong>"Allow"</strong> or <strong>"الموافقة"</strong>{" "}
                  in the browser popup
                </span>
              </li>
            </ul>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 text-xs text-gray-600 mb-4">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>
              Your privacy is important. We only access your devices during the
              meeting and never record without your consent.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onAllow}
              variant="primary"
              size="lg"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Allow Access
            </Button>
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="secondary"
                size="lg"
                className="text-gray-600"
              >
                Not Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
